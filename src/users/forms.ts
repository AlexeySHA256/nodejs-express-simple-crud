import validator from "validator";
import { BaseForm, FormField, validationOutput } from "../core/forms.js";


const userFieldsGenerator = {
    firstName: () => new FormField('firstName', (value): validationOutput => {
        if (!value) {
            return 'First name is required';
        }
        if (!validator.isAlpha(value)) {
            return 'First name should only contain alphabetic characters';
        }
        return null;
    }),
    lastName: () => new FormField('lastName', (value): validationOutput => {
        if (!value) {
            return 'Last name is required';
        }
        if (!validator.isAlpha(value)) {
            return 'Last name should only contain alphabetic characters';
        }
        return null;
    }),
    email: () => new FormField('email', (value): validationOutput => {
        if (!value) {
            return 'Email is required';
        }
        if (!validator.isEmail(value)) {
            return 'Email is not valid';
        }
        return null;
    }),
    password: () => new FormField('password', (value): validationOutput => {
        if (!value) {
            return 'Password is required';
        }
        if (!validator.isLength(value, { min: 8 })) {
            return 'Password should be at least 8 characters long';
        }
        return null;
    })
}

export class UserCreateForm extends BaseForm {
    constructor(data?: { [key: string]: any }) {
        const fields = Object.values(userFieldsGenerator).map((field) => field())
        fields.push(new FormField('password2', (value): validationOutput => {
            if (!value) {
                return 'Password repeation is required';
            }
            if (!validator.equals(value, data?.password)) {
                return 'Passwords do not match';
            }
            return null;
        }))
        super(fields, data);
    }
}