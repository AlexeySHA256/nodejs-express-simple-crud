import { body, query } from "express-validator";
import { EventsService } from "./service.js";
import { UniqueViolationError } from "./repository.js";
import { isValidationFailed } from "../helpers.js";

class EventsHandlers {
  constructor() {
    this.service = new EventsService();
  }

  eventNameValidation() {
    return body("name")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 20 })
      .withMessage("Name is required");
  }

  eventDateValidation() {
    return body("date")
      .trim()
      .notEmpty()
      .isDate()
      .withMessage("Date is required");
  }

  eventDescValidation() {
    return body("description").trim().optional().isLength({ min: 5, max: 300 });
  }

  eventValidation() {
    return [
      this.eventNameValidation(),
      this.eventDateValidation(),
      this.eventDescValidation(),
    ];
  }

  createEvent = (req, res) => {
    if (isValidationFailed(req, res)) {
      return;
    }
    this.service
      .createEvent(req.body)
      .then((result) => res.status(201).json(result))
      .catch((e) => {
        switch (true) {
          case e instanceof UniqueViolationError:
            res.status(409).json({ error: e.message });
            break;
          default:
            res.status(500).json({ error: e });
        }
      });
  };

  eventDateQueryValidation() {
    return query("date")
      .optional()
      .isDate()
      .withMessage("date should be a valid date");
  }

  getEvents = (req, res) => {
    if (isValidationFailed(req, res)) {
      return;
    }
    this.service
      .getEvents(req.query.date)
      .then((result) => res.json(result))
      .catch((e) => res.status(500).json({ error: e }));
  };
}

export default new EventsHandlers();
