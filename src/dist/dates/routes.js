import { Router } from "express";
import DatesHandlers from "./handlers.js";
const router = Router();
router.get("/", DatesHandlers.index);
router.get("/current", [DatesHandlers.validateDateFormat(), DatesHandlers.validateTimezone()], DatesHandlers.getCurrentDate);
router.get("/diff", DatesHandlers.validateDate("date1"), DatesHandlers.validateDate("date2"), DatesHandlers.validateDiffFormat(), DatesHandlers.getDifference);
export default router;
//# sourceMappingURL=routes.js.map