import { Token, TokenScopes, User } from "./models.js";

export interface UserCreateData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface UsersStorageI {
    listUsers(limit?: number): Promise<User[]>;
    getUser(options: { id?: number, email?: string }): Promise<User>;
    createUser(data: UserCreateData): Promise<User>;
    updateUser(id: number, data: User): Promise<User>;
}

export interface TokensStorageI {
    generateAndCreateToken(userId: number, ttlMs: number, scope: TokenScopes): Promise<Token>;
    getToken(options: { hash: string, scope: TokenScopes, withUser?: boolean }): Promise<Token>;
}