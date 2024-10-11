import datesRouter from "./dates/routes.js";
import eventsRouter from "./events/routes.js";
import { apiRouter as postsApiRouter, router as postsRouter } from "./posts/routes.js";
import { Router } from "express";
export const apiRouter = Router();
apiRouter.use("/dates", datesRouter);
apiRouter.use("/events", eventsRouter);
apiRouter.use("/posts", postsApiRouter);
export const webRouter = Router();
webRouter.use("/posts", postsRouter);
//# sourceMappingURL=routes.js.map