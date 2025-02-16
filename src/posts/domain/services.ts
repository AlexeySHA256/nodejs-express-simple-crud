import { ForeignKeyViolationError, NotFoundError, UniqueViolationError } from "../../core/repositoryErrors.js";
import { UsersStorageI } from "../../users/domain/interfaces.js";
import { PostsStorageI, CommentsStorageI, PostCreateData, IPostCreateData, IComment, ICommentExtended, ICommentCreateData, IPost, IPostExtended } from "./interfaces.js";
import { IPaginatedData } from "../../../types/types.js";

export class PostNotFoundError extends Error { }

export class PostAlreadyExistsError extends Error { }

export class CommentNotFoundError extends Error { }

export class PostsService {
  constructor(public postsRepo: PostsStorageI, public usersRepo: UsersStorageI) {
    this.postsRepo = postsRepo;
    this.usersRepo = usersRepo;
  }

  async listPosts(page_size: number, page_num: number): Promise<IPaginatedData<IPost>> {
    return this.postsRepo.paginatedListPosts(page_size, page_num).then(async (posts) => {
      return this.postsRepo.countPosts().then((count) => {
        return { page_size, page_num, data: posts, pages_range: 5, first_page_num: 1, last_page_num: Math.ceil(count / page_size), total_records: count };
      })
    });
  }

  async getPost(id: number): Promise<IPostExtended> {
    return this.postsRepo
      .getPost({ id, withAuthor: true, withComments: true })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          throw new PostNotFoundError();
        }
        throw err;
      });
  }

  async updatePost(id: number, postData: Partial<IPostCreateData>): Promise<IPost> {
    return this.postsRepo
      .getPost({ id })
      .then(async (post: IPost) => {
        const updatedPost = {
          ...post,
          title: postData.title || post.title,
          body: postData.body || post.body,
          authorId: postData.authorId || post.authorId,
        }
        return this.postsRepo.updatePost(id, updatedPost)
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          throw new PostNotFoundError();
        }
        throw err;
      });
  }

  async createPost(data: PostCreateData): Promise<IPost> {
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
  async createComment(data: ICommentCreateData): Promise<IComment> {
    return this.commentsRepo.createComment(data)
      .catch((err) => {
        if (err instanceof ForeignKeyViolationError) {
          throw new PostNotFoundError(`Post with id ${data.postId} does not exist`);
        }
        throw err;
      })
  }

  async getComment(id: number): Promise<ICommentExtended> {
    return this.commentsRepo.getComment({ id, withAuthor: true, withPost: true })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          throw new CommentNotFoundError(`Comment with id ${id} does not exist`);
        }
        throw err;
      })
  }

  async listCommentsForPost(postId: number): Promise<IComment[]> {
    return this.commentsRepo.listComments({ postId })
  }

  async updateComment(id: number, data: Partial<ICommentCreateData>): Promise<IComment> {
    return this.commentsRepo.getComment({ id })
      .then(async (comment) => {
        const updatedComment = {
          ...comment,
          title: (data.title || comment.title),
          content: (data.content || comment.content),
          postId: (data.postId || comment.postId),
          imageUrl: (data.imageUrl || comment.imageUrl)
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
