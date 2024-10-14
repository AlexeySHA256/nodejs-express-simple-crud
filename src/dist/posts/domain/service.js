import { NotFoundError, UniqueViolationError } from "../../core/repositoryErrors.js";
import { PostsRepository } from "../repository.js";
import { Post } from "../domain/models.js";
import { UsersRepository } from "../../users/repository.js";
export class PostNotFoundError extends Error {
    constructor() {
        super("Post not found");
    }
}
export class PostAlreadyExistsError extends Error {
    constructor() {
        super("Post already exists");
    }
}
export class PostsService {
    postsRepo;
    usersRepo;
    constructor() {
        this.postsRepo = new PostsRepository();
        this.usersRepo = new UsersRepository();
    }
    async listPosts(page_size, page_num) {
        return this.postsRepo.listPosts(page_size, page_num).then((posts) => {
            return { page_size, page_num, posts, pages_range: 5 };
        });
    }
    async getPost(id) {
        return this.postsRepo
            .getPost(id)
            .then((post) => {
            return { post };
        })
            .catch((err) => {
            if (err instanceof NotFoundError) {
                throw new PostNotFoundError();
            }
            throw err;
        });
    }
    async updatePost(id, postData) {
        return this.postsRepo
            .getPost(id)
            .then((post) => {
            const updatedPostData = {
                ...post,
                id: id,
                title: postData.title || post.title,
                body: postData.body || post.body,
                author_id: postData.author_id || post.authorId,
            };
            post = Post.fromObject(updatedPostData);
            return this.postsRepo.updatePost(post).then((post) => {
                return { post };
            });
        })
            .catch((err) => {
            if (err instanceof NotFoundError) {
                throw new PostNotFoundError();
            }
            throw err;
        });
    }
    async createPost(postData) {
        return this.postsRepo.createPost(postData.title, postData.body, postData.author_id)
            .then((post) => { return { post }; })
            .catch((err) => {
            if (err instanceof UniqueViolationError) {
                console.log('post already exists');
                throw new PostAlreadyExistsError();
            }
            throw err;
        });
    }
    async deletePost(id) {
        return this.postsRepo.deletePost(id).catch((err) => {
            if (err instanceof NotFoundError) {
                throw new PostNotFoundError();
            }
            throw err;
        });
    }
}
//# sourceMappingURL=service.js.map