import { query, validationResult } from "express-validator";
import { DatesService } from "./service.js";
import moment from "moment-timezone";
import path from "path";
class DatesHandlers {
    _service;
    constructor() {
        this._service = new DatesService();
    }
    validateTimezone() {
        return query("timezone").trim().custom((val => {
            if (val && !moment.tz.names().includes(val)) {
                console.log('error', val);
                throw new Error("Unavailable timezone: " + val);
            }
            console.log('no errors');
            return true;
        })).default("UTC");
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
                    throw new Error(`Unavailable diff_format: ${val}. Choices are: ${availableFormats}`);
                }
            };
            values.forEach(validate);
            return true;
        })).default(["days"]);
    }
    validateDate(fieldName) {
        return query(fieldName).trim().notEmpty().isDate().withMessage(`${fieldName} is required and must be a valid date`);
    }
    index = (req, res) => {
        try {
            res.sendFile(path.resolve(import.meta.dirname, path.join("..", "templates", "dates.html")));
        }
        catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    };
    getCurrentDate = (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(422).json({ errors: errors.array() });
                return;
            }
            const currDate = this._service.getCurrentDate(String(req.query.timezone), String(req.query.format));
            res.json({ currDate });
        }
        catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    };
    getDifference = (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(422).json({ errors: errors.array() });
                return;
            }
            const date1 = moment(String(req.query.date1));
            const date2 = moment(String(req.query.date2));
            const diffFormat = String(req.query.diff_format).split(',');
            const result = this._service.getDifferenceBetweenDates(date1, date2, diffFormat);
            res.json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    };
}
export default new DatesHandlers();
//# sourceMappingURL=handlers.js.map