import { Router } from "express";
import DatesHandlers from "./handlers.js";
import path from "path";

const router = new Router();

router.get("/", (req, res) => {
  res.sendFile(
    path.resolve(import.meta.dirname, path.join("..", "templates", "dates.html"))
  );
});

router.get(
  "/current",
  [DatesHandlers.validateDateFormat(), DatesHandlers.validateTimezone()],
  DatesHandlers.getCurrentDate
);
router.get(
  "/diff",
  DatesHandlers.validateDate("date1"),
  DatesHandlers.validateDate("date2"),
  DatesHandlers.validateDiffFormat(),
  DatesHandlers.getDifference
);

export default router;
