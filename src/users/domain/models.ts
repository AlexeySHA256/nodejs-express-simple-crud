import crypto_ from "crypto";
import { IUser } from "./interfaces.js";

export const getUserFullname = (user: IUser) => user.firstName + " " + user.lastName

export enum UserRoles {
    USER = "USER",
    ADMIN = "ADMIN",
    DEV = "DEV"
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
    user?: IUser;

    constructor(obj: { scope: TokenScopes, plainText: string, hash: string, userId: number, expiry: Date, user?: IUser }) {
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
