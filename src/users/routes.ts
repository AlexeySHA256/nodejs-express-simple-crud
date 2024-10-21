import { Router } from "express";
import UsersHandlers from "./handlers.js";

const router = Router();

router.get("/list", UsersHandlers.listUsers);
router.post("/signup", UsersHandlers.signUp);
router.post("/signin", UsersHandlers.signIn);
router.put("/activate", UsersHandlers.activateUser);

export default router