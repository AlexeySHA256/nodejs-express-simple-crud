import db from "../db.js";

export class RepositoryError extends Error {}

export class UniqueViolationError extends RepositoryError {}

export class EventRepository {
    async createEvent(eventData) {
        return db.query("INSERT INTO events(name, date, description) VALUES ($1, $2, $3) RETURNING *", [
          eventData.name,
          eventData.date,
          eventData.description,
        ]).then(result => result.rows[0]).catch(err => {
          switch (err.code) {
            case "23505":
              throw new UniqueViolationError("Event with this name already exists");
            default:
              throw err;
          }
        })
    }

    async getEventByDate(date) {
        return db.query("SELECT * FROM events WHERE date = $1", [date]).then(result => result.rows);
    }

    async listEvents() {
        return db.query("SELECT * FROM events").then(result => result.rows);
    }

    async deleteEvent(eventId) {
        await db.query("DELETE FROM events WHERE id = $1", [eventId])
    }

    async updateEvent(eventData) {
        db.query("UPDATE events SET name = $1, date = $2, description = $3 WHERE id = $4 RETURNING *", [
          eventData.name,
          eventData.date,
          eventData.description,
          eventData.id
        ]).then(result => result.rows[0]).catch(err => {
          switch (err.code) {
            case "23505":
              throw new UniqueViolationError("Event with this name already exists");
            default:
              throw err;
          }
        })
    }
}