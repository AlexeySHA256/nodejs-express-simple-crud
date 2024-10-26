export class Event {
    id;
    name;
    date;
    description;
    constructor(id, name, date, description) {
        Object.assign(this, { id, name, date, description });
    }
    static fromObject(obj) {
        return new Event(obj.id, obj.name, obj.date, obj.description);
    }
}
//# sourceMappingURL=models.js.map