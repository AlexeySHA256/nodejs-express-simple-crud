import { UsersRepositoryImpl } from "../users/repositories.js";
import { CommentsService, PostsService } from "./domain/services.js";
import { PostsApiHandlers, PostsHandlers } from "./handlers.js";
import { CommentsRepositoryImpl, PostsRepositoryImpl } from "./repositories.js";

class Container {
  handlers: PostsHandlers;
  apiHandlers: PostsApiHandlers;
  constructor() {
    const postsRepo = new PostsRepositoryImpl();
    const usersRepo = new UsersRepositoryImpl();
    const commentsRepo = new CommentsRepositoryImpl();
    const postsService = new PostsService(postsRepo, usersRepo);
    const commentsService = new CommentsService(commentsRepo);
    this.handlers = new PostsHandlers(postsService);
    this.apiHandlers = new PostsApiHandlers(postsService, commentsService);
  }
}

export const container = new Container();
