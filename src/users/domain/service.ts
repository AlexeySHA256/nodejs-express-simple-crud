import { UsersRepository } from "../repository.js";
import { User } from "./models.js";


export class UsersService {
    usersRepo: UsersRepository;
    constructor() {
        this.usersRepo = new UsersRepository();
    }

    listUsers(limit?: number): Promise<User[]> {
        return this.usersRepo.listUsers(limit)
    }
}