import { Post } from "../../posts/domain/models.js";
import crypto_ from "crypto";

export class User {
    id!: number;
    firstName!: string;
    lastName!: string;
    email!: string;
    posts?: Post[];
    isActive!: boolean;
    passwordHash!: string;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(id: number, firstName: string, lastName: string, email: string, passwordHash: string, isActive: boolean, createdAt: Date, updatedAt: Date, posts?: Post[]) {
        Object.assign(this, { id, firstName, lastName, email, posts, passwordHash, isActive, createdAt, updatedAt });
    }

    static fromObject(obj: { id: number, firstName: string, lastName: string, email: string, isActive: boolean, posts?: Post[], passwordHash: string, createdAt: Date, updatedAt: Date }): User {
        return new User(obj.id, obj.firstName, obj.lastName, obj.email, obj.passwordHash, obj.isActive, obj.createdAt, obj.updatedAt, obj.posts);
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
    plainText?: string;
    hash?: string;
    userId!: number;
    expiry!: Date;
    user?: User;

    constructor(obj: { scope: TokenScopes, plainText?: string, hash?: string, userId: number, expiry: Date, user?: User }) {
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