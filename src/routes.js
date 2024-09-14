import datesRouter from "./dates/routes.js";
import { Router } from "express";

const router = new Router();

router.use("/dates", datesRouter);

export default router