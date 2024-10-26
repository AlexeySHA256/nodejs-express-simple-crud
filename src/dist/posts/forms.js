import { BaseForm, FormField, htmlInputTypes } from "../core/forms.js";
import validator from "validator";
const postFieldsGenerator = {
    title: (isRequired) => new FormField("title", (value) => {
        value = String(value).trim();
        if (!validator.isLength(value, { min: 3, max: 20 })) {
            return "Title should be between 3 and 20 characters";
        }
        return null;
    }, isRequired),
    body: (isRequired) => new FormField("body", (value) => {
        value = String(value).trim();
        const options = { min: 10, max: 300 };
        if (!validator.isLength(value, options)) {
            return `Body should be between ${options.min} and ${options.max} characters`;
        }
        return null;
    }, isRequired),
};
const commentFieldsGenerator = {
    title: (isRequired) => new FormField('title', (value) => {
        value = String(value).trim();
        const options = { min: 3, max: 30 };
        if (!validator.isLength(value, options)) {
            return `Title should be between ${options.min} and ${options.max} characters`;
        }
        return null;
    }, isRequired),
    content: (isRequired) => new FormField('content', (value) => {
        value = value.trim();
        if (!validator.isLength(String(value), { min: 10, max: 300 })) {
            return 'Content should be between 10 and 300 characters';
        }
        return null;
    }, isRequired),
    imageUrl: (isRequired) => new FormField('imageUrl', (value) => {
        value = String(value).trim();
        if (!validator.isURL(value)) {
            return 'Image URL is not valid';
        }
        return null;
    }, isRequired),
    postId: (isRequired) => new FormField('postId', (value) => {
        if (!validator.isInt(String(value))) {
            return 'Post ID is not valid';
        }
        return null;
    }, isRequired, htmlInputTypes.NUMBER),
};
export class PostsListForm extends BaseForm {
    constructor(data) {
        const fields = [
            new FormField('page_size', (value) => {
                if (!validator.isInt(String(value))) {
                    return 'Page size is not valid integer';
                }
                if (Number(value) < 1 || Number(value) > 50) {
                    return 'Page size should be between 1 and 50';
                }
                return null;
            }, false),
            new FormField('page_num', (value) => {
                if (!validator.isInt(String(value))) {
                    return 'Page number is not valid integer';
                }
                if (Number(value) < 1) {
                    return 'Page number should be greater than 0';
                }
                return null;
            }, false)
        ];
        super(fields, data);
    }
}
export class PostCreateForm extends BaseForm {
    constructor(data) {
        super(Object.values(postFieldsGenerator).map((fieldGen) => fieldGen(true)), data);
    }
}
export class PostUpdateForm extends BaseForm {
    constructor(data) {
        super(Object.values(postFieldsGenerator).map((fieldGen) => fieldGen(false)), data);
    }
}
export class CommentCreateForm extends BaseForm {
    constructor(data) {
        const fields = [
            commentFieldsGenerator.title(true),
            commentFieldsGenerator.content(true),
            commentFieldsGenerator.imageUrl(false),
            commentFieldsGenerator.postId(true)
        ];
        super(fields, data);
    }
}
export class CommentUpdateForm extends BaseForm {
    constructor(data) {
        super(Object.values(commentFieldsGenerator).map((fieldGen) => fieldGen(false)), data);
    }
}
//# sourceMappingURL=forms.js.map