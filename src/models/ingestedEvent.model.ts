export class IngestedEvent {
    public eventName!: string;
    public timestamp!: number;
    public accountId!: string;
    public customerAlias!: string;
    public ref!: string;
    public data!: Record<string, any>;

    constructor(event: Partial<IngestedEvent>) {
        Object.assign(this, event);
    }
}