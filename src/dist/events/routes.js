import { Router } from "express";
import EventsHandlers from "./handlers.js";
const router = Router();
router.post("/create", ...EventsHandlers.eventValidationRequiredAll(), EventsHandlers.createEvent);
router.put("/update/:id", EventsHandlers.eventValidationOptional(), EventsHandlers.idParamValidation(), EventsHandlers.updateEvent);
router.delete("/delete/:id", EventsHandlers.idParamValidation(), EventsHandlers.deleteEvent);
router.get("/", EventsHandlers.eventDateQueryValidation(), EventsHandlers.getEvents);
export default router;
//# sourceMappingURL=routes.js.map