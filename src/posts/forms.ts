import { BaseForm, FormField, validationOutput } from "../core/forms.js";
import validator from "validator";

const postFieldsGenerator = {
  title: () => new FormField(
    "title",
    (value): validationOutput => {
      if (!value) {
        return "Title is required"
      }
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
      if (!value) {
        return "Body is required"
      }
      value = String(value).trim();
      if (!validator.isLength(value, { min: 10, max: 300 })) {
        return "Body should be between 10 and 300 characters"
      }
      return null
    }
  ),
}

const commentFieldsGenerator = {
  title: () => new FormField(
    'title',
    (value): validationOutput => {
      if (!value) {
        return 'Title is required'
      }
      value = String(value).trim();
      if (!validator.isLength(value, { min: 3, max: 20 })) {
        return 'Title should be between 3 and 20 characters'
      }
      return null
    }
  ),
  content: () => new FormField(
    'content',
    (value): validationOutput => {
      if (!value) {
        return 'Content is required'
      }
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
      if (value) {
        value = String(value).trim();
        if (!validator.isURL(value)) {
          return 'Image URL is not valid'
        }
      }
      return null
    }
  ),

  postId: () => new FormField('postId', (value): validationOutput => {
      if (!value) {
        return 'Post ID is required'
      }
      if (!validator.isInt(String(value))) {
        return 'Post ID is not valid'
      }
      return null
    }
  ),
}

export class PostCreateForm extends BaseForm {
  constructor(data?: { [key: string]: any }) {
    super(Object.values(postFieldsGenerator).map((field) => field()), data);
  }
}

export class PostUpdateForm extends PostCreateForm {}

export class CommentCreateForm extends BaseForm {
  constructor(data?: { [key: string]: any }) {
    super(Object.values(commentFieldsGenerator).map((field) => field()), data);
  }
}