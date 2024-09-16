import { EventRepository } from "./repository.js";

export class EventsService {
  constructor() {
    this.repo = new EventRepository();
  }
  createEvent(eventData) {
    return this.repo.createEvent(eventData);
  }

  getEvents(date) {
    const events = this.repo.listEvents(date);
    return events.then((events) => {
      return { events, date };
    });
  }

  async updateEvent(id, eventData) {
    return this.repo.getEventByID(id).then((eventObj) => {
      eventData = {
        name: eventData.name || eventObj.name,
        date: eventData.date || eventObj.date,
        description: eventData.description || eventObj.description,
        id: id,
      };
      return this.repo.updateEvent(eventData);
    });
  }

  deleteEvent(eventId) {}
}
