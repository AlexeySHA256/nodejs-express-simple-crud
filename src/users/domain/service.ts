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

export class UsersService {
    usersRepo: UsersRepository;
    private _hasher: Hasher;
    constructor(hasher: Hasher) {
        this.usersRepo = new UsersRepository();
        this._hasher = hasher;
    }

    listUsers(limit?: number): Promise<User[]> {
        return this.usersRepo.listUsers(limit)
    }

    async signUp(firstName: string, lastName: string, email: string, password: string): Promise<User> {
        return this._hasher.hash(password).then(async (hashedPassword) => {
            return this.usersRepo.createUser(firstName, lastName, email, hashedPassword)
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