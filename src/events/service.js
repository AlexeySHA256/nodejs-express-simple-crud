import { EventRepository } from "./repository.js";

export class EventsService {
    constructor() {
      this.repo = new EventRepository();
    }
    createEvent(eventData) {
      return this.repo.createEvent(eventData).then(result => result)
    }

    getEventByDate(date) {}

    getAllEvents() {}

    updateEvent(eventData) {}

    deleteEvent(eventId) {}
  }