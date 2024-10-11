import moment, { unitOfTime } from "moment-timezone";

export class DatesService {

  getCurrentDate(timezone: string, dateFormat: string) {
    return moment().tz(timezone).format(dateFormat);
  }

  getDifferenceBetweenDates(date1: moment.Moment, date2: moment.Moment, diffFormats: unitOfTime.Diff[]) {
    const result: {difference: {[key: string]: number}} = {difference: {}};
    diffFormats.forEach(format => result["difference"][format] = date2.diff(date1, format));
    return result;
  }
}

