import { EventRepository } from "./repository.js";

export class EventsService {
    constructor() {
      this.repo = new EventRepository();
    }
    createEvent(eventData) {
      return this.repo.createEvent(eventData)
    }

    getEvents(date) {
      let events;
      if (date) {
        events = this.repo.getEventByDate(date)
      } else {
        events = this.repo.listEvents()
      }
      return events.then(events => {
        console.log(events);
        return {events, date}
        
      })
    }

    getAllEvents() {}

    updateEvent(eventData) {}

    deleteEvent(eventId) {}
  }