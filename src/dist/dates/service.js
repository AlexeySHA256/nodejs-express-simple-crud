import moment from "moment-timezone";
export class DatesService {
    getCurrentDate(timezone, dateFormat) {
        return moment().tz(timezone).format(dateFormat);
    }
    getDifferenceBetweenDates(date1, date2, diffFormats) {
        const result = { difference: {} };
        diffFormats.forEach(format => result["difference"][format] = date2.diff(date1, format));
        return result;
    }
}
//# sourceMappingURL=service.js.map