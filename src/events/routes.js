import { Router } from "express";
import EventsHandlers from "./handlers.js";

const router = new Router();

router.post(
  "/create",
  ...EventsHandlers.eventValidationRequiredAll(),
  EventsHandlers.createEvent
);
router.put(
  "/update/:id",
  EventsHandlers.eventValidationOptional(),
  EventsHandlers.idParamValidation(),
  EventsHandlers.updateEvent
);
router.get(
  "/",
  EventsHandlers.eventDateQueryValidation(),
  EventsHandlers.getEvents
);

export default router;
