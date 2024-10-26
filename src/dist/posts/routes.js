import { Router } from "express";
import { container } from "./main.js";
import middlewares, { unauthenticatedActions } from "../core/middlewares.js";
const handlers = container.handlers;
const apiHandlers = container.apiHandlers;
export const postsRouter = Router();
const authRequiredWithRedirect = middlewares.requireAuthenticated(unauthenticatedActions.REDIRECT_TO_LOGIN);
postsRouter.get("/", handlers.listPosts);
postsRouter.get("/detail/:id", handlers.getPost);
postsRouter.get("/update/:id", authRequiredWithRedirect, handlers.updatePostGet);
postsRouter.post("/update/:id", authRequiredWithRedirect, handlers.updatePost);
postsRouter.get("/create", authRequiredWithRedirect, handlers.createPostGet);
postsRouter.post("/create", authRequiredWithRedirect, handlers.createPost);
postsRouter.get("/delete/:id", authRequiredWithRedirect, handlers.deletePostGet);
postsRouter.post("/delete/:id", authRequiredWithRedirect, handlers.deletePost);
export const postsApiRouter = Router();
const authRequiredWithJsonErr = middlewares.requireAuthenticated(unauthenticatedActions.JSON_ERROR);
postsApiRouter.post("/create", authRequiredWithJsonErr, apiHandlers.createPost);
const commentsSubrouter = Router();
postsApiRouter.use("/comments", commentsSubrouter);
// TODO: Подумать над тем, не лучше ли передавать id поста связанного с комментом в url вместо тела запроса
commentsSubrouter.post("/create", authRequiredWithJsonErr, apiHandlers.createComment);
commentsSubrouter.put("/update/:id", authRequiredWithJsonErr, apiHandlers.updateComment);
commentsSubrouter.get("/:id", apiHandlers.getComment);
commentsSubrouter.delete("/delete/:id", authRequiredWithJsonErr, apiHandlers.deleteComment);
//# sourceMappingURL=routes.js.map