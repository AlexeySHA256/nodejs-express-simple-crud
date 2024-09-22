import db from "../db.js";

export class PostsRepository {
  async listPosts(limit, offset) {
    return db
      .query("SELECT * FROM posts_v LIMIT $1 OFFSET $2", [limit, offset])
      .then((result) => result.rows);
  }

  async listAuthors(limit) {
    return db
      .query("SELECT a.fullname, a.id FROM authors a LIMIT $1", [limit])
      .then((result) => result.rows);
  }

  async getPost(id) {
    return db
      .query("SELECT * FROM posts_v WHERE id = $1", [id])
      .then((result) => result.rows[0]);
  }

  async updatePost(postData) {
    return db
      .query(
        "UPDATE posts SET title = $1, body = $2, author_id = $3 WHERE id = $4 RETURNING *",
        [postData.title, postData.body, postData.author_id, postData.id]
      )
      .then((result) => result.rows[0]);
  }

  async createPost(postData) {
    return db
      .query(
        "INSERT INTO posts (title, body, author_id) VALUES ($1, $2, $3) RETURNING *",
        [postData.title, postData.body, postData.author_id]
      )
      .then((result) => result.rows[0]);
  }
}
