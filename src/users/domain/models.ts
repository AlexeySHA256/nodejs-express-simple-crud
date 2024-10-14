import { Post } from "../../posts/domain/models.js";

export class User {
    id!: number;
    firstName!: string;
    lastName!: string;
    email!: string;
    posts?: Post[];
    password!: string;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(id: number, firstName: string, lastName: string, email: string, password: string, createdAt: Date, updatedAt: Date, posts?: Post[]) {
        Object.assign(this, { id, firstName, lastName, email, posts, password, createdAt, updatedAt });
    }

    static fromObject(obj: { id: number, firstName: string, lastName: string, email: string, posts?: Post[], password: string, createdAt: Date, updatedAt: Date }): User {
        return new User(obj.id, obj.firstName, obj.lastName, obj.email, obj.password, obj.createdAt, obj.updatedAt, obj.posts);
    }

    get fullName(): string {
        return this.firstName + " " + this.lastName;
    }
}