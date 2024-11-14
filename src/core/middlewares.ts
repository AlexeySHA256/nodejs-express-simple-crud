import { NextFunction, Request, Response } from "express";
import {
  TokensRepositoryImpl,
  UsersRepositoryImpl,
} from "../users/repositories.js";
import { Token, TokenScopes, User, UserRoles } from "../users/domain/models.js";
import { NotFoundError } from "./repositoryErrors.js";

export enum unauthenticatedActions {
  REDIRECT_TO_LOGIN = "REDIRECT_TO_LOGIN",
  JSON_ERROR = "JSON_ERROR",
}

type middlewareFunc = (req: Request, res: Response, next: NextFunction) => void;

class Middlewares {
  private _tokensRepo: TokensRepositoryImpl;
  constructor() {
    this._tokensRepo = new TokensRepositoryImpl();
  }

  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    // Authenticates user's request using token in headers or cookies
    const unathorized = (msg: string = "Unauthorized") =>
      res.status(401).json({ success: false, error: msg });
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies.token;
    if (!authHeader && !cookieToken) {
      next();
      return;
    }
    let plainToken: string;
    if (authHeader) {
      const [prefix, headerToken] = authHeader.split(" ");
      if (authHeader.split(" ").length !== 2 || prefix !== "Bearer") {
        unathorized("Invalid token format, should be: 'Bearer <token>'");
        return;
      }
      plainToken = headerToken;
    } else {
      plainToken = cookieToken;
    }
    const tokenHash = Token.hashFromPlainText(plainToken);
    this._tokensRepo
      .getToken({
        hash: tokenHash,
        scope: TokenScopes.AUTHORIZATION,
        withUser: true,
      })
      .then((token) => {
        if (token.isExpired()) {
          console.log("token expired", "plaintext", plainToken);
          // if token comes from cookie, just remove it
          if (plainToken === cookieToken) {
            console.log(
              "clearing cookie with expired token",
              "plaintext",
              plainToken
            );
            res.clearCookie("token");
            next();
          } else {
            unathorized("Your token expired, can't authenticate");
          }
          return;
        }
        res.locals.user = token.user;
        next();
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          console.log("token not found", "plaintext", plainToken);
          unathorized();
        } else {
          res
            .status(500)
            .json({ success: false, error: "Internal server error" });
        }
      });
  };

  requireAuthenticated = (
    actionOnFail: unauthenticatedActions
  ): middlewareFunc => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!res.locals.user) {
        switch (actionOnFail) {
          case unauthenticatedActions.REDIRECT_TO_LOGIN:
            return res.redirect("/users/signin");
          case unauthenticatedActions.JSON_ERROR:
            return res
              .status(401)
              .json({ success: false, error: "Unauthorized" });
        }
      }
      next();
    };
  };

  requireRole = (
    role: UserRoles,
    unauthenticatedAction: unauthenticatedActions = unauthenticatedActions.JSON_ERROR
  ): middlewareFunc => {
    return (req: Request, res: Response, next: NextFunction) => {
      this.requireAuthenticated(unauthenticatedAction)(req, res, () => {
        const user = res.locals.user;
        if (user && (user as User).role !== role) {
          res.status(403).json({ success: false, error: "Forbidden" });
          return;
        }
        next();
      });
    };
  };
}

export default new Middlewares();
