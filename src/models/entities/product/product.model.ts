import { ObjectId } from 'mongodb'
import { MongoEntity } from '../../mongo'
import { Aggregation } from './aggregation.model'
import { Pricing } from './pricing.model'
import { ProductRevision } from './productRevision.model'

export class Product extends MongoEntity {
  public name!: string
  public description?: string
  public accountId!: ObjectId
  public aggregation!: Aggregation
  public pricing!: Pricing
  public revisions?: ProductRevision[]

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

export interface UpdateProductPayload {
  name?: string
  description?: string
}
