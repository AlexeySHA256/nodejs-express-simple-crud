import validator from "validator";
import { ExpiredTokenError, InvalidCredentialsError, UserAlreadyExistsError, UsersService } from "./domain/service.js";
import { Request, Response } from "express";
import { ActivateUserForm, UserCreateForm, UserLoginForm } from "./forms.js";
import { IUser, IToken } from "./domain/interfaces.js";
import { Token } from "./domain/models.js";


interface UsersServiceI {
    listUsers(limit: number): Promise<IUser[]>
    signUp(firstName: string, lastName: string, email: string, password: string): Promise<IUser>
    signIn(email: string, password: string): Promise<Token>
    activateUser(plainToken: string): Promise<IUser>
}
export class UsersHandlers {
    signInGet = (req: Request, res: Response) => {
        const form = new UserLoginForm();
        res.render("users/signin", { form });
    }

    signUpGet = (req: Request, res: Response) => {
        const form = new UserCreateForm();
        res.render("users/signup", { form });
    }

    activateUserGet = (req: Request, res: Response) => {
        const form = new ActivateUserForm();
        res.render("users/activate", { form });
    }
}

export class UsersApiHandlers {
    private _service: UsersServiceI;
    constructor(service: UsersServiceI) {
        this._service = service
    }

    listUsers = (req: Request, res: Response) => {
        let limit = req.query.limit;
        if (limit) {
            limit = String(limit)
            if (!validator.isInt(String(limit), { min: 1 })) {
                res.status(422).json({ error: "limit must be a positive integer" });
                return;
            }
        } else {
            limit = "10"
        }
        this._service.listUsers(+limit)
            .then((users) => res.json({ success: true, limit, users }))
            .catch((err) => res.status(500).json({ error: err }));
    }

    signUp = (req: Request, res: Response) => {
        const form = new UserCreateForm(req.body);
        if (!form.validate()) {
            res.status(422).json({ errors: form.getErrors() });
            return
        }
        this._service
            .signUp(req.body.firstName, req.body.lastName, req.body.email, req.body.password)
            .then((userData) => res.status(201).json({ success: true, user: { ...userData, passwordHash: undefined } }))
            .catch((err: Error) => {
                if (err instanceof UserAlreadyExistsError) {
                    res.status(409).json({ error: err.message });
                    return
                }
                res.status(500).json({ error: "Can't create user, please try again later" });
            });
    }

    signIn = (req: Request, res: Response) => {
        const form = new UserLoginForm(req.body);
        if (!form.validate()) {
            res.status(422).json({ success: false, errors: form.getErrors() });
            return
        }
        this._service
            .signIn(req.body.email, req.body.password)
            .then((token) => res.json({
                success: true, token: {
                    text: token.plainText,
                    expiry: token.expiry
                }
            }))
            .catch((err: Error) => {
                if (err instanceof InvalidCredentialsError) {
                    res.status(401).json({ success: false, error: err.message });
                } else {
                    console.log('UsersHandlers.signIn: ', err);
                    res.status(500).json({ success: false, error: "Can't sign in, please try again later" });
                }
            });
    }

    activateUser = (req: Request, res: Response) => {
        const form = new ActivateUserForm(req.body);
        if (!form.validate()) {
            res.status(422).json({ success: false, errors: form.getErrors() });
            return
        }
        this._service
            .activateUser(req.body.token)
            .then((updatedUser) => res.json({ success: true, user: { ...updatedUser, passwordHash: undefined } }))
            .catch((err: Error) => {
                if (err instanceof ExpiredTokenError) {
                    res.status(400).json({ success: false, error: err.message });
                    return
                }
                console.log('UsersHandlers.activateUser: ', err);
                res.status(500).json({ success: false, error: "Can't activate user, please try again later" });
            });
    }
}
