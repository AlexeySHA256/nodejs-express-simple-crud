import { Router } from "express";
import { handlers as PostsHandlers, apiHandlers as PostsApiHandlers } from "./handlers.js";

export const router = Router();

router.get("/", PostsHandlers.listPosts);
router.get("/detail/:id", PostsHandlers.getPost);

router.get("/update/:id", PostsHandlers.updatePostGet);
router.post("/update/:id", PostsHandlers.updatePost);

router.get("/create", PostsHandlers.createPostGet);
router.post("/create", PostsHandlers.createPost);

router.get("/delete/:id", PostsHandlers.deletePostGet);

router.post("/delete/:id", PostsHandlers.deletePost);

export const apiRouter = Router();

apiRouter.post("/create", PostsApiHandlers.createPost);

const _commentsSubrouter = Router();
apiRouter.use("/comments", _commentsSubrouter);

_commentsSubrouter.post("/create", PostsApiHandlers.createComment)
_commentsSubrouter.put("/update/:id", PostsApiHandlers.updateComment)
_commentsSubrouter.get("/:id", PostsApiHandlers.getComment)
