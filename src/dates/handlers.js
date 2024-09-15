import { matchedData, query, validationResult } from "express-validator";
import {DatesService, ValidationError, ServiceError } from "./service.js";
import moment from "moment-timezone";

class DatesHandlers {
  constructor() {
    this.service = new DatesService();
  }

  validateTimezone() {
    return query("timezone").trim().custom((val => {      
      if (val && !moment.tz.names().includes(val)) {
        console.log('error', val);
        throw new Error("Unavailable timezone: " + tz);
      }
      console.log('no errors');
      return true;
    })).default("UTC")
  }

  validateDateFormat() {
    return query("format").trim().custom((val => {
      if (!moment(moment(), val, true).isValid()) {
        throw new Error("Unavailable format: " + val);
      }
      return true;
    })).default("YYYY-MM-DD HH:mm:ss");
  }

  validateDiffFormat() {
    const availableFormats = [
      "hours",
      "seconds",
      "minutes",
      "years",
      "months",
      "weeks",
      "days",
    ];
    return query("diff_format").optional().toArray().custom((values => {
      const validate = (val) => {
        if (!availableFormats.includes(val)) {
          throw new Error(
            `Unavailable diff_format: ${val}. Choices are: ${availableFormats}`
          );
        }
      }
      values.forEach(validate);
      return true;
    })).default(["days"]);
  }

  validateDate(fieldName) {
    return query(fieldName).trim().notEmpty().isDate().withMessage(`${fieldName} is required and must be a valid date`);
  }

  _handleErr(e, res) {
    console.error(e);
    if (e instanceof ServiceError) {
        return res.status(e.status).json({error: e.message});
    }
    res.status(500).json({error: e});
  }

  getCurrentDate = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }
    try {
        const currDate = this.service.getCurrentDate(req.query.timezone, req.query.format);
        res.json({currDate});
    } catch (e) {
        this._handleErr(e, res);
    }
  }

  getDifference = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }
    
    const date1 = moment(req.query.date1);
    const date2 = moment(req.query.date2);
    const diffFormat = req.query.diff_format;
    try {
      const result = this.service.getDifferenceBetweenDates(date1, date2, diffFormat);
      res.json(result);
    } catch (e) {
      this._handleErr(e, res);
    }
  }

}

export default new DatesHandlers()