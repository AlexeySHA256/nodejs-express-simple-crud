
// бизнес сущности

import { User } from "../../users/domain/models.js";

export class Post {
    id!: number;
    title!: string;
    body!: string;
    authorId!: number;
    author?: User;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(
        id: number, title: string, body: string, authorId: number,
        author: User | undefined = undefined, createdAt: Date, updatedAt: Date
    ) {
        Object.assign(this, { id, title, body, authorId, author, createdAt, updatedAt });
    }

    static fromObject(obj: { id: number, title: string, body: string, authorId: number, author?: User, createdAt: Date, updatedAt: Date }): Post {
        return new Post(obj.id, obj.title, obj.body, obj.authorId, obj.author, obj.createdAt, obj.updatedAt);
    }
}
