import { Prisma } from "@prisma/client";
import { NotFoundErrCode, prisma, UniqueViolationErrCode } from "../db/prisma.js";
import { User } from "./domain/models.js";
import { NotFoundError, UniqueViolationError } from "../core/repositoryErrors.js";


export class UsersRepository {
    async listUsers(limit?: number): Promise<User[]> {
        const options: Prisma.UserFindManyArgs = {}
        if (limit) {
            options.take = limit;
        }
        return prisma.user.findMany(options)
            .then((users) => users.map((user) => User.fromObject(user)));
    }

    async getUser(options: { id?: number, email?: string }): Promise<User> {
        if (!options.id && !options.email) {
            throw new Error("Either id or email must be provided");
        }
        const condition = options.id ? { id: options.id } : { email: options.email };
        return prisma.user.findUniqueOrThrow({ where: condition })
            .then((user) => User.fromObject(user))
            .catch((err) => {
                if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
                    throw new NotFoundError("User with this email already exists");
                }
                throw err;
            })
    }

    async createUser(firstName: string, lastName: string, email: string, passwordHash: string): Promise<User> {
        return prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                passwordHash,
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