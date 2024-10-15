import { UniqueViolationError } from "../../core/repositoryErrors.js";
import { UsersRepository } from "../repository.js";
import { User } from "./models.js";

export class UserAlreadyExistsError extends Error {
    constructor() {
        super("User with this email already exists")
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
    private _hasher: Hasher;
    private _mailer: MailProvider; 
    constructor(hasher: Hasher, mailer: MailProvider) {
        this.usersRepo = new UsersRepository();
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
                    const { fullName, email } = user;
                    await this._mailer.sendMail(
                        email,
                        "Welcome to NodeJSCrud API!",
                        `Hello, ${fullName}! You have successfully signed up for NodeJSCrud API.`
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
}