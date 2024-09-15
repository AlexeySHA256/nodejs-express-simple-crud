import datesRouter from "./dates/routes.js";
import eventsRouter from "./events/routes.js";
import { Router } from "express";

const router = new Router();

router.use("/dates", datesRouter);
router.use("/events", eventsRouter);

export default router