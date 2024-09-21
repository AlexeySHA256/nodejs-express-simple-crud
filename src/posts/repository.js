import db from "../db.js";


export class PostsRepository {
    async list(limit, offset) {
        return db.query("SELECT * FROM posts_v LIMIT $1 OFFSET $2", [limit, offset]).then((result) => result.rows);
    }
}