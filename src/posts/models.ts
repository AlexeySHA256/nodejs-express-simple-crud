
// бизнес сущности

export class Post {
    id!: number;
    title!: string;
    body!: string;
    author_id!: number;
    author?: Author;
    created_at!: Date;
    updated_at!: Date;

    constructor(
        id: number, title: string, body: string, author_id: number,
        author: Author | undefined = undefined, created_at: Date, updated_at: Date
    ) {
        Object.assign(this, { id, title, body, author_id, author, created_at, updated_at });
    }

    static fromObject(obj: { id: number, title: string, body: string, author_id: number, author?: Author, created_at: Date, updated_at: Date }): Post {
        return new Post(obj.id, obj.title, obj.body, obj.author_id, obj.author, obj.created_at, obj.updated_at);
    }
}

export class Author {
    id!: number;
    firstName!: string;
    lastName!: string;

    constructor(id: number, firstName: string, lastName: string) {
        Object.assign(this, { id, firstName, lastName });
    }
}