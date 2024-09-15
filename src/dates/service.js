import moment from "moment-timezone";


export class ServiceError extends Error {}

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

