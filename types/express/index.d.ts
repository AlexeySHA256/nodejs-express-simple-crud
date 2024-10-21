import { User } from "../../src/users/domain/models.ts";

declare module 'express-serve-static-core' {
    interface Request {
        user?: User;
    }
}