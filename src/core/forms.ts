
export type validationOutput = string | null
type validationFuncT = (value: any) => validationOutput

export type fieldGenerators = { [key: string]: (isRequired: boolean) => FormField }

export enum htmlInputTypes {
  TEXT = "text",
  NUMBER = "number",
  EMAIL = "email",
  PASSWORD = "password",
  CHECKBOX = "checkbox"
}

export class FormField {
  name: string;
  validationFunc: validationFuncT;
  error: string | null;
  value: any;
  isRequired: boolean = false;
  htmlType: htmlInputTypes = htmlInputTypes.TEXT;

  constructor(fieldName: string, validationFunc: validationFuncT, isRequired?: boolean, htmlType?: htmlInputTypes) {
    this.name = fieldName;
    this.validationFunc = validationFunc;
    this.error = null;
    this.value = null;
    this.isRequired = isRequired !== undefined ? isRequired : this.isRequired;
    this.htmlType = htmlType !== undefined ? htmlType : this.htmlType
  }

  validate() {
    let emptyValueError: string | null = null;
    if (this.isRequired) {
      emptyValueError = `${this.name} is required`;
    }
    this.error = this.value ? this.validationFunc(this.value) : emptyValueError;
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

  getErrors(): { [key: string]: string | string[] } {
    const errors: { [key: string]: string | string[] } = {};
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
