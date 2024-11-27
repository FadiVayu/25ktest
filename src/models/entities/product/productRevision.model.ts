import { ObjectId } from "mongodb"
import { Aggregation } from "./aggregation.model"
import { Pricing } from "./pricing.model"

export class ProductRevision {
  public revisionId!: ObjectId
  public reason!: string
  public asOf!: Date
  public aggregation!: Aggregation
  public pricing!: Pricing

  constructor(obj: Partial<ProductRevision>) {
    Object.assign(this, obj)
    this.revisionId = this.revisionId ? new ObjectId(this.revisionId) : new ObjectId()
  }
}

export interface ReviseProductPayload {
  /** 
   * The reason the product was revised
   * @isString
   */
  reason: string
  /** Aggregation method */
  aggregation: Aggregation
  /** Pricing */
  pricing: Pricing
  /**
   * The date the revision is effective as of
   * 
   * @isDate
   */
  asOf: Date
}