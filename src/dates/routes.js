import { Router } from "express";
import DatesHandlers from "./handlers.js";


const router = new Router();

router.get("/current", DatesHandlers.getCurrentDate);
router.get("/diff", DatesHandlers.getDifference);

export default router