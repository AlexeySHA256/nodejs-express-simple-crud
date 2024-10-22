import { ForeignKeyViolationError, NotFoundError, UniqueViolationError } from "../../core/repositoryErrors.js";
import { CommentsRepository, PostsRepository } from "../repository.js";
import { Post, Comment } from "../domain/models.js";
import { UsersRepository } from "../../users/repository.js";
import { Comment as CommentP, Prisma } from "@prisma/client";

type postData = { title: string, body: string, authorId: number};

export class PostNotFoundError extends Error {}

export class PostAlreadyExistsError extends Error {}

export class CommentNotFoundError extends Error {}

export class PostsService {
  postsRepo: PostsRepository;
  usersRepo: UsersRepository;
  commentsRepo: CommentsRepository;
  constructor() {
    // TODO: Изолировать от прямого использования репозиториев, вместо этого использовать интерфейсы
    this.postsRepo = new PostsRepository();
    this.usersRepo = new UsersRepository();
    this.commentsRepo = new CommentsRepository();
  }

  async listPosts(page_size: number, page_num: number) {
    return this.postsRepo.listPosts(page_size, page_num).then((posts) => {
      return { page_size, page_num, posts, pages_range: 5 };
    });
  }

  async getPost(id: number) {
    return this.postsRepo
      .getPost({ id, withAuthor: true, withComments: true })
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

  async updatePost(id: number, postData: Partial<postData>) {
    return this.postsRepo
      .getPost({ id })
      .then(async (post: Post) => {
        const updatedPostData: Prisma.PostUncheckedCreateInput = {
          title: postData.title || post.title,
          body: postData.body || post.body,
          authorId: postData.authorId || post.authorId,
        }
        return this.postsRepo.updatePost(id, updatedPostData).then((post) => {
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

  async createPost(postData: postData) {
    return this.postsRepo.createPost(postData.title, postData.body, postData.authorId)
      .then((post) => { return { post } })
      .catch((err) => {
        if (err instanceof UniqueViolationError) {
          console.log('post already exists');
          throw new PostAlreadyExistsError(err.message);
        }
        throw err;
      })
  }

  async deletePost(id: number) {
    return this.postsRepo.deletePost(id).catch((err) => {
      if (err instanceof NotFoundError) {
        throw new PostNotFoundError();
      }
      throw err;
    });
  }

  async createComment(data: Prisma.CommentUncheckedCreateInput): Promise<CommentP> {
    return this.commentsRepo.createComment(data)
      .catch((err) => {
        if (err instanceof ForeignKeyViolationError) {
          throw new PostNotFoundError(`Post with id ${data.postId} does not exist`);
        }
        throw err;
      })
  }

  async getComment(id: number) {
    return this.commentsRepo.getComment({ id, withAuthor: true, withPost: true })
     .catch((err) => {
        if (err instanceof NotFoundError) {
          throw new CommentNotFoundError(`Comment with id ${id} does not exist`);
        }
        throw err;
      })
  }


  async updateComment(id: number, data: Prisma.CommentUncheckedUpdateInput): Promise<CommentP> {
    return this.commentsRepo.getComment({ id })
     .then(async (comment) => {
        const updatedCommentData = {
          title: (data.title || comment.title) as string,
          content: (data.content || comment.content) as string,
          postId: (data.postId || comment.postId) as number,
          imageUrl: (data.imageUrl || comment.imageUrl) as string
        };
        return await this.commentsRepo.updateComment(id, updatedCommentData)
      })
     .catch((err) => {
        if (err instanceof NotFoundError) {
          throw new CommentNotFoundError(`Comment with id ${id} does not exist`);
        }
        throw err;
      });
  }

  async deleteComment(id: number) {
    return this.commentsRepo.deleteComment(id).catch((err) => {
      if (err instanceof NotFoundError) {
        throw new CommentNotFoundError(`Comment with id ${id} does not exist`);
      }
      throw err;
    });
  }
}