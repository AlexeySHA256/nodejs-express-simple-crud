import db from "../db.js";


export class PostsRepository {
    async list(limit, offset) {
        return db.query("SELECT * FROM posts_v LIMIT $1 OFFSET $2", [limit, offset]).then((result) => result.rows);
    }

    async get(id) {
        return db.query("SELECT * FROM posts_v WHERE id = $1", [id]).then((result) => result.rows[0]);
    }
}