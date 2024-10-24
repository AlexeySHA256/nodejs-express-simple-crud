import { Router } from "express";
import { container } from "./main.js";

const postsHandlers = container.handlers
const postsApiHandlers = container.apiHandlers

export const router = Router();

router.get("/", postsHandlers.listPosts);
router.get("/detail/:id", postsHandlers.getPost);

router.get("/update/:id", postsHandlers.updatePostGet);
router.post("/update/:id", postsHandlers.updatePost);

router.get("/create", postsHandlers.createPostGet);
router.post("/create", postsHandlers.createPost);

router.get("/delete/:id", postsHandlers.deletePostGet);

router.post("/delete/:id", postsHandlers.deletePost);

export const apiRouter = Router();

apiRouter.post("/create", postsApiHandlers.createPost);

const _commentsSubrouter = Router();
apiRouter.use("/comments", _commentsSubrouter);

// TODO: Подумать над тем, не лучше ли передавать id поста связанного с комментом в url вместо тела запроса

_commentsSubrouter.post("/create", postsApiHandlers.createComment)
_commentsSubrouter.put("/update/:id", postsApiHandlers.updateComment)
_commentsSubrouter.get("/:id", postsApiHandlers.getComment)
_commentsSubrouter.delete("/delete/:id", postsApiHandlers.deleteComment)
