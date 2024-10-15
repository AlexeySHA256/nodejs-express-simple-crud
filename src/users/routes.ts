import { Router } from "express";
import UsersHandlers from "./handlers.js";

const router = Router();

router.get("/list", UsersHandlers.listUsers);

export default router;