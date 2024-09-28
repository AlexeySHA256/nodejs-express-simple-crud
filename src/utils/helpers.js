import { validationResult } from "express-validator";

export function isValidationFailed(req, res) {
    const validationErrs = validationResult(req);
    if (!validationErrs.isEmpty()) {
      res.status(422).json({errors: validationErrs.array()});
      return true
    }
    return false
}