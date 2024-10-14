
export type validationOutput = string | null
type validationFuncT = (value: any) => validationOutput

export class FormField {
  name: string;
  validationFunc: validationFuncT;
  error: string | null;
  value: any;

  constructor(fieldName: string, validationFunc: validationFuncT) {
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
    if (this.data) {
      this.fields.forEach(
        (field) => {
          field.value = (<{ [key: string]: string }> this.data)[field.name];
          if (!field.validate()) {
            this._isValid = false;
          }
        }
      );
    }
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
