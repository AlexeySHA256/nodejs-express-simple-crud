import { PostsRepository } from "./repository.js";

export default class PostsService {

    constructor() {
        this.repo = new PostsRepository();
    }

    async list(page_size, page_num) {
        return this.repo.list(page_size, page_num).then((posts) => {
            return {page_size, page_num, posts, pages_range: 5};
        });
    }
}
