import { ObjectId } from 'mongodb'
import { MongoEntity } from './mongoEntity.model'

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
    this.assign(obj)

    this.accountId = new ObjectId(obj.accountId)
    this.customerId = new ObjectId(obj.customerId)
    this.productId = new ObjectId(obj.productId)
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
