
export class FormField {
  constructor(fieldName, validationFunc) {
    this.name = fieldName;
    this.validationFunc = validationFunc;
    this.error = null;
    this.value = null;
  }

  validate() {
    const result = this.validationFunc(this.value);
    console.log(result);
    if (result) {
      this.error = result;
      return false;
    }
    this.error = null;
    return true;
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
    console.log(this);
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
    console.log("IS VALID", this._isValid);
    return this._isValid;
  }

  addError(errorMsg) {
    this.nonFieldErrors.push(errorMsg);
    this._isValid = false;
  }
}
