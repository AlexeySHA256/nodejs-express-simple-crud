import { TokensRepositoryImpl } from "../users/repository.js";
import { Token, TokenScopes } from "../users/domain/models.js";
import { NotFoundError } from "./repositoryErrors.js";
class Middlewares {
    _tokensRepo;
    constructor() {
        this._tokensRepo = new TokensRepositoryImpl();
    }
    authenticate = async (req, res, next) => {
        const unathorized = (msg = "Unauthorized") => res.status(401).json({ success: false, error: msg });
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            next();
            return;
        }
        const [prefix, plainToken] = authHeader.split(" ");
        if (authHeader.split(" ").length !== 2 || prefix !== "Bearer") {
            unathorized("Invalid token format, should be: 'Bearer <token>'");
            return;
        }
        const tokenHash = Token.hashFromPlainText(plainToken);
        this._tokensRepo.getToken({ hash: tokenHash, scope: TokenScopes.AUTHORIZATION, withUser: true })
            .then((token) => {
            if (token.isExpired()) {
                unathorized("Your token expired, can't authenticate");
            }
            else {
                req.user = token.user;
                next();
            }
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
}
export default new Middlewares();
//# sourceMappingURL=middlewares.js.map