import validator from "validator";
import { BaseForm, FormField, htmlInputTypes, } from "../core/forms.js";
const userFieldsGenerator = {
    firstName: (isRequired) => new FormField("firstName", (value) => {
        if (!validator.isAlpha(value)) {
            return "First name should only contain alphabetic characters";
        }
        return null;
    }, isRequired),
    lastName: (isRequired) => new FormField("lastName", (value) => {
        if (!validator.isAlpha(value)) {
            return "Last name should only contain alphabetic characters";
        }
        return null;
    }, isRequired),
    email: (isRequired) => new FormField("email", (value) => {
        if (!validator.isEmail(value)) {
            return "Email is not valid";
        }
        return null;
    }, isRequired, htmlInputTypes.EMAIL),
    password: (isRequired) => new FormField("password", (value) => {
        if (!validator.isLength(value, { min: 8 })) {
            return "Password should be at least 8 characters long";
        }
        return null;
    }, isRequired, htmlInputTypes.PASSWORD),
};
export class UserCreateForm extends BaseForm {
    constructor(data) {
        const fields = Object.values(userFieldsGenerator).map((fieldGen) => fieldGen(true));
        fields.push(new FormField("password2", (value) => {
            if (!validator.equals(value, data?.password)) {
                return "Passwords do not match";
            }
            return null;
        }, true, htmlInputTypes.PASSWORD));
        super(fields, data);
    }
}
export class UserLoginForm extends BaseForm {
    constructor(data) {
        const fields = [
            userFieldsGenerator.email(true),
            userFieldsGenerator.password(true),
        ];
        super(fields, data);
    }
}
export class ActivateUserForm extends BaseForm {
    constructor(data) {
        super([
            new FormField("token", (value) => {
                if (value.length !== 32) {
                    return ("Token is not valid. Should be 32 characters long, yours is: " +
                        value.length);
                }
                return null;
            }, true),
        ], data);
    }
}
//# sourceMappingURL=forms.js.map