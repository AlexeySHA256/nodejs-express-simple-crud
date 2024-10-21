import { NextFunction, Request, Response } from "express";
import { TokensRepository, UsersRepository } from "../users/repository.js";
import { Token, TokenScopes } from "../users/domain/models.js";
import { NotFoundError } from "./repositoryErrors.js";


class Middlewares {
    private _tokensRepo: TokensRepository;
    constructor() {
        this._tokensRepo = new TokensRepository();
    }

    authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const unathorized = () => res.status(401).json({ success: false, error: "Unauthorized" });  
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            next();
            return
        }
        const [prefix, plainToken] = authHeader.split(" ");
        if (authHeader.split(" ").length !== 2 || prefix !== "Bearer") {
            unathorized();
            return
        }
        const tokenHash = Token.hashFromPlainText(plainToken);
        this._tokensRepo.getToken({ hash: tokenHash, scope: TokenScopes.AUTHORIZATION, withUser: true })
            .then((token) => {
                if (token.isExpired()) {
                    unathorized();
                } else {
                    req.user = token.user;
                    next();
                }
            })
            .catch((err) => {
                if (err instanceof NotFoundError) {
                    unathorized();
                } else {
                    res.status(500).json({ success: false, error: "Internal server error" });
                }
            })
    }
}

export default new Middlewares()