import { body, param, query } from "express-validator";
import { EventsService } from "./service.js";
import { UniqueViolationError, NotFoundError } from "../repositoryErrors.js";
import { isValidationFailed } from "../helpers.js";

class EventsHandlers {
  constructor() {
    this.service = new EventsService();
  }

  eventNameValidation() {
    return body("name")
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage("name should be between 3 and 20 characters");
  }

  eventDateValidation() {
    return body("date")
      .trim()
      .isDate()
      .withMessage("date should be a valid date")
  }

  eventDescValidation() {
    return body("description").trim().optional().isLength({ min: 5, max: 300 }).withMessage("description should be between 5 and 300 characters");
  }

  eventValidation() {
    return [
      this.eventNameValidation(),
      this.eventDateValidation(),
      this.eventDescValidation(),
    ];
  }

  eventValidationOptional() {
    const validationRules = this.eventValidation();
    validationRules.forEach((validation) => validation.optional());
    return validationRules;
  }

  eventValidationRequiredAll() {
    const validationRules = this.eventValidation();
    validationRules.forEach((validation) => validation.notEmpty());
    return validationRules;
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

  idParamValidation() {
    return param("id")
      .trim()
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("id should be a positive integer and greater than 0");
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

  updateEvent = (req, res) => {
    if (isValidationFailed(req, res)) {
      return;
    }
    if (!Object.keys(req.body).length) {
      return res.status(400).json({ error: "Request body is empty, nothing to update" });
    }
    this.service
      .updateEvent(req.params.id, req.body)
      .then((result) => res.json(result))
      .catch((e) => {
        switch (true) {
          case e instanceof UniqueViolationError:
            res.status(409).json({ error: e.message });
            break;
          case e instanceof NotFoundError:
            res.status(404).json({ error: e.message });
            break;
          default:
            res.status(500).json({ error: e });
        }
      });
  };

  deleteEvent = (req, res) => {
    this.service
      .deleteEvent(req.params.id)
      .then(() => res.status(204).end())
      .catch((e) => {
        switch (true) {
          case e instanceof NotFoundError:
            res.status(404).json({ error: e.message });
            break;
          default:
            res.status(500).json({ error: e });
        }
      });
  };
}

export default new EventsHandlers();
