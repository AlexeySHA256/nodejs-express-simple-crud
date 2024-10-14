

export class Event {
    id!: number;
    name!: string;
    date!: Date;
    description!: string | null;
    constructor(id: number, name: string, date: Date, description: string | null) {
        Object.assign(this, { id, name, date, description });
    }

    static fromObject(obj: { id: number, name: string, date: Date, description: string | null }): Event {
        return new Event(obj.id, obj.name, obj.date, obj.description);
    }
}