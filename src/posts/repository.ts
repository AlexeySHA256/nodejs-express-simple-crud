import { ForeignKeyViolationError, NotFoundError, UniqueViolationError } from "../core/repositoryErrors.js";
import { Post } from "./domain/models.js";
import { ForeignKeyViolationErrCode, NotFoundErrCode, prisma, UniqueViolationErrCode } from "../db/prisma.js";
import { User } from "../users/domain/models.js";
import { Comment, Prisma } from "@prisma/client";

export class PostsRepository {
  async listPosts(limit: number, offset: number): Promise<Post[]> {
    return prisma.post.findMany({
      take: limit,
      skip: offset,
    }).then((posts) => posts.map((post) => Post.fromObject(post)));
  }

  async getPost(id: number): Promise<Post> {
    return prisma.post.findUniqueOrThrow({ where: { id }, include: { author: true } })
      .then((post) => {
        const postAuthor = User.fromObject(post.author);
        return Post.fromObject({...post, author: postAuthor});
      })
      .catch((err) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
          throw new NotFoundError(`Post with ID ${id} does not exist.`);
        }
        throw err;
      });
  }

  async updatePost(post: Post): Promise<Post> {
    return prisma.post.update({ where: { id: post.id }, data: {...post, author: undefined} })
      .then((post) => Post.fromObject(post))
      .catch((err) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
          throw new NotFoundError(`Post with ID ${post.id} does not exist.`);
        }
        throw err;
      });
  }

  async createPost(title: string, body: string, authorId: number): Promise<Post> {
    return prisma.post.create({ data: { title, body, authorId } })
      .then((post) => Post.fromObject(post))
      .catch((err) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === UniqueViolationErrCode) {
          throw new UniqueViolationError(`Post with title ${title} already exists.`);
        }
        throw err;
      })
  }

  async deletePost(id: number): Promise<void> {
    prisma.post.delete({ where: { id } }).catch((err) => {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
        throw new NotFoundError(`Post with ID ${id} does not exist.`);
      }
      throw err;
    })
  }
}


export class CommentsRepository {
  async createComment(data: Prisma.CommentUncheckedCreateInput): Promise<Comment> {
    return prisma.comment.create({ data })
      .catch(err => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === ForeignKeyViolationErrCode) {
          throw new ForeignKeyViolationError("Foreign key violation");
        }
        throw err;
      })
  }

  async getComment(options: { id: number, withAuthor?: boolean, withPost?: boolean }): Promise<Comment> {
    if (options.withAuthor === undefined) {
      options.withAuthor = false;
    }
    if (options.withPost === undefined) {
      options.withPost = false;
    }
    return prisma.comment.findUniqueOrThrow({ where: { id: options.id }, include: { author: options.withAuthor, post: options.withPost } })
      .catch(err => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
          throw new NotFoundError(`Comment with id ${options.id} does not exist`);
        }
        throw err;
      })
  }

  async updateComment(id: number, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return prisma.comment.update({ where: { id }, data })
      .catch(err => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
          throw new NotFoundError(`Comment with id ${id} does not exist`);
        }
        throw err;
      })
  }

  async deleteComment(id: number): Promise<void> {
    prisma.comment.delete({ where: { id } }).catch((err) => {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
        throw new NotFoundError(`Comment with id ${id} does not exist`);
      }
      throw err;
    })
  }
}