

export class Event {
    id!: number;
    name!: string;
    date!: Date;
    description!: string;
    constructor(id: number, name: string, date: Date, description: string) {
        Object.assign(this, { id, name, date, description });
    }

    static fromObject(obj: { id: number, name: string, date: Date, description: string }): Event {
        return new Event(obj.id, obj.name, obj.date, obj.description);
    }
}