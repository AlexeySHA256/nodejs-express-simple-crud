import crypto_ from "crypto";
export class User {
    id;
    firstName;
    lastName;
    email;
    posts;
    isActive;
    passwordHash;
    createdAt;
    updatedAt;
    constructor(id, firstName, lastName, email, passwordHash, isActive, createdAt, updatedAt, posts) {
        Object.assign(this, { id, firstName, lastName, email, posts, passwordHash, isActive, createdAt, updatedAt });
    }
    static fromObject(obj) {
        return new User(obj.id, obj.firstName, obj.lastName, obj.email, obj.passwordHash, obj.isActive, obj.createdAt, obj.updatedAt, obj.posts);
    }
    get fullName() {
        return this.firstName + " " + this.lastName;
    }
}
export var TokenScopes;
(function (TokenScopes) {
    TokenScopes["AUTHORIZATION"] = "AUTHORIZATION";
    TokenScopes["ACTIVATION"] = "ACTIVATION";
})(TokenScopes || (TokenScopes = {}));
export class Token {
    scope = TokenScopes.AUTHORIZATION;
    plainText;
    hash;
    userId;
    expiry;
    user;
    constructor(obj) {
        Object.assign(this, obj);
    }
    isExpired() {
        return Date.now() > this.expiry.getTime();
    }
    static hashFromPlainText(plainText) {
        return crypto_.createHash("sha256").update(plainText).digest("hex");
    }
    static generate(userId, ttlMs, scope = TokenScopes.AUTHORIZATION) {
        const tokenData = {
            userId,
            scope,
            expiry: new Date(Date.now() + ttlMs),
            plainText: "",
            hash: ""
        };
        const buffer = crypto_.randomBytes(16);
        tokenData.plainText = buffer.toString("hex");
        tokenData.hash = Token.hashFromPlainText(tokenData.plainText);
        return new Token(tokenData);
    }
}
//# sourceMappingURL=models.js.map