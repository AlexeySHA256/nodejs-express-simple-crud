export class FormField {
    name;
    validationFunc;
    error;
    value;
    constructor(fieldName, validationFunc) {
        this.name = fieldName;
        this.validationFunc = validationFunc;
        this.error = null;
        this.value = null;
    }
    validate() {
        const errorMsg = this.validationFunc(this.value);
        this.error = errorMsg || null;
        return !errorMsg;
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
        if (this.data) {
            this.fields.forEach((field) => {
                field.value = this.data[field.name];
                if (!field.validate()) {
                    this._isValid = false;
                }
            });
        }
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