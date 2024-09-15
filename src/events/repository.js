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
}