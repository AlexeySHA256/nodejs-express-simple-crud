import { NotFoundError } from "../core/repositoryErrors.js";
import { PostCreateForm, PostUpdateForm } from "./forms.js";
import { PostsRepository } from "./repository.js";
import { Author, Post } from "./models.js";

type postData = {id?: number, title: string, body: string, author_id: number};

export class PostNotFoundError extends Error {
  constructor() {
    super("Post not found");
  }
}

export class PostsService {
  repo: PostsRepository;
  constructor() {
    this.repo = new PostsRepository();
  }

  async listPosts(page_size: number, page_num: number) {
    return this.repo.listPosts(page_size, page_num).then((posts) => {
      return { page_size, page_num, posts, pages_range: 5 };
    });
  }

  async getPost(id: number) {
    return this.repo
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

  async updatePostGet(id: number): Promise<{ post: Post; authors: Author[]; form: PostUpdateForm }> {
    return this.repo.getPost(id).then((post) => {
      return this.repo.listAuthors(100).then((authors) => {
        const form = new PostUpdateForm(post);
        form.fields.forEach((field) => {
          field.value = post[field.name];
        })
        return { post, authors, form: form };
      });
    });
  }

  async updatePost(id: number, postData: Partial<postData>) {
    return this.repo
      .getPost(id)
      .then((post: Post) => {
        const updatedPostData = {
          ...post,
          id: id,
          title: postData.title || post.title,
          body: postData.body || post.body,
          author_id: postData.author_id || post.author_id,
        }
        post = Post.fromObject(updatedPostData);
        return this.repo.updatePost(post).then((post) => {
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

  async createPostGet() {
    return this.repo.listAuthors(100).then((authors) => {
      return { authors, form: new PostCreateForm() };
    });
  }

  async createPost(postData: postData) {
    return this.repo.createPost(postData.title, postData.body, postData.author_id).then((post) => {
      return { post };
    });
  }

  async deletePost(id: number) {
    return this.repo.deletePost(id).catch((err) => {
      if (err instanceof NotFoundError) {
        throw new PostNotFoundError();
      }
      throw err;
    });
  }
}
