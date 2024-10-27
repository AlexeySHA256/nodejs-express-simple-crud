import { TokensRepositoryImpl } from "../users/repository.js";
import { Token, TokenScopes } from "../users/domain/models.js";
import { NotFoundError } from "./repositoryErrors.js";
export var unauthenticatedActions;
(function (unauthenticatedActions) {
    unauthenticatedActions["REDIRECT_TO_LOGIN"] = "REDIRECT_TO_LOGIN";
    unauthenticatedActions["JSON_ERROR"] = "JSON_ERROR";
})(unauthenticatedActions || (unauthenticatedActions = {}));
class Middlewares {
    _tokensRepo;
    constructor() {
        this._tokensRepo = new TokensRepositoryImpl();
    }
    authenticate = (req, res, next) => {
        // Authenticates user's request using token in headers or cookies
        const unathorized = (msg = "Unauthorized") => res.status(401).json({ success: false, error: msg });
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies.token;
        if (!authHeader && !cookieToken) {
            next();
            return;
        }
        let plainToken;
        if (authHeader) {
            const [prefix, headerToken] = authHeader.split(" ");
            if (authHeader.split(" ").length !== 2 || prefix !== "Bearer") {
                unathorized("Invalid token format, should be: 'Bearer <token>'");
                return;
            }
            plainToken = headerToken;
        }
        else {
            plainToken = cookieToken;
        }
        const tokenHash = Token.hashFromPlainText(plainToken);
        this._tokensRepo.getToken({ hash: tokenHash, scope: TokenScopes.AUTHORIZATION, withUser: true })
            .then((token) => {
            if (token.isExpired()) {
                console.log('token expired', 'plaintext', plainToken);
                // if token comes from cookie, just remove it
                if (plainToken === cookieToken) {
                    console.log('clearing cookie with expired token', 'plaintext', plainToken);
                    res.clearCookie("token");
                    next();
                }
                else {
                    unathorized("Your token expired, can't authenticate");
                }
                return;
            }
            req.user = token.user;
            next();
        })
            .catch((err) => {
            if (err instanceof NotFoundError) {
                console.log('token not found', 'plaintext', plainToken);
                unathorized();
            }
            else {
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });
    };
    requireAuthenticated = (actionOnFail) => {
        return (req, res, next) => {
            if (!req.user) {
                switch (actionOnFail) {
                    case unauthenticatedActions.REDIRECT_TO_LOGIN:
                        res.redirect("/users/signin");
                        break;
                    case unauthenticatedActions.JSON_ERROR:
                        res.status(401).json({ success: false, error: "Unauthorized" });
                        break;
                }
                return;
            }
            next();
        };
    };
}
export default new Middlewares();
//# sourceMappingURL=middlewares.js.map