import { PostsRepository } from "./repository.js";

export default class PostsService {
  constructor() {
    this.repo = new PostsRepository();
  }

  async listPosts(page_size, page_num) {
    return this.repo.listPosts(page_size, page_num).then((posts) => {
      return { page_size, page_num, posts, pages_range: 5 };
    });
  }

  async getPost(id) {
    return this.repo.getPost(id).then((post) => {
      console.log(id, post);
      return { post };
    });
  }

  async updatePostGet(id) {
    return this.repo.getPost(id).then((post) => {
      return this.repo.listAuthors(100).then((authors) => {
        return { post, authors };
      })
    });
  }

  async updatePost(id, postData) {
    return this.repo.getPost(id).then((post) => {
      postData = {
        title: postData.title || post.title,
        body: postData.body || post.body,
        author_id: postData.author_id || post.author_id,
        id,
      };
      return this.repo.updatePost(postData).then((post) => {
        return { post };
      });
    });
  }
}
