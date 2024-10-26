import datesRouter from "./dates/routes.js";
import eventsRouter from "./events/routes.js";
import { usersRouter, usersApiRouter } from "./users/routes.js";
import { postsApiRouter, postsRouter } from "./posts/routes.js";
import { Router } from "express";
export const apiRouter = Router();
apiRouter.use("/dates", datesRouter);
apiRouter.use("/events", eventsRouter);
apiRouter.use("/posts", postsApiRouter);
apiRouter.use("/users", usersApiRouter);
export const webRouter = Router();
webRouter.use("/posts", postsRouter);
webRouter.use("/users", usersRouter);
//# sourceMappingURL=routes.js.map