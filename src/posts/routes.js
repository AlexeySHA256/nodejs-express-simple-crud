import { Router } from "express";
import PostsHandlers from "./handlers.js";
import { PostCreateForm } from "./forms.js";

const router = new Router();

router.get("/", PostsHandlers.paginationValidation(), PostsHandlers.listPosts);
router.get("/detail/:id", PostsHandlers.idParamValidation(), PostsHandlers.getPost);

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

router.get("/create", PostsHandlers.createPostGet);
router.post("/create", new PostCreateForm().getValidationChain(), PostsHandlers.createPost);

router.get("/delete/:id", PostsHandlers.idParamValidation(), PostsHandlers.deletePostGet);

router.post("/delete/:id", PostsHandlers.idParamValidation(), PostsHandlers.deletePost);

export default router;
