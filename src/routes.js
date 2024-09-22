import datesRouter from "./dates/routes.js";
import eventsRouter from "./events/routes.js";
import postsRouter from "./posts/routes.js";
import { Router } from "express";

export const apiRouter = new Router();

apiRouter.use("/dates", datesRouter);
apiRouter.use("/events", eventsRouter);

export const webRouter = new Router();

webRouter.use("/posts", postsRouter)