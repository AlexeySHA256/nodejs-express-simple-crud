// бизнес сущности
export class Post {
    id;
    title;
    body;
    authorId;
    author;
    createdAt;
    updatedAt;
    constructor(id, title, body, authorId, author = undefined, createdAt, updatedAt) {
        Object.assign(this, { id, title, body, authorId, author, createdAt, updatedAt });
    }
    static fromObject(obj) {
        return new Post(obj.id, obj.title, obj.body, obj.authorId, obj.author, obj.createdAt, obj.updatedAt);
    }
}
//# sourceMappingURL=models.js.map