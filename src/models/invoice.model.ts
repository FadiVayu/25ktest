import { MongoEntity } from './mongoEntity.model'
import { ObjectId } from 'mongodb'

export class Invoice extends MongoEntity {
  /* Invoice Name */
  public name!: string
  /* Invoice Account ID */
  public accountId!: ObjectId
  /* Invoice Customer ID */
  public customerId!: ObjectId
  /* Invoice Price Breakdown */
  public priceBreakdown!: number
  /* Invoice Products */
  public products!: {
    id: ObjectId
    price: number
    units: number
  }[]
  /* Invoice Billing Period */
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

export interface CreateInvoicePayload {
  name: string
  accountId: ObjectId
  customerId: ObjectId
  priceBreakdown: number
  products: {
    id: ObjectId
    price: number
    units: number
  }[]
  billingPeriod: {
    startTime: Date
    endTime: Date
  }
}
