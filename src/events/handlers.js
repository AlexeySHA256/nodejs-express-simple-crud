import { body, validationResult } from "express-validator";
import { EventsService } from "./service.js";
import { UniqueViolationError } from "./repository.js";

class EventsHandlers {

    constructor() {
      this.service = new EventsService();
    }

    nameValidation() {
        return body("name").trim().notEmpty().isLength({min: 3, max: 20}).withMessage("Name is required")
    }

    dateValidation() {
        return body("date").trim().notEmpty().isDate().withMessage("Date is required")
    }

    descriptionValidation() {
        return body("description").trim().optional().isLength({min: 5, max: 300})
    }

    eventValidation() {
        return [this.nameValidation(), this.dateValidation(), this.descriptionValidation()]
    }
  
    createEvent = (req, res) => {
      const validationErrs = validationResult(req);
      if (!validationErrs.isEmpty()) {
        return res.status(422).json({errors: validationErrs.array()});
      }
        this.service.createEvent(req.body).then(result => res.status(201).json(result))
        .catch(e => {
          switch (true) {
            case e instanceof UniqueViolationError:
              res.status(409).json({error: e.message});
              break;
            default:
              res.status(500).json({error: e});
          }
        })
      }
}
  
export default new EventsHandlers();