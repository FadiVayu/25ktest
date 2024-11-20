import { ObjectId } from 'mongodb'
import { MongoEntity } from './mongoEntity.model'

type Pricing = {
  tiers: {
    from: number
    to: number
    price: number
    chunkSize: number
  }[]
}

export interface Aggregation {
  operation: 'sum' | 'average' | 'count' | 'min' | 'max'
  field?: string
}

export class Product extends MongoEntity {
  public name!: string
  public accountId!: ObjectId
  public aggregation!: Aggregation
  public pricing!: Pricing

  constructor(obj: Partial<Product>) {
    super(obj)
    Object.assign(this, obj)

    this.accountId = new ObjectId(this.accountId)
  }
}
