import { Post } from "../../posts/domain/models.js";
import crypto_ from "crypto";

export class User {
    id!: number;
    firstName!: string;
    lastName!: string;
    email!: string;
    posts?: Post[];
    passwordHash!: string;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(id: number, firstName: string, lastName: string, email: string, passwordHash: string, createdAt: Date, updatedAt: Date, posts?: Post[]) {
        Object.assign(this, { id, firstName, lastName, email, posts, passwordHash, createdAt, updatedAt });
    }

    static fromObject(obj: { id: number, firstName: string, lastName: string, email: string, posts?: Post[], passwordHash: string, createdAt: Date, updatedAt: Date }): User {
        return new User(obj.id, obj.firstName, obj.lastName, obj.email, obj.passwordHash, obj.createdAt, obj.updatedAt, obj.posts);
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
        tokenData.hash = crypto_.createHash("sha256").update(tokenData.plainText).digest("hex");
        return new Token(tokenData);
    }
}