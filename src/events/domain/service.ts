import { EventRepository } from "../repository.js";
import { Event } from "./models.js";

type eventData = { name: string, date: Date, description: string };

export class EventsService {
  repo: EventRepository;
  constructor() {
    this.repo = new EventRepository();
  }
  createEvent(name: string, date: Date, description: string): Promise<Event> {
    return this.repo.createEvent(name, date, description);
  }

  async getEvents(date?: Date): Promise<{ events: Event[], date?: Date }> {
    const events = this.repo.listEvents(date);
    return events.then((events) => {
      return { events, date };
    });
  }

  async updateEvent(id: number, eventData: Partial<eventData>): Promise<Event> {
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

  deleteEvent(eventId: number): Promise<void> {
    return this.repo.deleteEvent(eventId);
  }
}
