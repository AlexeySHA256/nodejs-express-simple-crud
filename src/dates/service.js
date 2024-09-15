import moment from "moment-timezone";
import EventRepository from "../events/repository.js";


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

  getCurrentDate(timezone, dateFormat) {
    const currDate = moment().tz(timezone).format(dateFormat);
    return currDate;
  }

  getDifferenceBetweenDates(date1, date2, diffFormat) {
    const result = {
      difference: {},
    };
    diffFormat.forEach(format => result["difference"][format] = date2.diff(date1, format));
    return result;
  }
}

