
// бизнес сущности

import { User } from "../../users/domain/models.js";

export class Post {
    id!: number;
    title!: string;
    body!: string;
    authorId!: number;
    author?: User;
    comments?: Comment[];
    createdAt!: Date;
    updatedAt!: Date;

    constructor(obj: { id: number, title: string, body: string, authorId: number, author?: User, comments?: Comment[], createdAt: Date, updatedAt: Date }) {
        if (obj.comments === undefined) {
            obj.comments = [];
        }
        Object.assign(this, obj);
    }
}


export class Comment {
    id!: number;
    title!: string;
    content!: string;
    imageUrl!: string | null;
    authorId!: number;
    postId!: number;
    post?: Post;
    author?: User;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(
        obj: { id: number, title: string, content: string, imageUrl: string | null, authorId: number, postId: number,
        post?: Post, author?: User, createdAt: Date, updatedAt: Date }
    ) {
        Object.assign(this, obj);
    }
}