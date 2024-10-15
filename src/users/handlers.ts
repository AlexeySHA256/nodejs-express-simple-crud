import validator from "validator";
import { UsersService } from "./domain/service.js";
import { Request, Response } from "express";

class UsersHandlers {
    private _service: UsersService;
    constructor() {
        this._service = new UsersService();
    }

    listUsers = (req: Request, res: Response) => {
        const limit = String(req.query.limit);
        if (limit) {
            if (!validator.isInt(limit, { min: 1 })) {
                res.status(422).json({ error: "limit must be a positive integer" });
                return;
            }
        }
        this._service.listUsers(+limit);
    }
}

export default new UsersHandlers();