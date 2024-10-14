import { NotFoundError, UniqueViolationError } from "../../core/repositoryErrors.js";
import { EventRepository } from "../repository.js";
import { Event } from "./models.js";

export class EventAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`Event '${name}' already exists`);
  }
}

export class EventNotFoundError extends Error {
  constructor() {
    super(`Event not found`);
  }
}

type eventData = { name: string, date: Date, description: string };

export class EventsService {
  repo: EventRepository;
  constructor() {
    this.repo = new EventRepository();
  }
  createEvent(name: string, date: Date, description: string): Promise<Event> {
    return this.repo.createEvent(name, date, description).catch((err) => {
      if (err instanceof UniqueViolationError) {
        console.log('event already exists');
        throw new EventAlreadyExistsError(name);
      }
      throw err;
    })
  }

  async getEvents(date?: Date): Promise<{ events: Event[], date?: Date }> {
    return this.repo.listEvents(date).then((events) => {
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
    }).catch((err) => {
      if (err instanceof NotFoundError) {
        throw new EventNotFoundError();
      }
      throw err;
    });
  }

  deleteEvent(eventId: number): Promise<void> {
    return this.repo.deleteEvent(eventId);
  }
}
