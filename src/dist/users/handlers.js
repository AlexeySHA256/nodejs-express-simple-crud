import validator from "validator";
import { ExpiredTokenError, InvalidCredentialsError, UserAlreadyExistsError } from "./domain/service.js";
import { ActivateUserForm, UserCreateForm, UserLoginForm } from "./forms.js";
export class UsersHandlers {
    signInGet = (req, res) => {
        const form = new UserLoginForm();
        res.render("users/signin", { form });
    };
    signUpGet = (req, res) => {
        const form = new UserCreateForm();
        res.render("users/signup", { form });
    };
}
export class UsersApiHandlers {
    _service;
    constructor(service) {
        this._service = service;
    }
    listUsers = (req, res) => {
        let limit = req.query.limit;
        if (limit) {
            limit = String(limit);
            if (!validator.isInt(String(limit), { min: 1 })) {
                res.status(422).json({ error: "limit must be a positive integer" });
                return;
            }
        }
        else {
            limit = "10";
        }
        this._service.listUsers(+limit)
            .then((users) => res.json({ success: true, limit, users }))
            .catch((err) => res.status(500).json({ error: err }));
    };
    signUp = (req, res) => {
        const form = new UserCreateForm(req.body);
        if (!form.validate()) {
            res.status(422).json({ errors: form.getErrors() });
            return;
        }
        this._service
            .signUp(req.body.firstName, req.body.lastName, req.body.email, req.body.password)
            .then((userData) => res.status(201).json({ success: true, user: { ...userData, passwordHash: undefined } }))
            .catch((err) => {
            if (err instanceof UserAlreadyExistsError) {
                res.status(409).json({ error: err.message });
                return;
            }
            res.status(500).json({ error: "Can't create user, please try again later" });
        });
    };
    signIn = (req, res) => {
        const form = new UserLoginForm(req.body);
        if (!form.validate()) {
            res.status(422).json({ success: false, errors: form.getErrors() });
            return;
        }
        this._service
            .signIn(req.body.email, req.body.password)
            .then((token) => res.json({ success: true, token: {
                text: token.plainText,
                expiry: token.expiry
            } }))
            .catch((err) => {
            if (err instanceof InvalidCredentialsError) {
                res.status(401).json({ success: false, error: err.message });
            }
            else {
                console.log('UsersHandlers.signIn: ', err);
                res.status(500).json({ success: false, error: "Can't sign in, please try again later" });
            }
        });
    };
    activateUser = (req, res) => {
        const form = new ActivateUserForm(req.body);
        if (!form.validate()) {
            res.status(422).json({ success: false, errors: form.getErrors() });
            return;
        }
        this._service
            .activateUser(req.body.token)
            .then((updatedUser) => res.json({ success: true, user: { ...updatedUser, passwordHash: undefined } }))
            .catch((err) => {
            if (err instanceof ExpiredTokenError) {
                res.status(400).json({ success: false, error: err.message });
                return;
            }
            console.log('UsersHandlers.activateUser: ', err);
            res.status(500).json({ success: false, error: "Can't activate user, please try again later" });
        });
    };
}
//# sourceMappingURL=handlers.js.map