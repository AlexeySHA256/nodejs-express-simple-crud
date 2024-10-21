import { NotFoundError, UniqueViolationError } from "../../core/repositoryErrors.js";
import TimeDuration from "../../core/timeDuration.js";
import { serverUrl } from "../../server.js";
import { TokensRepository, UsersRepository } from "../repository.js";
import { Token, TokenScopes, User } from "./models.js";

export class UserAlreadyExistsError extends Error {
    constructor() {
        super("User with this email already exists")
    }
}

export class InvalidCredentialsError extends Error {
    constructor() {
        super("Invalid email or password")
    }
}

export class ExpiredTokenError extends Error {
    constructor() {
        super("Token has expired")
    }
}

interface Hasher {
    hash(password: string): Promise<string>;
    compare(password: string, hashedPassword: string): Promise<boolean>;
}

interface MailProvider {
    sendMail(to: string, subject: string, text: string): Promise<any>;
}

export class UsersService {
    usersRepo: UsersRepository;
    tokensRepo: TokensRepository;
    private _hasher: Hasher;
    private _mailer: MailProvider; 
    constructor(hasher: Hasher, mailer: MailProvider) {
        this.usersRepo = new UsersRepository();
        this.tokensRepo = new TokensRepository();
        this._hasher = hasher;
        this._mailer = mailer;
    }

    listUsers(limit?: number): Promise<User[]> {
        return this.usersRepo.listUsers(limit)
    }

    async signUp(firstName: string, lastName: string, email: string, password: string): Promise<User> {
        return this._hasher.hash(password).then(async (hashedPassword) => {
            return this.usersRepo.createUser(firstName, lastName, email, hashedPassword)
                .then(async (user) => {
                    const { fullName, email, id } = user;
                    if (!process.env.ACTIVATION_TOKEN_TTL) {
                        throw new Error('ACTIVATION_TOKEN_TTL is not defined');
                    }
                    const activationToken = await this.tokensRepo.generateAndCreateToken(id, new TimeDuration(process.env.ACTIVATION_TOKEN_TTL).durationMs, TokenScopes.ACTIVATION);
                    const activationUrl = `${serverUrl}/api/v1/users/activate/`;
                    await this._mailer.sendMail(
                        email,
                        "Welcome to NodeJSCrud API!",
                        `Hello, ${fullName}! You have successfully signed up for NodeJSCrud API.
                        Please send request with your token to url below to activate your account:
                        "PUT '${activationUrl}'"
                        Your activation token is: ${activationToken.plainText}`
                    );
                    return user;
                })
                .catch((err) => {
                    if (err instanceof UniqueViolationError) {
                        console.log(`User with email ${email} already exists`);
                        throw new UserAlreadyExistsError();
                    }
                    console.log('Unable to create user', err);
                    throw err;
                });
        })
    }

    async signIn(email: string, password: string): Promise<Token> {
        return this.usersRepo
            .getUser({ email })
            .then(async (user) => {
                const passwordMatch = await this._hasher.compare(password, user.passwordHash);
                if (!passwordMatch) {
                    throw new InvalidCredentialsError();
                }
                if (!process.env.AUTHORIZATION_TOKEN_TTL) {
                    throw new Error('AUTHORIZATION_TOKEN_TTL is not defined');
                }
                const token = await this.tokensRepo.generateAndCreateToken(
                    user.id, new TimeDuration(process.env.AUTHORIZATION_TOKEN_TTL).durationMs
                );
                return token;
            }).catch((err) => {
                if (err instanceof NotFoundError) {
                    throw new InvalidCredentialsError();
                }
                throw err;
            });
    }

    async activateUser(plainToken: string): Promise<User> {
        const hash = Token.hashFromPlainText(plainToken);
        return this.tokensRepo.getToken({ hash, scope: TokenScopes.ACTIVATION, withUser: true })
            .then((token) => {
                if (token.isExpired()) {
                    throw new ExpiredTokenError();
                }
                return this.usersRepo.updateUser(token.userId, { isActive: true });
            })
    }
}