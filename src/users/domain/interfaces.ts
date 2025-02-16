import { Prisma } from "@prisma/client";
import { Token, TokenScopes } from "./models.js";

export type IUser = Prisma.UserGetPayload<{}>
export type IToken = Prisma.TokenGetPayload<{}>

export interface IUserCreateData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface UsersStorageI {
    listUsers(limit?: number): Promise<IUser[]>;
    getUser(options: { id?: number, email?: string }): Promise<IUser>;
    createUser(data: IUserCreateData): Promise<IUser>;
    updateUser(id: number, data: Partial<IUserCreateData>): Promise<IUser>;
}

export interface TokensStorageI {
    generateAndCreateToken(userId: number, ttlMs: number, scope: TokenScopes): Promise<Token>;
    getToken(options: { hash: string, scope: TokenScopes, withUser?: boolean }): Promise<Token>;
}
