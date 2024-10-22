import { BaseForm, FormField, validationOutput } from "../core/forms.js";
import validator from "validator";

const postFieldsGenerator = {
  title: () => new FormField(
    "title",
    (value): validationOutput => {
      value = String(value).trim();
      if (!validator.isLength(value, { min: 3, max: 20 })) {
        return "Title should be between 3 and 20 characters"
      }
      return null
    }
  ),
  body: () => new FormField(
    "body",
    (value): validationOutput => {
      value = String(value).trim();
      const options = { min: 10, max: 300 }
      if (!validator.isLength(value, options)) {
        return `Body should be between ${options.min} and ${options.max} characters`
      }
      return null
    }
  ),
}

const commentFieldsGenerator = {
  title: () => new FormField(
    'title',
    (value): validationOutput => {
      value = String(value).trim();
      const options = { min: 3, max: 30 }
      if (!validator.isLength(value, options)) {
        return `Title should be between ${options.min} and ${options.max} characters`
      }
      return null
    }
  ),
  content: () => new FormField(
    'content',
    (value): validationOutput => {
      value = value.trim();
      if (!validator.isLength(String(value), { min: 10, max: 300 })) {
        return 'Content should be between 10 and 300 characters'
      }
      return null
    }
  ),

  imageUrl: () => new FormField(
    'imageUrl',
    (value): validationOutput => {
      value = String(value).trim();
      if (!validator.isURL(value)) {
        return 'Image URL is not valid'
      }
      return null
    }
  ),

  postId: () => new FormField('postId', (value): validationOutput => {
      if (!validator.isInt(String(value))) {
        return 'Post ID is not valid'
      }
      return null
    }
  ),
}

export class PostCreateForm extends BaseForm {
  constructor(data?: { [key: string]: any }) {
    super(Object.values(postFieldsGenerator).map((fieldGen) => {
      const field = fieldGen()
      field.required = true
      return field
    }), data);
  }
}

export class PostUpdateForm extends BaseForm {
  constructor(data?: { [key: string]: any }) {
    super(Object.values(postFieldsGenerator).map((fieldGen) => fieldGen()), data);
  }
}

export class CommentCreateForm extends BaseForm {
  constructor(data?: { [key: string]: any }) {
    super(Object.values(commentFieldsGenerator).map((fieldGen) => {
      const field = fieldGen()
      field.required = true
      return field
    }), data);
  }
}

export class CommentUpdateForm extends BaseForm {
  constructor(data?: { [key: string]: any }) {
    super(Object.values(commentFieldsGenerator).map((fieldGen) => fieldGen()), data);
  }
}