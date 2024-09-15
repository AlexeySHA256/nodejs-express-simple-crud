import { Router } from "express";
import EventsHandlers from "./handlers.js";

const router = new Router();

router.post(
  "/create",
  ...EventsHandlers.eventValidation(),
  EventsHandlers.createEvent
);
router.get(
  "/",
  EventsHandlers.eventDateQueryValidation(),
  EventsHandlers.getEvents
);

export default router;
