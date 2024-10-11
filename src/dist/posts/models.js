// бизнес сущности
export class Post {
    id;
    title;
    body;
    author_id;
    author;
    created_at;
    updated_at;
    constructor(id, title, body, author_id, author = undefined, created_at, updated_at) {
        Object.assign(this, { id, title, body, author_id, author, created_at, updated_at });
    }
    static fromObject(obj) {
        return new Post(obj.id, obj.title, obj.body, obj.author_id, obj.author, obj.created_at, obj.updated_at);
    }
}
export class Author {
    id;
    firstName;
    lastName;
    constructor(id, firstName, lastName) {
        Object.assign(this, { id, firstName, lastName });
    }
}
//# sourceMappingURL=models.js.map