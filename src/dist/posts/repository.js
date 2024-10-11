import db from "../db.js";
import { NotFoundError } from "../core/repositoryErrors.js";
import { Post } from "./models.js";
export class PostsRepository {
    async listPosts(limit, offset) {
        return db
            .query("SELECT * FROM posts_v LIMIT $1 OFFSET $2", [limit, offset])
            .then((result) => result.rows)
            .then((rows) => rows.map((row) => Post.fromObject(row)));
    }
    async listAuthors(limit) {
        return db
            .query("SELECT a.fullname, a.id FROM authors a LIMIT $1", [limit])
            .then((result) => result.rows);
    }
    async getPost(id) {
        return db
            .query("SELECT * FROM posts_v WHERE id = $1", [id])
            .then((result) => {
            if (result.rows.length === 0) {
                throw new NotFoundError(`Post with id ${id} not found`);
            }
            return result.rows[0];
        });
    }
    async updatePost(post) {
        return db
            .query("UPDATE posts SET title = $1, body = $2, author_id = $3 WHERE id = $4 RETURNING *", [post.title, post.body, post.author_id, post.id])
            .then((result) => result.rows[0]);
    }
    async createPost(title, body, author_id) {
        return db
            .query("INSERT INTO posts (title, body, author_id) VALUES ($1, $2, $3) RETURNING *", [title, body, author_id])
            .then((result) => result.rows[0])
            .then((row) => Post.fromObject(row));
    }
    async deletePost(id) {
        db.query("DELETE FROM posts WHERE id = $1", [id]).then((result) => {
            if (result.rowCount === 0) {
                throw new NotFoundError(`Post with id ${id} not found`);
            }
        });
    }
}
//# sourceMappingURL=repository.js.map