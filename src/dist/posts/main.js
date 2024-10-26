import { UsersRepositoryImpl } from "../users/repository.js";
import { PostsService } from "./domain/service.js";
import { PostsApiHandlers, PostsHandlers } from "./handlers.js";
import { CommentsRepositoryImpl, PostsRepositoryImpl } from "./repositories.js";
class Container {
    handlers;
    apiHandlers;
    constructor() {
        const postsRepo = new PostsRepositoryImpl();
        const usersRepo = new UsersRepositoryImpl();
        const commentsRepo = new CommentsRepositoryImpl();
        const postsService = new PostsService(postsRepo, usersRepo, commentsRepo);
        this.handlers = new PostsHandlers(postsService);
        this.apiHandlers = new PostsApiHandlers(postsService);
    }
}
export const container = new Container();
//# sourceMappingURL=main.js.map