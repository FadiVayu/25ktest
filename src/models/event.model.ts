import { ObjectId } from 'mongodb'
import { MongoEntity } from './mongoEntity.model'

export class Event extends MongoEntity {
  public name!: string
  public timestamp!: number
  public metadata!: Record<string, any>
  public accountId!: ObjectId
  public customerId!: ObjectId
  public meterId!: ObjectId
  public ref!: string

  constructor(obj: Partial<Event>) {
    super(obj)
    Object.assign(this, obj)

    this.accountId = new ObjectId(obj.accountId)
    this.customerId = new ObjectId(obj.customerId)
    this.meterId = new ObjectId(obj.meterId)
  }
}

export interface CreateEventPayload {
  accountId: ObjectId
  customerId: ObjectId
  meterId: ObjectId
  ref: string
  timestamp: number
  metadata: Record<string, any>
  name: string
}
