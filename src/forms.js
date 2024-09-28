import { validationResult } from "express-validator";

export class FormField {

    constructor(fieldName, validationChain) {
        this.name = fieldName;
        this.validation = validationChain;
        this.error = null;
        this.value = null;
    }
}

export class BaseForm {

    constructor(listFields) { // list fields should be an array of FormField objects
        // this.fieldErrors = {};
        this.nonFieldErrors = [];
        this._isValid = true;
        this.fields = listFields;
    }

    getValidationChain() {
        let res = [];
        this.fields.forEach(field => {
            res.push(field.validation);
        })
        return res
    }

    validate(req) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            this._isValid = false;
            const fieldErrors = errors.mapped();
            this.fields.forEach(field => {
                const err = fieldErrors[field.name];
                if (err) {
                    field.error = err.msg;
                }
                field.value = req.body[field.name];
            })
        }
    }

    get isValid() {
        return this._isValid && this.nonFieldErrors.length === 0;
    }

    addError(errorMsg) {
        this.nonFieldErrors.push(errorMsg);
    }
}