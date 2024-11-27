import { ObjectId } from 'mongodb'
import { MongoEntity } from '../../mongo'
import { Aggregation } from './aggregation.model'
import { Pricing } from './pricing.model'
import { ProductRevision } from './productRevision.model'
import { APIError } from '../../api'

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
  
  public static validateCreate(obj: CreateProductPayload) {
    const validated: Partial<Product> = {}

    if (!obj.name) {
      throw new APIError('Name is required', 400)
    }
    if (!obj.accountId) {
      throw new APIError('Account ID is required', 400)
    }
    if (!obj.aggregation) {
      throw new APIError('Price Breakdown is required', 400)
    }
    if (!obj.pricing) {
      throw new APIError('Products are required', 400)
    }

    Object.assign(validated, obj)

    validated.accountId = new ObjectId(obj.accountId)
    validated.revisions = []

    return validated
  }

  public static validateUpdate(obj: UpdateProductPayload) {
    const validated: Partial<Product> = {}

    Object.assign(validated, obj)

    return validated
  }
}

export interface CreateProductPayload {
  name: string
  description?: string
  accountId: string
  aggregation: Aggregation
  pricing: Pricing
}

export interface UpdateProductPayload {
  name?: string
  description?: string
}
