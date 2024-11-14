import { ForeignKeyViolationError, NotFoundError, UniqueViolationError } from "../../core/repositoryErrors.js";
import { Post, Comment } from "./models.js";
import { UsersStorageI } from "../../users/domain/interfaces.js";
import { PostsStorageI, CommentsStorageI, CommentCreateData, PostCreateData } from "./interfaces.js";

export type postData = { title: string, body: string, authorId: number};
export type commentData = { title: string, content: string, authorId: number, postId: number, imageUrl?: string };

export class PostNotFoundError extends Error {}

export class PostAlreadyExistsError extends Error {}

export class CommentNotFoundError extends Error {}

export class PostsService {
  constructor(public postsRepo: PostsStorageI, public usersRepo: UsersStorageI) {
    this.postsRepo = postsRepo;
    this.usersRepo = usersRepo;
  }

  async listPosts(page_size: number, page_num: number): Promise<{ page_size: number, page_num: number, posts: Post[], pages_range: number, first_page_num: number, last_page_num: number, total_records: number }> {
    return this.postsRepo.paginatedListPosts(page_size, page_num).then(async (posts) => {
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
        const updatedPost = new Post({
          ...post,
          title: postData.title || post.title,
          body: postData.body || post.body,
          authorId: postData.authorId || post.authorId,
        })
        return this.postsRepo.updatePost(id, updatedPost)
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          throw new PostNotFoundError();
        }
        throw err;
      });
  }

  async createPost(data: PostCreateData): Promise<Post> {
    return this.postsRepo.createPost(data)
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
}

export class CommentsService {

  constructor(public commentsRepo: CommentsStorageI) {
    this.commentsRepo = commentsRepo;
  }
  async createComment(data: CommentCreateData): Promise<Comment> {
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

  async listCommentsForPost(postId: number): Promise<Comment[]> {
    // try to get post by given id, to check if it exists
    return this.commentsRepo.listComments({ postId })
  }

  async updateComment(id: number, data: Partial<commentData>): Promise<Comment> {
    return this.commentsRepo.getComment({ id })
     .then(async (comment) => {
        const updatedComment = {
          ...comment,
          title: (data.title || comment.title) as string,
          content: (data.content || comment.content) as string,
          postId: (data.postId || comment.postId) as number,
          imageUrl: (data.imageUrl || comment.imageUrl) as string
        };
        return await this.commentsRepo.updateComment(id, updatedComment)
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