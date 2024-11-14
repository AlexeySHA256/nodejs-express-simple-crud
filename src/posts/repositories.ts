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
import { User, UserRoles } from "../users/domain/models.js";
import { Prisma } from "@prisma/client";
import { CommentCreateData, PostCreateData } from "./domain/interfaces.js";

export class PostsRepositoryImpl {
  async countPosts(): Promise<number> {
    return prisma.post.count();
  }

  async paginatedListPosts(limit: number, offset: number): Promise<Post[]> {
    return prisma.post
      .findMany({
        take: limit,
        skip: offset,
      })
      .then((posts) => posts.map((post) => new Post(post)));
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
          comments: withComments ? { include: { author: true } } : undefined,
        },
      })
      .then((post) => {
        return new Post({
          ...post,
          author: post.author
            ? new User({ ...post.author, role: post.author.role as UserRoles })
            : undefined,
          comments: post.comments
            ? post.comments.map(
                (comment) =>
                  new Comment({
                    ...comment,
                    author: new User((comment as Comment).author as User),
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

  async updatePost(id: number, data: Post): Promise<Post> {
    return prisma.post
      .update({
        where: { id },
        data: { title: data.title, body: data.body, authorId: data.authorId },
      })
      .then((post) => new Post(post))
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

  async createPost(data: PostCreateData): Promise<Post> {
    return prisma.post
      .create({ data })
      .then((post) => new Post(post))
      .catch((err) => {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === UniqueViolationErrCode
        ) {
          throw new UniqueViolationError(
            `Post with title ${data.title} already exists.`
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
  async createComment(data: CommentCreateData): Promise<Comment> {
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
  }): Promise<Comment> {
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
      .then(
        (comment) =>
          new Comment({
            ...comment,
            author: comment.author
              ? new User(comment.author as User)
              : undefined,
          })
      )
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

  async listComments(filters: { [key: string]: string }): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: filters,
      include: { author: true },
    }).then((comments) => comments.map((comment) => new Comment({...comment, author: new User(comment.author as User)})));
  }

  async updateComment(id: number, data: Comment): Promise<Comment> {
    return prisma.comment
      .update({
        where: { id },
        data: {
          title: data.title,
          content: data.content,
          imageUrl: data.imageUrl,
        },
      })
      .catch((err) => {
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
