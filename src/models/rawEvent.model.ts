import { MongoEntity } from "./mongoEntity.model";

export class RawEvent extends MongoEntity{
  public eventName!: string;
  public timestamp!: number;
  public accountId!: string;
  public customerAlias!: string;
  public ref!: string;
  public data!: Record<string, any>;

  constructor(event: Partial<RawEvent>) {
      super();
      this.assign(event);
  }
}