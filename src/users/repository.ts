import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { User } from "./domain/models.js";


export class UsersRepository {
    async listUsers(limit?: number): Promise<User[]> {
        const options: Prisma.UserFindManyArgs = {}
        if (limit) {
            options.take = limit;
        }
        return prisma.user.findMany(options)
            .then((users) => users.map((user) => User.fromObject(user)));
    }
}