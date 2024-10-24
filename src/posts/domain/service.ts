import { ForeignKeyViolationError, NotFoundError, UniqueViolationError } from "../../core/repositoryErrors.js";
import { CommentsRepositoryI, PostsRepositoryI } from "../repositories.js";
import { Post, Comment } from "../domain/models.js";
import { UsersRepositoryI } from "../../users/repository.js";

export type postData = { title: string, body: string, authorId: number};
export type commentData = { title: string, content: string, authorId: number, postId: number, imageUrl?: string };

export class PostNotFoundError extends Error {}

export class PostAlreadyExistsError extends Error {}

export class CommentNotFoundError extends Error {}

export class PostsService {
  postsRepo: PostsRepositoryI;
  usersRepo: UsersRepositoryI;
  commentsRepo: CommentsRepositoryI;
  constructor(postsRepo: PostsRepositoryI, usersRepo: UsersRepositoryI, commentsRepo: CommentsRepositoryI) {
    this.postsRepo = postsRepo;
    this.usersRepo = usersRepo;
    this.commentsRepo = commentsRepo;
  }

  async listPosts(page_size: number, page_num: number): Promise<{ page_size: number, page_num: number, posts: Post[], pages_range: number, first_page_num: number, last_page_num: number, total_records: number }> {
    return this.postsRepo.listPosts(page_size, page_num).then((posts) => {
      return this.postsRepo.countPosts().then((count) => {
        return { page_size, page_num, posts, pages_range: 5, first_page_num: 1, last_page_num: Math.ceil(count / page_size), total_records: count};
      })
    });
  }

  async getPost(id: number): Promise<Post> {
    return this.postsRepo
      .getPost({ id, withAuthor: true, withComments: true })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          throw new PostNotFoundError();
        }
        throw err;
      });
  }

  async updatePost(id: number, postData: Partial<postData>): Promise<Post> {
    return this.postsRepo
      .getPost({ id })
      .then(async (post: Post) => {
        const updatedPostData = {
          title: postData.title || post.title,
          body: postData.body || post.body,
          authorId: postData.authorId || post.authorId,
        }
        return this.postsRepo.updatePost(id, updatedPostData)
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          throw new PostNotFoundError();
        }
        throw err;
      });
  }

  async createPost(postData: postData): Promise<Post> {
    return this.postsRepo.createPost(postData.title, postData.body, postData.authorId)
      .catch((err) => {
        if (err instanceof UniqueViolationError) {
          console.log('post already exists');
          throw new PostAlreadyExistsError(err.message);
        }
        throw err;
      })
  }

  async deletePost(id: number): Promise<void> {
    return this.postsRepo.deletePost(id).catch((err) => {
      if (err instanceof NotFoundError) {
        throw new PostNotFoundError();
      }
      throw err;
    });
  }

  async createComment(data: commentData): Promise<Comment> {
    return this.commentsRepo.createComment(data)
      .catch((err) => {
        if (err instanceof ForeignKeyViolationError) {
          throw new PostNotFoundError(`Post with id ${data.postId} does not exist`);
        }
        throw err;
      })
  }

  async getComment(id: number): Promise<Comment> {
    return this.commentsRepo.getComment({ id, withAuthor: true, withPost: true })
     .catch((err) => {
        if (err instanceof NotFoundError) {
          throw new CommentNotFoundError(`Comment with id ${id} does not exist`);
        }
        throw err;
      })
  }


  async updateComment(id: number, data: Partial<commentData>): Promise<Comment> {
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

  async deleteComment(id: number): Promise<void> {
    return this.commentsRepo.deleteComment(id).catch((err) => {
      if (err instanceof NotFoundError) {
        throw new CommentNotFoundError(`Comment with id ${id} does not exist`);
      }
      throw err;
    });
  }
}