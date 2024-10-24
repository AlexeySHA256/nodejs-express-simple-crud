
export type validationOutput = string | null
type validationFuncT = (value: any) => validationOutput

export type fieldGenerators = { [key: string]: (isRequired: boolean) => FormField }

export class FormField {
  name: string;
  validationFunc: validationFuncT;
  error: string | null;
  value: any;
  required: boolean = false;

  constructor(fieldName: string, validationFunc: validationFuncT, isRequired?: boolean) {
    this.name = fieldName;
    this.validationFunc = validationFunc;
    this.error = null;
    this.value = null;
    if (isRequired !== undefined) {
      this.required = isRequired;
    }
  }

  validate() {
    if (this.required) {
      this.error = this.value ? this.validationFunc(this.value) : `${this.name} is required`;
    } else {
      this.error = this.value ? this.validationFunc(this.value) : null
    }
    return !this.error;
  }
}

export class BaseForm {
  nonFieldErrors: string[];
  _isValid: boolean;
  fields: FormField[];
  data?: { [key: string]: string };
  constructor(listFields: FormField[], data?: { [key: string]: string }) {
    this.nonFieldErrors = [];
    this._isValid = true;
    this.fields = listFields;
    this.data = data;
  }

  validate() {
    if (!this.data) {
      throw new Error("Can't validate form without provided data. Please supply a valid data.")
    }
    this.fields.forEach(
      (field) => {
        field.value = (this.data as { [key: string]: string })[field.name];
        if (!field.validate()) {
          this._isValid = false;
        }
      }
    );
    return this._isValid;
  }

  addError(errorMsg: string) {
    this.nonFieldErrors.push(errorMsg);
    this._isValid = false;
  }

  getErrors(): {[key: string]: string | string[]} {
    const errors: {[key: string]: string | string[]} = {};
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
