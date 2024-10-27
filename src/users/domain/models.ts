import { Post } from "../../posts/domain/models.js";
import crypto_ from "crypto";

export enum UserRoles {
    USER = "USER",
    ADMIN = "ADMIN",
    DEV = "DEV"
}

export class User {
    id!: number;
    firstName!: string;
    lastName!: string;
    email!: string;
    role: UserRoles = UserRoles.USER;
    posts?: Post[];
    isActive!: boolean;
    passwordHash!: string;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(obj: { id: number, firstName: string, lastName: string, email: string, role: UserRoles, isActive: boolean, posts?: Post[], passwordHash: string, createdAt: Date, updatedAt: Date }) {
        Object.assign(this, obj);
    }

    get fullName(): string {
        return this.firstName + " " + this.lastName;
    }
}

export enum TokenScopes {
    AUTHORIZATION = "AUTHORIZATION",
    ACTIVATION = "ACTIVATION"
}

export class Token {
    scope: TokenScopes = TokenScopes.AUTHORIZATION;
    plainText!: string;
    hash!: string;
    userId!: number;
    expiry!: Date;
    user?: User;

    constructor(obj: { scope: TokenScopes, plainText: string, hash: string, userId: number, expiry: Date, user?: User }) {
        Object.assign(this, obj);
    }

    isExpired() {
        return Date.now() > this.expiry.getTime();
    }

    static hashFromPlainText(plainText: string) {
        return crypto_.createHash("sha256").update(plainText).digest("hex");
    }

    static generate(userId: number, ttlMs: number, scope: TokenScopes = TokenScopes.AUTHORIZATION) {
        const tokenData: { plainText: string, hash: string, userId: number, expiry: Date, scope: TokenScopes } = {
            userId,
            scope,
            expiry: new Date(Date.now() + ttlMs),
            plainText: "",
            hash: ""
        }
        const buffer = crypto_.randomBytes(16);
        tokenData.plainText = buffer.toString("hex");
        tokenData.hash = Token.hashFromPlainText(tokenData.plainText);
        return new Token(tokenData);
    }
}