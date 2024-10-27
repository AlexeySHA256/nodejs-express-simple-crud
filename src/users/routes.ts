import { Router } from "express";
import { container } from "./main.js";
 
export const usersRouter = Router();
export const usersApiRouter = Router();

const handlers = container.handlers
const apiHandlers = container.apiHandlers

usersApiRouter.get("/list", apiHandlers.listUsers);
usersApiRouter.post("/signup", apiHandlers.signUp);
usersApiRouter.post("/signin", apiHandlers.signIn);
usersApiRouter.put("/activate", apiHandlers.activateUser);

usersRouter.get("/signin", handlers.signInGet);
usersRouter.get("/signup", handlers.signUpGet);
usersRouter.get("/activate", handlers.activateUserGet);