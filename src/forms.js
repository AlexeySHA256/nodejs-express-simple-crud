
export class FormField {
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
  constructor(listFields, data) {
    // list fields should be an array of FormField objects
    this.nonFieldErrors = [];
    this._isValid = true;
    this.fields = listFields;
    this.data = data;
  }

  validate() {
    if (this.data) {
      this.fields.forEach(
        (field) => {
          const value = this.data[field.name];
          field.value = value;
          if (!field.validate()) {
            this._isValid = false;
          }
        }
      );
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
      errors[field.name] = field.error;
    });
    if (this.nonFieldErrors.length > 0) {
      errors["non_field_errors"] = this.nonFieldErrors;
    }
    return errors;
  }
}
