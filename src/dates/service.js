import moment from "moment-timezone";

export class ServiceError extends Error {
    constructor(...args) {
        super(...args);
        this.status = 500;
    }
}

export class ValidationError extends ServiceError {
    constructor(...args) {
        super(...args);
        this.status = 422;
    }
}

export class DatesService {

  _validateTimezone(tz) {
    if (!moment.tz.names().includes(tz.trim())) {
      throw new ValidationError("Unavailable timezone: " + tz);
    }
  }

  _validateDateFormat(format) {
    if (!moment(moment(), format, true).isValid()) {
      throw new ValidationError("Unavailable format: " + format);
    }
  }

  _validateDiffFormat(format) {
    const availableFormats = [
        "hours",
        "seconds",
        "minutes",
        "years",
        "months",
        "weeks",
        "days",
      ];
    if (!availableFormats.includes(format)) {
      throw new ValidationError(
        `Unavailable diff_format: ${format}. Choices are: ${availableFormats}`
      );
    }
  }

  getCurrentDate(tz, format) {
    let timezone = moment.tz.guess();
    let dateFormat = "YYYY-MM-DD HH:mm:ss";
    if (tz) {
      this._validateTimezone(tz);
      timezone = tz;
    }
    if (format) {
      this._validateDateFormat(format);
      dateFormat = format;
    }
    const currDate = moment().tz(timezone).format(dateFormat);
    return currDate;
  }

  getDifferenceBetweenDates(date1, date2, diffFormat) {
    console.log(diffFormat, typeof diffFormat);
    
    if (!date1 || !date2) {
      throw new ValidationError("Both dates (date1 and date2) are required");
    }
    date1 = moment(date1, true);
    date2 = moment(date2, true);
    diffFormat =
      Array.isArray(diffFormat) ? diffFormat : [diffFormat || "days"];
    const result = {
      difference: {},
    };
    for (const f of diffFormat) {
      this._validateDiffFormat(f);
      result["difference"][f] = date2.diff(date1, f);
    }
    return result;
  }
}

