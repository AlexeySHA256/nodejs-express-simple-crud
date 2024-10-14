import { prisma } from "../db/prisma.js";
import { User } from "./domain/models.js";
export class UsersRepository {
    async listUsers(limit) {
        return prisma.user.findMany({ take: limit }).then((authors) => authors.map((author) => User.fromObject(author)));
    }
}
//# sourceMappingURL=repository.js.map