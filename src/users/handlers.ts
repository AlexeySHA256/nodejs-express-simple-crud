import validator from "validator";
import { UserAlreadyExistsError, UsersService } from "./domain/service.js";
import { Request, Response } from "express";
import { UserCreateForm } from "./forms.js";
import { BcryptHasher } from "./hashing.js";
import { MailtrapMailer } from "../mailer.js";

class UsersHandlers {
    private _service: UsersService;
    constructor() {
        const hasher = new BcryptHasher();
        const mailer = new MailtrapMailer();
        this._service = new UsersService(hasher, mailer);
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

    signUp = (req: Request, res: Response) => {
        const form = new UserCreateForm(req.body);
        if (!form.validate()) {
            res.status(422).json({ errors: form.getErrors() });
            return
        }
        this._service
            .signUp(req.body.firstName, req.body.lastName, req.body.email, req.body.password)
            .then((userData) => res.status(201).json({ success: true, user: { ...userData, password: undefined } }))
            .catch((err: Error) => {
                if (err instanceof UserAlreadyExistsError) {
                    res.status(409).json({ error: err.message });
                    return
                } 
                res.status(500).json({ error: "Can't create user, please try again later" });
            });
    }
}

export default new UsersHandlers();