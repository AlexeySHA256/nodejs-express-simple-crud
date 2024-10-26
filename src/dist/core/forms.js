export var htmlInputTypes;
(function (htmlInputTypes) {
    htmlInputTypes["TEXT"] = "text";
    htmlInputTypes["NUMBER"] = "number";
    htmlInputTypes["EMAIL"] = "email";
    htmlInputTypes["PASSWORD"] = "password";
    htmlInputTypes["CHECKBOX"] = "checkbox";
})(htmlInputTypes || (htmlInputTypes = {}));
export class FormField {
    name;
    validationFunc;
    error;
    value;
    isRequired = false;
    htmlType = htmlInputTypes.TEXT;
    constructor(fieldName, validationFunc, isRequired, htmlType) {
        this.name = fieldName;
        this.validationFunc = validationFunc;
        this.error = null;
        this.value = null;
        this.isRequired = isRequired !== undefined ? isRequired : this.isRequired;
        this.htmlType = htmlType !== undefined ? htmlType : this.htmlType;
    }
    validate() {
        let emptyValueError = null;
        if (this.isRequired) {
            emptyValueError = `${this.name} is required`;
        }
        this.error = this.value ? this.validationFunc(this.value) : emptyValueError;
        return !this.error;
    }
}
export class BaseForm {
    nonFieldErrors;
    _isValid;
    fields;
    data;
    constructor(listFields, data) {
        this.nonFieldErrors = [];
        this._isValid = true;
        this.fields = listFields;
        this.data = data;
    }
    validate() {
        if (!this.data) {
            throw new Error("Can't validate form without provided data. Please supply a valid data.");
        }
        this.fields.forEach((field) => {
            field.value = this.data[field.name];
            if (!field.validate()) {
                this._isValid = false;
            }
        });
        return this._isValid;
    }
    addError(errorMsg) {
        this.nonFieldErrors.push(errorMsg);
        this._isValid = false;
    }
    getErrors() {
        const errors = {};
        this.fields.forEach((field) => {
            if (field.error) {
                errors[field.name] = field.error;
            }
        });
        if (this.nonFieldErrors.length > 0) {
            errors["non_field_errors"] = this.nonFieldErrors;
        }
        return errors;
    }
}
//# sourceMappingURL=forms.js.map