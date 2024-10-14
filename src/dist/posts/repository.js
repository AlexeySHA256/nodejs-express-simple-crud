import { NotFoundError, UniqueViolationError } from "../core/repositoryErrors.js";
import { Post } from "./domain/models.js";
import { NotFoundErrCode, prisma, UniqueViolationErrCode } from "../db/prisma.js";
import { User } from "../users/domain/models.js";
import { Prisma } from "@prisma/client";
export class PostsRepository {
    async listPosts(limit, offset) {
        return prisma.post.findMany({
            take: limit,
            skip: offset,
        }).then((posts) => posts.map((post) => Post.fromObject(post)));
    }
    async getPost(id) {
        return prisma.post.findUniqueOrThrow({ where: { id }, include: { author: true } })
            .then((post) => {
            const postAuthor = User.fromObject(post.author);
            return Post.fromObject({ ...post, author: postAuthor });
        })
            .catch((err) => {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
                throw new NotFoundError(`Post with ID ${id} does not exist.`);
            }
            throw err;
        });
    }
    async updatePost(post) {
        return prisma.post.update({ where: { id: post.id }, data: { ...post, author: undefined } })
            .then((post) => Post.fromObject(post))
            .catch((err) => {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
                throw new NotFoundError(`Post with ID ${post.id} does not exist.`);
            }
            throw err;
        });
    }
    async createPost(title, body, authorId) {
        // authorId = Number(authorId);  // Явное преобразование в число
        console.log('create post', { title, body, authorId }, typeof authorId);
        return prisma.post.create({ data: { title, body, authorId } })
            .then((post) => Post.fromObject(post))
            .catch((err) => {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === UniqueViolationErrCode) {
                throw new UniqueViolationError(`Post with title ${title} already exists.`);
            }
            console.log(err);
            throw err;
        });
    }
    async deletePost(id) {
        prisma.post.delete({ where: { id } }).catch((err) => {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
                throw new NotFoundError(`Post with ID ${id} does not exist.`);
            }
        });
    }
}
//# sourceMappingURL=repository.js.map