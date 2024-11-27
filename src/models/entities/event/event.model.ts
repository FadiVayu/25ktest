import { ObjectId } from 'mongodb'
import { MongoEntity } from '../../mongo'

export class Event extends MongoEntity {
  public name!: string
  public timestamp!: number
  public metadata!: Record<string, any>
  public accountId!: ObjectId
  public customerId!: ObjectId
  public productId!: ObjectId
  public ref!: string

  constructor(obj: Partial<Event>) {
    super()
    Object.assign(this, Event.validate(obj))
  }
}

export interface CreateEventPayload {
  accountId: ObjectId
  customerId: ObjectId
  productId: ObjectId
  ref: string
  timestamp: number
  metadata: Record<string, any>
  name: string
}
