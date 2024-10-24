import { Router } from "express";
import { container } from "./main.js";
 
const router = Router();
const usersHandlers = container.handlers

router.get("/list", usersHandlers.listUsers);
router.post("/signup", usersHandlers.signUp);
router.post("/signin", usersHandlers.signIn);
router.put("/activate", usersHandlers.activateUser);

export default router