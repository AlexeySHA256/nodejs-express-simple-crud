import { Prisma } from "@prisma/client";
import { prisma, UniqueViolationErrCode } from "../db/prisma.js";
import { User } from "./domain/models.js";
import { UniqueViolationError } from "../core/repositoryErrors.js";


export class UsersRepository {
    async listUsers(limit?: number): Promise<User[]> {
        const options: Prisma.UserFindManyArgs = {}
        if (limit) {
            options.take = limit;
        }
        return prisma.user.findMany(options)
            .then((users) => users.map((user) => User.fromObject(user)));
    }

    async createUser(firstName: string, lastName: string, email: string, passwordHash: string): Promise<User> {
        return prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: passwordHash,
            },
        })
           .then((user) => User.fromObject(user))
           .catch((err) => {
               if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === UniqueViolationErrCode) {
                   throw new UniqueViolationError("User with this email already exists");
               }
               throw err;
           });
    }
}