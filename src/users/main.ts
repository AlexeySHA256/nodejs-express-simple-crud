import { MailtrapMailer } from "../mailer.js";
import { UsersService } from "./domain/service.js";
import UsersHandlers from "./handlers.js";
import { BcryptHasher } from "./hashing.js";
import { TokensRepositoryImpl, UsersRepositoryImpl } from "./repository.js";

class Container {
    handlers: UsersHandlers
    constructor() {
        const hasher = new BcryptHasher();
        const mailer = new MailtrapMailer();
        const usersRepo = new UsersRepositoryImpl();
        const tokensRepo = new TokensRepositoryImpl();
        const usersService = new UsersService(hasher, mailer, usersRepo, tokensRepo);
        this.handlers = new UsersHandlers(usersService)
    }
}

export const container = new Container()