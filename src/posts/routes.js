import { Router } from "express";
import PostsHandlers from "./handlers.js";

const router = new Router();

router.get("/", PostsHandlers.paginationValidation(), PostsHandlers.listPosts);
router.get("/:id", PostsHandlers.idParamValidation(), PostsHandlers.getPost);

router.get(
  "/update/:id",
  PostsHandlers.idParamValidation(),
  PostsHandlers.updatePostGet
);
router.post(
  "/update/:id",
  PostsHandlers.idParamValidation(),
  PostsHandlers.postValidation(),
  PostsHandlers.updatePost
);

export default router;
