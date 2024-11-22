import { MongoEntity } from './mongoEntity.model'
import { ObjectId } from 'mongodb'

export class Invoice extends MongoEntity {
  public name!: string
  public accountId!: ObjectId
  public customerId!: ObjectId
  public priceBreakdown!: number
  public products!: {
    id: ObjectId
    price: number
    units: number
  }[]
  public billingPeriod!: {
    startTime: Date
    endTime: Date
  }

  constructor(obj: Partial<Invoice>) {
    super()
    this.assign(obj)
    this._id = new ObjectId(this._id)
    this.billingPeriod = {
      startTime: new Date(this.billingPeriod.startTime),
      endTime: new Date(this.billingPeriod.endTime)
    }
  }
}
