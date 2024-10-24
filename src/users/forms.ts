import validator from "validator";
import { BaseForm, FormField, validationOutput } from "../core/forms.js";


const userFieldsGenerator = {
    firstName: (isRequired: boolean) => new FormField('firstName', (value): validationOutput => {
        if (!validator.isAlpha(value)) {
            return 'First name should only contain alphabetic characters';
        }
        return null;
    }, isRequired),
    lastName: (isRequired: boolean) => new FormField('lastName', (value): validationOutput => {
        if (!validator.isAlpha(value)) {
            return 'Last name should only contain alphabetic characters';
        }
        return null;
    }, isRequired),
    email: (isRequired: boolean) => new FormField('email', (value): validationOutput => {
        if (!validator.isEmail(value)) {
            return 'Email is not valid';
        }
        return null;
    }, isRequired),
    password: (isRequired: boolean) => new FormField('password', (value): validationOutput => {
        if (!validator.isLength(value, { min: 8 })) {
            return 'Password should be at least 8 characters long';
        }
        return null;
    }, isRequired)
}

export class UserCreateForm extends BaseForm {
    constructor(data?: { [key: string]: any }) {
        const fields = Object.values(userFieldsGenerator).map((fieldGen) => fieldGen(true))
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
        const fields = [userFieldsGenerator.email(true), userFieldsGenerator.password(true)]
        super(fields, data);
    }
}

export class ActivateUserForm extends BaseForm {
    constructor(data?: { [key: string]: any }) {
        super([new FormField("token", (value): validationOutput => {
            if (value.length !== 32) {
                return "Token is not valid. Should be 32 characters long, yours is: " + value.length;
            }
            return null;
        }, true)], data);
    }  
}