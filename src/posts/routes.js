import { Router } from "express";
import { handlers as PostsHandlers, apiHandlers as PostsApiHandlers } from "./handlers.js";

export const router = new Router();

router.get("/", PostsHandlers.listPosts);
router.get("/detail/:id", PostsHandlers.getPost);

router.get("/update/:id", PostsHandlers.updatePostGet);
router.post("/update/:id", PostsHandlers.updatePost);

router.get("/create", PostsHandlers.createPostGet);
router.post("/create", PostsHandlers.createPost);

router.get("/delete/:id", PostsHandlers.deletePostGet);

router.post("/delete/:id", PostsHandlers.deletePost);

export const apiRouter = new Router();

apiRouter.post("/create", PostsApiHandlers.createPost);

apiRouter.get("/authors", PostsApiHandlers.getListAuthors);
