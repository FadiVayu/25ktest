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

export enum AggregationMethods {
  SUM = 'sum',
  AVERAGE = 'avg',
  MAX = 'max',
  MIN = 'min',
  COUNT = 'count'
}

export interface Aggregation {
  type: AggregationMethods
  field?: string
}

export class Product extends MongoEntity {
  public name!: string
  public accountId!: ObjectId
  public aggregation!: Aggregation
  public pricing!: Pricing

  constructor(obj: Partial<Product>) {
    super()
    this.assign(obj)
    this.accountId = new ObjectId(this.accountId)
  }
}

export interface CreateProductPayload {
  name: string
  accountId: ObjectId
  aggregation: Aggregation
  pricing: Pricing
}
