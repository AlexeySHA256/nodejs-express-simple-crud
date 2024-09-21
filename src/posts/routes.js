import { Router } from "express";
import PostsHandlers from "./handlers.js";

const router = new Router();

router.get("/", PostsHandlers.paginationValidation(), PostsHandlers.list);
router.get("/:id", PostsHandlers.idParamValidation(), PostsHandlers.getPost);

export default router;
