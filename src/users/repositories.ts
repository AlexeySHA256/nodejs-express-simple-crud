import { Prisma } from "@prisma/client";
import {
  NotFoundErrCode,
  prisma,
  UniqueViolationErrCode,
} from "../db/prisma.js";
import { Token, TokenScopes, UserRoles } from "./domain/models.js";
import { IUser } from "./domain/interfaces.js";
import {
  NotFoundError,
  UniqueViolationError,
} from "../core/repositoryErrors.js";
import { IUserCreateData } from "./domain/interfaces.js";

export class UsersRepositoryImpl {
  async listUsers(limit?: number): Promise<IUser[]> {
    return prisma.user
      .findMany({ take: limit })
      .then((users) => users);
  }

  async getUser(filters: { id?: number; email?: string }): Promise<IUser> {
    if (!filters.id && !filters.email) {
      throw new Error("Either id or email must be provided");
    }

    return prisma.user
      .findUniqueOrThrow({ where: { id: filters.id, email: filters.email } })
      .then((user) => ({ ...user, role: user.role as UserRoles }))
      .catch((err) => {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === NotFoundErrCode
        ) {
          throw new NotFoundError("User with this email wasn't found");
        }
        throw err;
      });
  }

  async createUser(data: IUserCreateData): Promise<IUser> {
    return prisma.user
      .create({ data: { ...data, passwordHash: data.password } })
      .catch((err) => {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === UniqueViolationErrCode
        ) {
          throw new UniqueViolationError("User with this email already exists");
        }
        throw err;
      });
  }

  async updateUser(id: number, data: IUser): Promise<IUser> {
    return prisma.user
      .update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash: data.passwordHash,
          isActive: data.isActive,
          role: data.role,
        },
      })
      .then((user) => ({ ...user, role: user.role as UserRoles }))
      .catch((err) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          switch (err.code) {
            case NotFoundErrCode:
              throw new NotFoundError(`User with ID ${id} does not exist.`);
            case UniqueViolationErrCode:
              throw new UniqueViolationError(
                `User with email ${data.email} already exists.`
              );
            default:
              break;
          }
        }
        throw err;
      });
  }
}

export class TokensRepositoryImpl {
  async createToken(data: {
    userId: number;
    scope: TokenScopes;
    expiry: Date;
    hash: string;
  }): Promise<Token> {
    return prisma.token.create({ data }).then(
      (token) =>
        new Token({
          ...token,
          scope: token.scope as TokenScopes,
          plainText: "",
        })
    );
  }

  async generateAndCreateToken(
    userId: number,
    ttlMs: number,
    scope: TokenScopes = TokenScopes.AUTHORIZATION
  ): Promise<Token> {
    const token = Token.generate(userId, ttlMs, scope);
    await this.createToken({
      userId: token.userId,
      scope: token.scope,
      expiry: token.expiry,
      hash: token.hash,
    });
    return token;
  }

  async getToken(options: {
    hash: string;
    scope: TokenScopes;
    withUser?: boolean;
  }): Promise<Token> {
    if (options.withUser === undefined) {
      options.withUser = false;
    }
    return prisma.token
      .findUniqueOrThrow({
        where: { hash: options.hash, scope: options.scope },
        include: { user: options.withUser },
      })
      .then(
        (token) =>
          new Token({
            ...token,
            scope: token.scope as TokenScopes,
            user: ({
              ...token.user,
              role: token.user.role,
            }),
            plainText: "",
          })
      )
      .catch((err) => {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === NotFoundErrCode
        ) {
          throw new NotFoundError("Token not found");
        }
        throw err;
      });
  }
}
