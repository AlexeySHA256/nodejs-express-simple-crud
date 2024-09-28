import { body } from "express-validator";
import { BaseForm, FormField } from "../forms.js";

export class PostCreateForm extends BaseForm {
  constructor() {
    const fields = [
      new FormField(
        "title",
        body("title")
          .trim()
          .isLength({ min: 3, max: 20 })
          .withMessage("title should be between 3 and 20 characters")
      ),
      new FormField(
        "body",
        body("body")
          .trim()
          .isLength({ min: 10, max: 300 })
          .withMessage("body should be between 10 and 300 characters")
      ),
      new FormField(
        "author_id",
        body("author_id")
          .trim()
          .isInt({ min: 1 })
          .withMessage("author should be > 0 and valid int")
      ),
    ];
    super(fields);
  }
}
