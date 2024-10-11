import db from "../db.js";
import { Event } from "./domain/models.js";
import { NotFoundError, UniqueViolationError } from "../core/repositoryErrors.js";

export class EventRepository {
  async createEvent(name: string, date: Date, description: string): Promise<Event> {
    return db
      .query(
        "INSERT INTO events(name, date, description) VALUES ($1, $2, $3) RETURNING *",
        [name, date, description]
      )
      .then((result) => result.rows[0])
      .then((row) => Event.fromObject(row))
      .catch((err) => {
        switch (err.code) {
          case "23505":
            throw new UniqueViolationError(
              "Event with this name already exists"
            );
          default:
            throw err;
        }
      });
  }

  async listEvents(date?: Date): Promise<Event[]> {
    let query = "SELECT * FROM events";
    const queryArgs = [];
    if (date) {
      query += " WHERE date = $1";
      queryArgs.push(date);
    }
    return db.query(query, queryArgs).then((result) => result.rows);
  }

  async getEventByID(eventId: number): Promise<Event> {
    return db
      .query("SELECT * FROM events WHERE id = $1", [eventId])
      .then((result) => {
        if (result.rows.length === 0) {
          throw new NotFoundError(`Event with id ${eventId} not found`);
        }
        return result.rows[0];
      }).then((row) => Event.fromObject(row));
  }

  async updateEvent(event: Event): Promise<Event> {
    return db
      .query(
        "UPDATE events SET name = $1, date = $2, description = $3 WHERE id = $4 RETURNING *",
        [event.name, event.date, event.description, event.id]
      )
      .then((result) => result.rows[0])
      .then((row) => Event.fromObject(row))
      .catch((err) => {
        switch (err.code) {
          case "23505":
            throw new UniqueViolationError(
              "Event with this name already exists"
            );
          default:
            throw err;
        }
      });
  }

  async deleteEvent(eventId: number): Promise<void> {
    return db.query("DELETE FROM events WHERE id = $1 RETURNING id", [eventId])
    .then((result) => {
      if (!result.rows.length) {
        throw new NotFoundError(`Event with id ${eventId} not found`);
      }
    })
  }
}
