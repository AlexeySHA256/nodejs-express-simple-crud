import { ForeignKeyViolationError, NotFoundError, UniqueViolationError } from "../../core/repositoryErrors.js";
import { CommentsRepository, PostsRepository } from "../repository.js";
import { Post } from "../domain/models.js";
import { UsersRepository } from "../../users/repository.js";
import { Comment as CommentP, Prisma } from "@prisma/client";


type postData = { title: string, body: string, authorId: number};

export class PostNotFoundError extends Error {}

export class PostAlreadyExistsError extends Error {}

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

  async updatePost(id: number, postData: Partial<postData>) {
    return this.postsRepo
      .getPost(id)
      .then((post: Post) => {
        const updatedPostData = {
          ...post,
          id: id,
          title: postData.title || post.title,
          body: postData.body || post.body,
          author_id: postData.authorId || post.authorId,
        }
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
}