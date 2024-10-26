import { MailtrapMailer } from "../mailer.js";
import { UsersService } from "./domain/service.js";
import { UsersApiHandlers, UsersHandlers } from "./handlers.js";
import { BcryptHasher } from "./hashing.js";
import { TokensRepositoryImpl, UsersRepositoryImpl } from "./repository.js";

class Container {
    handlers: UsersHandlers
    apiHandlers: UsersApiHandlers
    constructor() {
        const hasher = new BcryptHasher();
        const mailer = new MailtrapMailer();
        const usersRepo = new UsersRepositoryImpl();
        const tokensRepo = new TokensRepositoryImpl();
        const usersService = new UsersService(hasher, mailer, usersRepo, tokensRepo);
        this.apiHandlers = new UsersApiHandlers(usersService)
        this.handlers = new UsersHandlers()
    }
}

export const container = new Container()