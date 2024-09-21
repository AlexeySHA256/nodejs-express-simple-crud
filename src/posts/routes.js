import { Router } from "express";
import PostsHandlers from "./handlers.js";

const router = new Router();

router.get("/", PostsHandlers.paginationValidation(), PostsHandlers.list);

export default router;
