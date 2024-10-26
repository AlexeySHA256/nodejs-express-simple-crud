// бизнес сущности
export class Post {
    id;
    title;
    body;
    authorId;
    author;
    comments;
    createdAt;
    updatedAt;
    constructor(id, title, body, authorId, author = undefined, comments = [], createdAt, updatedAt) {
        Object.assign(this, { id, title, body, authorId, author, comments, createdAt, updatedAt });
    }
    static fromObject(obj) {
        if (obj.comments === undefined) {
            obj.comments = [];
        }
        return new Post(obj.id, obj.title, obj.body, obj.authorId, obj.author, obj.comments, obj.createdAt, obj.updatedAt);
    }
}
export class Comment {
    id;
    title;
    content;
    authorId;
    postId;
    post;
    author;
    createdAt;
    updatedAt;
    constructor(data) {
        Object.assign(this, data);
    }
}
//# sourceMappingURL=models.js.map