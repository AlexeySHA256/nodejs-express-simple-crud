import {DatesService, ValidationError, ServiceError} from "./service.js";

class DatesHandlers {
  constructor() {
    this.service = new DatesService();
  }

  _handleErr(e, res) {
    console.error(e);
    if (e instanceof ServiceError) {
        return res.status(e.status).json({error: e.message});
    }
    res.status(500).json({error: e});
  }

  getCurrentDate = (req, res) => {
    try {
        // let timezone = req.query.timezone || moment.tz.guess();
        // let format = req.query.format || "YYYY-MM-DD HH:mm:ss";
        // const currDate = moment().tz(timezone).format(format);
        const currDate = this.service.getCurrentDate(req.query.timezone, req.query.format)
        res.json({currDate});
    } catch (e) {
        this._handleErr(e, res);
    }
  }

  getDifference = (req, res) => {
    try {
      const result = this.service.getDifferenceBetweenDates(req.query.date1, req.query.date2, req.query.diff_format)
      res.json(result);
    } catch (e) {
      this._handleErr(e, res);
    }
  }

}

export default new DatesHandlers()