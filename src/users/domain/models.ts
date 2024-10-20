import { Post } from "../../posts/domain/models.js";

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

enum TokenScopes {
    Activation = "activation",
    Authorization = "authorization"
}

export class Token {
    scope!: TokenScopes;
    plainText!: string;
    hash!: string;
    userID!: string;
    user?: User;

    constructor(obj: { scope: TokenScopes, plainText: string, hash: string, userID: string, user?: User }) {
        Object.assign(this, obj);
    }
}