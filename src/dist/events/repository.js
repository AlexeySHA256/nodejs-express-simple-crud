import { Event } from "./domain/models.js";
import { NotFoundError, UniqueViolationError } from "../core/repositoryErrors.js";
import { NotFoundErrCode, prisma, UniqueViolationErrCode } from "../db/prisma.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
export class EventRepository {
    async createEvent(name, date, description) {
        return prisma.event.create({ data: { name, date, description } })
            .then((event) => Event.fromObject(event))
            .catch((err) => {
            if (err instanceof PrismaClientKnownRequestError && err.code === UniqueViolationErrCode) {
                throw new UniqueViolationError("Event with this name already exists");
            }
            throw err;
        });
    }
    async listEvents(date) {
        let query = prisma.event.findMany();
        if (date) {
            query = prisma.event.findMany({ where: { date: { gte: date } } });
        }
        return query.then((events) => events.map((event) => Event.fromObject(event)));
    }
    async getEventByID(eventId) {
        return prisma.event.findUniqueOrThrow({ where: { id: eventId } })
            .then((event) => Event.fromObject(event))
            .catch((err) => {
            if (err instanceof PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
                throw new NotFoundError(`Event with id ${eventId} not found`);
            }
            throw err;
        });
    }
    async updateEvent(event) {
        return prisma.event.update({ where: { id: event.id }, data: event })
            .then((event) => Event.fromObject(event))
            .catch((err) => {
            if (err instanceof PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
                throw new NotFoundError(`Event with id ${event.id} not found`);
            }
            throw err;
        });
    }
    async deleteEvent(eventId) {
        return prisma.event.delete({ where: { id: eventId } })
            .then(() => { })
            .catch((err) => {
            if (err instanceof PrismaClientKnownRequestError && err.code === NotFoundErrCode) {
                throw new NotFoundError(`Event with id ${eventId} not found`);
            }
            throw err;
        });
    }
}
//# sourceMappingURL=repository.js.map