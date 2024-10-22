import validator from "validator";
import { BaseForm, FormField, validationOutput } from "../core/forms.js";


const userFieldsGenerator = {
    firstName: () => new FormField('firstName', (value): validationOutput => {
        if (!validator.isAlpha(value)) {
            return 'First name should only contain alphabetic characters';
        }
        return null;
    }),
    lastName: () => new FormField('lastName', (value): validationOutput => {
        if (!validator.isAlpha(value)) {
            return 'Last name should only contain alphabetic characters';
        }
        return null;
    }),
    email: () => new FormField('email', (value): validationOutput => {
        if (!validator.isEmail(value)) {
            return 'Email is not valid';
        }
        return null;
    }),
    password: () => new FormField('password', (value): validationOutput => {
        if (!validator.isLength(value, { min: 8 })) {
            return 'Password should be at least 8 characters long';
        }
        return null;
    })
}

export class UserCreateForm extends BaseForm {
    constructor(data?: { [key: string]: any }) {
        const fields = Object.values(userFieldsGenerator).map((fieldGen) => {
            const field = fieldGen()
            field.required = true
            return field
        })
        fields.push(new FormField('password2', (value): validationOutput => {
            if (!validator.equals(value, data?.password)) {
                return 'Passwords do not match';
            }
            return null;
        }, true))
        super(fields, data);
    }
}

export class UserLoginForm extends BaseForm {
    constructor(data?: { [key: string]: any }) {
        const fields = [userFieldsGenerator.email(), userFieldsGenerator.password()]
        fields.forEach((field) => field.required = true)
        super(fields, data);
    }
}

export class ActivateUserForm extends BaseForm {
    constructor(data?: { [key: string]: any }) {
        super([new FormField("token", (value): validationOutput => {
            if (!value) {
                return "Token is required";
            }
            return null;
        }, true)], data);
    }  
}