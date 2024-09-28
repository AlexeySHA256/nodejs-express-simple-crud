import { BaseForm, FormField } from "../forms.js";
import validator from "validator";


const postTitle = () => new FormField(
  "title",
  (value) => {
    value = value.trim();
    if (!validator.isLength(value, { min: 3, max: 20 })) {
      return "Title should be between 3 and 20 characters"
    }
    return null
  }
)

const postBody = () => new FormField(
  "body",
  (value) => {
    value = value.trim();
    if (!validator.isLength(value, { min: 10, max: 300 })) {
      return "Body should be between 10 and 300 characters"
    }
    return null
  }
)

const postAuthor = () => new FormField(
  "author_id",
  (value) => {
    if (!validator.isInt(value, { min: 1 })) {
      return "author_id must be an integer and greater than 0"
    }
    return null
  }
)

const allPostFields = [postTitle(), postBody(), postAuthor()];

export class PostCreateForm extends BaseForm {
  constructor(data=null) {
    super(allPostFields, data);
  }
}

export class PostUpdateForm extends PostCreateForm {}