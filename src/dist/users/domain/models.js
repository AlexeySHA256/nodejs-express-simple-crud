export class User {
    id;
    firstName;
    lastName;
    email;
    posts;
    password;
    createdAt;
    updatedAt;
    constructor(id, firstName, lastName, email, password, createdAt, updatedAt, posts) {
        Object.assign(this, { id, firstName, lastName, email, posts, password, createdAt, updatedAt });
    }
    static fromObject(obj) {
        return new User(obj.id, obj.firstName, obj.lastName, obj.email, obj.password, obj.createdAt, obj.updatedAt, obj.posts);
    }
    get fullName() {
        return this.firstName + " " + this.lastName;
    }
}
//# sourceMappingURL=models.js.map