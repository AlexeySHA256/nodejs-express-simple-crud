import { UniqueViolationError } from "../../core/repositoryErrors.js";
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
                    const activationUrl = `${serverUrl}/users/activate/`;
                    const activationToken = Token.generate(
                        id,
                        new TimeDuration(process.env.ACTIVATION_TOKEN_TTL).durationMs,
                        TokenScopes.ACTIVATION
                    );
                    this.tokensRepo.createToken({ expiry: activationToken.expiry, hash: activationToken.hash as string, scope: activationToken.scope, userId: id });
                    await this._mailer.sendMail(
                        email,
                        "Welcome to NodeJSCrud API!",
                        `Hello, ${fullName}! You have successfully signed up for NodeJSCrud API.
                        Please click on the link below and enter the code to activate your account:
                        "${activationUrl}"
                        Your activation code is: ${activationToken.plainText}`
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

    async signIn(email: string, password: string): Promise<User> {
        return this.usersRepo
            .getUser({ email })
            .then(async (user) => {
                const passwordMatch = await this._hasher.compare(password, user.passwordHash);
                if (!passwordMatch) {
                    throw new InvalidCredentialsError();
                }
                return user;
            });
    }
}