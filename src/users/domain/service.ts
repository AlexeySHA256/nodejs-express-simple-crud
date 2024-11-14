import {
  NotFoundError,
  UniqueViolationError,
} from "../../core/repositoryErrors.js";
import TimeDuration from "../../core/timeDuration.js";
import { serverUrl } from "../../server.js";
import {
  TokensStorageI,
  UserCreateData,
  UsersStorageI,
} from "./interfaces.js";
import { Token, TokenScopes, User } from "./models.js";

export class UserAlreadyExistsError extends Error {
  constructor() {
    super("User with this email already exists");
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
  }
}

export class ExpiredTokenError extends Error {
  constructor() {
    super("Token has expired");
  }
}

interface HasherI {
  hash(password: string): Promise<string>;
  compare(password: string, hashedPassword: string): Promise<boolean>;
}

interface MailProviderI {
  sendMail(to: string, subject: string, text: string): Promise<any>;
}

export class UsersService {
  constructor(
    private hasher: HasherI,
    private mailer: MailProviderI,
    public usersRepo: UsersStorageI,
    public tokensRepo: TokensStorageI
  ) {
    this.usersRepo = usersRepo;
    this.tokensRepo = tokensRepo;
    this.hasher = hasher;
    this.mailer = mailer;
  }

  listUsers(limit?: number): Promise<User[]> {
    return this.usersRepo.listUsers(limit);
  }

  async signUp(userData: UserCreateData): Promise<User> {
    return this.hasher.hash(userData.password).then(async (hashedPassword) => {
      userData.password = hashedPassword;
      return this.usersRepo
        .createUser(userData)
        .then(async (user) => {
          const { fullName, email, id } = user;
          if (!process.env.ACTIVATION_TOKEN_TTL) {
            throw new Error("ACTIVATION_TOKEN_TTL is not defined");
          }
          const activationToken = await this.tokensRepo.generateAndCreateToken(
            id,
            new TimeDuration(process.env.ACTIVATION_TOKEN_TTL).durationMs,
            TokenScopes.ACTIVATION
          );
          const activationPage = `${serverUrl}/users/activate/`;
          await this.mailer.sendMail(
            email,
            "Welcome to NodeJSCrud API!",
            `Hello, ${fullName}! You have successfully signed up for NodeJSCrud API.
                        Follow the link below to activate your account: ${activationPage},
                        and enter the following token:
                        ${activationToken.plainText}`
          );
          return user;
        })
        .catch((err) => {
          if (err instanceof UniqueViolationError) {
            console.log(`User with email ${userData.email} already exists`);
            throw new UserAlreadyExistsError();
          }
          console.log("Unable to create user", err);
          throw err;
        });
    });
  }

  async signIn(email: string, password: string): Promise<Token> {
    return this.usersRepo
      .getUser({ email })
      .then(async (user) => {
        const passwordMatch = await this.hasher.compare(
          password,
          user.passwordHash
        );
        if (!passwordMatch) {
          throw new InvalidCredentialsError();
        }
        if (!process.env.AUTHORIZATION_TOKEN_TTL) {
          throw new Error("AUTHORIZATION_TOKEN_TTL is not defined");
        }
        const token = await this.tokensRepo.generateAndCreateToken(
          user.id,
          new TimeDuration(process.env.AUTHORIZATION_TOKEN_TTL).durationMs,
          TokenScopes.AUTHORIZATION
        );
        return token;
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          throw new InvalidCredentialsError();
        }
        throw err;
      });
  }

  async activateUser(plainToken: string): Promise<User> {
    const hash = Token.hashFromPlainText(plainToken);
    return this.tokensRepo
      .getToken({ hash, scope: TokenScopes.ACTIVATION, withUser: true })
      .then((token) => {
        if (token.isExpired()) {
          throw new ExpiredTokenError();
        }
        return this.usersRepo.getUser({ id: token.userId }).then((user) => {
          const updatedUser = new User({ ...user, isActive: true });
          return this.usersRepo.updateUser(user.id, updatedUser);
        })
      });
  }
}
