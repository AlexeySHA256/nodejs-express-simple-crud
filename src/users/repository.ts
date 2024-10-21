import { Prisma } from "@prisma/client";
import { NotFoundErrCode, prisma, UniqueViolationErrCode } from "../db/prisma.js";
import { Token, TokenScopes, User } from "./domain/models.js";
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
                    throw new NotFoundError("User with this email wasn't found");
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

    async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        return prisma.user.update({ where: { id }, data })
            .then((user) => User.fromObject(user))
            .catch((err) => {
                if (err instanceof Prisma.PrismaClientKnownRequestError) {
                    switch (err.code) {
                        case NotFoundErrCode:
                            throw new NotFoundError(`User with ID ${id} does not exist.`);
                        case UniqueViolationErrCode:
                            throw new UniqueViolationError(`User with email ${data.email} already exists.`);
                        default:
                            break;
                    }
                }
                throw err;
            })
    }
}

export class TokensRepository {
    async createToken(data: { userId: number, scope: TokenScopes, expiry: Date, hash: string}): Promise<Token> {
        return prisma.token.create({ data })
            .then((token) => new Token({ ...token, scope: token.scope as TokenScopes, plainText: "" }));
    }

    async generateAndCreateToken(userId: number, ttlMs: number, scope: TokenScopes = TokenScopes.AUTHORIZATION): Promise<Token> {
        const token = Token.generate(userId, ttlMs, scope);
        await this.createToken({ userId: token.userId, scope: token.scope, expiry: token.expiry, hash: token.hash });
        return token
    }

    async getToken(options: { hash: string, scope: TokenScopes, withUser: boolean }): Promise<Token> {
        return prisma.token.findUniqueOrThrow({ where: { hash: options.hash, scope: options.scope }, include: { user: options.withUser } })
            .then((token) => new Token({ ...token, scope: token.scope as TokenScopes, user: User.fromObject(token.user), plainText: "" }))
            .catch((err) => {
                if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
                    throw new NotFoundError("Token not found");
                }
                throw err;
            });
    }
}