import { Router } from "express";
import UsersHandlers from "./handlers.js";

const router = Router();

router.get("/list", UsersHandlers.listUsers);
router.post("/signup", UsersHandlers.signUp);

export default router;