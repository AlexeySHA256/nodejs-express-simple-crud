import { BaseForm, fieldGenerators, FormField, validationOutput } from "../core/forms.js";
import validator from "validator";

const postFieldsGenerator: fieldGenerators = {
  title: (isRequired: boolean) => new FormField(
    "title",
    (value): validationOutput => {
      value = String(value).trim();
      if (!validator.isLength(value, { min: 3, max: 20 })) {
        return "Title should be between 3 and 20 characters"
      }
      return null
    },
    isRequired
  ),
  body: (isRequired: boolean) => new FormField(
    "body",
    (value): validationOutput => {
      value = String(value).trim();
      const options = { min: 10, max: 300 }
      if (!validator.isLength(value, options)) {
        return `Body should be between ${options.min} and ${options.max} characters`
      }
      return null
    },
    isRequired
  ),
}

const commentFieldsGenerator: fieldGenerators = {
  title: (isRequired: boolean) => new FormField(
    'title',
    (value): validationOutput => {
      value = String(value).trim();
      const options = { min: 3, max: 30 }
      if (!validator.isLength(value, options)) {
        return `Title should be between ${options.min} and ${options.max} characters`
      }
      return null
    },
    isRequired
  ),
  content: (isRequired: boolean) => new FormField(
    'content',
    (value): validationOutput => {
      value = value.trim();
      if (!validator.isLength(String(value), { min: 10, max: 300 })) {
        return 'Content should be between 10 and 300 characters'
      }
      return null
    },
    isRequired
  ),

  imageUrl: (isRequired: boolean) => new FormField(
    'imageUrl',
    (value): validationOutput => {
      value = String(value).trim();
      if (!validator.isURL(value)) {
        return 'Image URL is not valid'
      }
      return null
    },
    isRequired
  ),

  postId: (isRequired: boolean) => new FormField('postId', (value): validationOutput => {
      if (!validator.isInt(String(value))) {
        return 'Post ID is not valid'
      }
      return null
    },
    isRequired
  ),
}

export class PostCreateForm extends BaseForm {
  constructor(data?: { [key: string]: any }) {
    super(Object.values(postFieldsGenerator).map((fieldGen) => fieldGen(true)), data);
  }
}

export class PostUpdateForm extends BaseForm {
  constructor(data?: { [key: string]: any }) {
    super(Object.values(postFieldsGenerator).map((fieldGen) => fieldGen(false)), data);
  }
}

export class CommentCreateForm extends BaseForm {
  constructor(data?: { [key: string]: any }) {
    const fields = [
      commentFieldsGenerator.title(true),
      commentFieldsGenerator.content(true),
      commentFieldsGenerator.imageUrl(false),
      commentFieldsGenerator.postId(true)
    ]
    super(fields, data);
  }
}

export class CommentUpdateForm extends BaseForm {
  constructor(data?: { [key: string]: any }) {
    super(Object.values(commentFieldsGenerator).map((fieldGen) => fieldGen(false)), data);
  }
}