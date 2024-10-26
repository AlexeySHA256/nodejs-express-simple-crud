import { Router } from "express";
import { container } from "./main.js";
const handlers = container.handlers;
const apiHandlers = container.apiHandlers;
export const postsRouter = Router();
postsRouter.get("/", handlers.listPosts);
postsRouter.get("/detail/:id", handlers.getPost);
postsRouter.get("/update/:id", handlers.updatePostGet);
postsRouter.post("/update/:id", handlers.updatePost);
postsRouter.get("/create", handlers.createPostGet);
postsRouter.post("/create", handlers.createPost);
postsRouter.get("/delete/:id", handlers.deletePostGet);
postsRouter.post("/delete/:id", handlers.deletePost);
export const postsApiRouter = Router();
postsApiRouter.post("/create", apiHandlers.createPost);
const _commentsSubrouter = Router();
postsApiRouter.use("/comments", _commentsSubrouter);
// TODO: Подумать над тем, не лучше ли передавать id поста связанного с комментом в url вместо тела запроса
_commentsSubrouter.post("/create", apiHandlers.createComment);
_commentsSubrouter.put("/update/:id", apiHandlers.updateComment);
_commentsSubrouter.get("/:id", apiHandlers.getComment);
_commentsSubrouter.delete("/delete/:id", apiHandlers.deleteComment);
//# sourceMappingURL=routes.js.map