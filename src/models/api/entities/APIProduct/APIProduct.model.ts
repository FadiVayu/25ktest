import { Aggregation, Pricing, Product, ProductRevision } from "../../../entities"

export class APIProduct {
  /** 
   * ID 
   * @isString
   */
  public id!: string
  /** 
   * Name
   * @isString 
   */
  public name!: string
  /** 
   * Description 
   * @isString
   * @optional
   */
  public description?: string
  /** 
   * Account ID 
   * @isString
   */
  public accountId!: string
  /** Aggregation */
  public aggregation!: Aggregation
  /** Pricing */
  public pricing!: Pricing
  /** Revisions */
  public revisions?: ProductRevision[]
  /** 
   * Created At 
   * @isDate
   */
  public createdAt!: Date
  /** 
   * Updated At 
   * @isDate
   */
  public updatedAt!: Date

  public static fromEntity(entity: Product): APIProduct {
    return new APIProduct({
      id: entity._id.toHexString(),
      name: entity.name,
      description: entity.description,
      accountId: entity.accountId.toHexString(),
      aggregation: entity.aggregation,
      pricing: entity.pricing,
      revisions: entity.revisions,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    })
  }

  constructor(obj: Partial<Product> | Partial<APIProduct>) {
    Object.assign(this, obj)
  }
}