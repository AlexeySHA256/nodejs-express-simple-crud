import { EventRepository } from "../repository.js";
import { Event } from "./models.js";
export class EventsService {
    repo;
    constructor() {
        this.repo = new EventRepository();
    }
    createEvent(name, date, description) {
        return this.repo.createEvent(name, date, description);
    }
    async getEvents(date) {
        const events = this.repo.listEvents(date);
        return events.then((events) => {
            return { events, date };
        });
    }
    async updateEvent(id, eventData) {
        return this.repo.getEventByID(id).then((event) => {
            const updatedEventData = {
                ...event,
                name: eventData.name || event.name,
                date: eventData.date || event.date,
                description: eventData.description || event.description,
                id: id,
            };
            event = Event.fromObject(updatedEventData);
            return this.repo.updateEvent(event);
        });
    }
    deleteEvent(eventId) {
        return this.repo.deleteEvent(eventId);
    }
}
//# sourceMappingURL=service.js.map