import { NotFoundError } from "../utils/repositoryErrors.js";
import { PostCreateForm, PostUpdateForm } from "./forms.js";
import { PostsRepository } from "./repository.js";

export class PostNotFoundError extends Error {
  constructor() {
    super("Post not found");
  }
}

export class PostsService {
  constructor() {
    this.repo = new PostsRepository();
  }

  async listPosts(page_size, page_num) {
    return this.repo.listPosts(page_size, page_num).then((posts) => {
      return { page_size, page_num, posts, pages_range: 5 };
    });
  }

  async getPost(id) {
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

  async updatePostGet(id) {
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

  async updatePost(id, postData) {
    return this.repo
      .getPost(id)
      .then((post) => {
        postData = {
          title: postData.title || post.title,
          body: postData.body || post.body,
          author_id: postData.author_id || post.author_id,
          id,
        };
        return this.repo.updatePost(postData).then((post) => {
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

  async createPost(postData) {
    return this.repo.createPost(postData).then((post) => {
      return { post };
    });
  }

  async deletePost(id) {
    return this.repo.deletePost(id).catch((err) => {
      if (err instanceof NotFoundError) {
        throw new PostNotFoundError();
      }
      throw err;
    });
  }
}
