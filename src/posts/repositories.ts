import {
  ForeignKeyViolationError,
  NotFoundError,
  UniqueViolationError,
} from "../core/repositoryErrors.js";
import { Post, Comment } from "./domain/models.js";
import {
  ForeignKeyViolationErrCode,
  NotFoundErrCode,
  prisma,
  UniqueViolationErrCode,
} from "../db/prisma.js";
import { User } from "../users/domain/models.js";
import { Comment as CommentP, Prisma } from "@prisma/client";

export interface PostsRepositoryI {
  countPosts(): Promise<number>;
  listPosts(limit: number, offset: number): Promise<Post[]>;
  getPost(options: {
    id: number;
    withAuthor?: boolean;
    withComments?: boolean;
  }): Promise<Post>;
  updatePost(id: number, data: Prisma.PostUncheckedCreateInput): Promise<Post>;
  deletePost(id: number): Promise<void>;
  createPost(title: string, body: string, authorId: number): Promise<Post>;
}

export interface CommentsRepositoryI {
  createComment(data: Prisma.CommentUncheckedCreateInput): Promise<CommentP>;
  getComment(options: {
    id: number;
    withAuthor?: boolean;
    withPost?: boolean;
  }): Promise<CommentP>;
  updateComment(id: number, data: Prisma.CommentUpdateInput): Promise<CommentP>;
  deleteComment(id: number): Promise<void>;
}

export class PostsRepositoryImpl {
  async countPosts(): Promise<number> {
    return prisma.post.count();
  }

  async listPosts(limit: number, offset: number): Promise<Post[]> {
    return prisma.post
      .findMany({
        take: limit,
        skip: offset,
      })
      .then((posts) => posts.map((post) => Post.fromObject(post)));
  }

  async getPost(options: {
    id: number;
    withAuthor?: boolean;
    withComments?: boolean;
  }): Promise<Post> {
    const withAuthor = options.withAuthor ?? false;
    const withComments = options.withComments ?? false;

    return prisma.post
      .findUniqueOrThrow({
        where: { id: options.id },
        include: {
          author: withAuthor,
          comments: withComments
            ? { include: { author: true } }
            : undefined,
        },
      })
      .then((post) => {
        return Post.fromObject({
          ...post,
          author: post.author ? User.fromObject(post.author) : undefined,
          comments: post.comments
            ? post.comments.map(
                (comment) =>
                  new Comment({
                    ...comment,
                    author: User.fromObject(
                      (comment as Comment).author as User
                    ),
                  })
              )
            : [],
        });
      })
      .catch((err) => {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === NotFoundErrCode
        ) {
          throw new NotFoundError(`Post with ID ${options.id} does not exist.`);
        }
        throw err;
      });
  }

  async updatePost(
    id: number,
    data: Prisma.PostUncheckedCreateInput
  ): Promise<Post> {
    return prisma.post
      .update({ where: { id }, data })
      .then((post) => Post.fromObject(post))
      .catch((err) => {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === NotFoundErrCode
        ) {
          throw new NotFoundError(`Post with ID ${id} does not exist.`);
        }
        throw err;
      });
  }

  async createPost(
    title: string,
    body: string,
    authorId: number
  ): Promise<Post> {
    return prisma.post
      .create({ data: { title, body, authorId } })
      .then((post) => Post.fromObject(post))
      .catch((err) => {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === UniqueViolationErrCode
        ) {
          throw new UniqueViolationError(
            `Post with title ${title} already exists.`
          );
        }
        throw err;
      });
  }

  async deletePost(id: number): Promise<void> {
    prisma.post.delete({ where: { id } }).catch((err) => {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === NotFoundErrCode
      ) {
        throw new NotFoundError(`Post with ID ${id} does not exist.`);
      }
      throw err;
    });
  }
}

export class CommentsRepositoryImpl {
  async createComment(
    data: Prisma.CommentUncheckedCreateInput
  ): Promise<CommentP> {
    return prisma.comment.create({ data }).catch((err) => {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === ForeignKeyViolationErrCode
      ) {
        throw new ForeignKeyViolationError("Foreign key violation");
      }
      throw err;
    });
  }

  async getComment(options: {
    id: number;
    withAuthor?: boolean;
    withPost?: boolean;
  }): Promise<CommentP> {
    if (options.withAuthor === undefined) {
      options.withAuthor = false;
    }
    if (options.withPost === undefined) {
      options.withPost = false;
    }
    return prisma.comment
      .findUniqueOrThrow({
        where: { id: options.id },
        include: { author: options.withAuthor, post: options.withPost },
      })
      .catch((err) => {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === NotFoundErrCode
        ) {
          throw new NotFoundError(
            `Comment with id ${options.id} does not exist`
          );
        }
        throw err;
      });
  }

  async updateComment(
    id: number,
    data: Prisma.CommentUpdateInput
  ): Promise<CommentP> {
    return prisma.comment.update({ where: { id }, data }).catch((err) => {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === NotFoundErrCode
      ) {
        throw new NotFoundError(`Comment with id ${id} does not exist`);
      }
      throw err;
    });
  }

  async deleteComment(id: number): Promise<void> {
    prisma.comment.delete({ where: { id } }).catch((err) => {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === NotFoundErrCode
      ) {
        throw new NotFoundError(`Comment with id ${id} does not exist`);
      }
      throw err;
    });
  }
}
