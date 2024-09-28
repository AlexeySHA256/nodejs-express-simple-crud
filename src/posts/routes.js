import { Router } from "express";
import PostsHandlers from "./handlers.js";

const router = new Router();

router.get("/", PostsHandlers.listPosts);
router.get("/detail/:id", PostsHandlers.getPost);

router.get("/update/:id", PostsHandlers.updatePostGet);
router.post("/update/:id", PostsHandlers.updatePost);

router.get("/create", PostsHandlers.createPostGet);
router.post("/create", PostsHandlers.createPost);

router.get("/delete/:id", PostsHandlers.deletePostGet);

router.post("/delete/:id", PostsHandlers.deletePost);

export default router;
