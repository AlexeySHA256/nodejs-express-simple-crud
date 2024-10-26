import { ForeignKeyViolationError, NotFoundError, UniqueViolationError } from "../../core/repositoryErrors.js";
export class PostNotFoundError extends Error {
}
export class PostAlreadyExistsError extends Error {
}
export class CommentNotFoundError extends Error {
}
export class PostsService {
    postsRepo;
    usersRepo;
    commentsRepo;
    constructor(postsRepo, usersRepo, commentsRepo) {
        this.postsRepo = postsRepo;
        this.usersRepo = usersRepo;
        this.commentsRepo = commentsRepo;
    }
    async listPosts(page_size, page_num) {
        return this.postsRepo.listPosts(page_size, page_num).then((posts) => {
            return this.postsRepo.countPosts().then((count) => {
                return { page_size, page_num, posts, pages_range: 5, first_page_num: 1, last_page_num: Math.ceil(count / page_size), total_records: count };
            });
        });
    }
    async getPost(id) {
        return this.postsRepo
            .getPost({ id, withAuthor: true, withComments: true })
            .catch((err) => {
            if (err instanceof NotFoundError) {
                throw new PostNotFoundError();
            }
            throw err;
        });
    }
    async updatePost(id, postData) {
        return this.postsRepo
            .getPost({ id })
            .then(async (post) => {
            const updatedPostData = {
                title: postData.title || post.title,
                body: postData.body || post.body,
                authorId: postData.authorId || post.authorId,
            };
            return this.postsRepo.updatePost(id, updatedPostData);
        })
            .catch((err) => {
            if (err instanceof NotFoundError) {
                throw new PostNotFoundError();
            }
            throw err;
        });
    }
    async createPost(postData) {
        return this.postsRepo.createPost(postData.title, postData.body, postData.authorId)
            .catch((err) => {
            if (err instanceof UniqueViolationError) {
                console.log('post already exists');
                throw new PostAlreadyExistsError(err.message);
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
    async createComment(data) {
        return this.commentsRepo.createComment(data)
            .catch((err) => {
            if (err instanceof ForeignKeyViolationError) {
                throw new PostNotFoundError(`Post with id ${data.postId} does not exist`);
            }
            throw err;
        });
    }
    async getComment(id) {
        return this.commentsRepo.getComment({ id, withAuthor: true, withPost: true })
            .catch((err) => {
            if (err instanceof NotFoundError) {
                throw new CommentNotFoundError(`Comment with id ${id} does not exist`);
            }
            throw err;
        });
    }
    async updateComment(id, data) {
        return this.commentsRepo.getComment({ id })
            .then(async (comment) => {
            const updatedCommentData = {
                title: (data.title || comment.title),
                content: (data.content || comment.content),
                postId: (data.postId || comment.postId),
                imageUrl: (data.imageUrl || comment.imageUrl)
            };
            return await this.commentsRepo.updateComment(id, updatedCommentData);
        })
            .catch((err) => {
            if (err instanceof NotFoundError) {
                throw new CommentNotFoundError(`Comment with id ${id} does not exist`);
            }
            throw err;
        });
    }
    async deleteComment(id) {
        return this.commentsRepo.deleteComment(id).catch((err) => {
            if (err instanceof NotFoundError) {
                throw new CommentNotFoundError(`Comment with id ${id} does not exist`);
            }
            throw err;
        });
    }
}
//# sourceMappingURL=service.js.map