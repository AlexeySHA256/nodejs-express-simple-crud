import { BaseForm, FormField, validationOutput } from "../core/forms.js";
import validator from "validator";

const postFieldsGenerator = {
  title: () => new FormField(
    "title",
    (value): validationOutput => {
      if (!value) {
        return "Title is required"
      }
      value = value.trim();
      if (!validator.isLength(value, { min: 3, max: 20 })) {
        return "Title should be between 3 and 20 characters"
      }
      return null
    }
  ),
  body: () => new FormField(
    "body",
    (value): validationOutput => {
      if (!value) {
        return "Body is required"
      }
      value = value.trim();
      if (!validator.isLength(value, { min: 10, max: 300 })) {
        return "Body should be between 10 and 300 characters"
      }
      return null
    }
  ),
  author_id: () => new FormField(
    "author_id",
    (value): validationOutput => {
      if (!value) {
        return "author_id is required"
      }
      if (!validator.isInt(value, { min: 1 })) {
        return "author_id must be an integer and greater than 0"
      }
      return null
    }
  )
}

export class PostCreateForm extends BaseForm {
  constructor(data?: { [key: string]: any }) {
    super(Object.values(postFieldsGenerator).map((field) => field()), data);
  }
}

export class PostUpdateForm extends PostCreateForm {}
