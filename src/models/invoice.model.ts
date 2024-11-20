import { MongoEntity } from './mongoEntity.model'
import { ObjectId } from 'mongodb'

export class Invoice extends MongoEntity {
  public name!: string
  public accountId!: ObjectId
  public customerId!: ObjectId
  public priceBreakdown!: {
    units: number
    total: number
    tax: number
    subtotal: number
    commitment: number
  }
  public productsIds!: ObjectId[]
  public billingPeriod!: {
    startTime: Date
    endTime: Date
  }

  constructor(obj: Partial<Invoice>) {
    super(obj)
    Object.assign(this, obj)
  }
}
