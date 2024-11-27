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
  }
}