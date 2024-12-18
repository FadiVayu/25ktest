import { Invoice } from "../../entities"


export class APIInvoice {
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
   * Account ID 
   * 
   * @isString
   */
  public accountId!: string
  /** 
   * Customer ID 
   * 
   * @isString
   */
  public customerId!: string
  /** 
   * Price Breakdown 
   * @isDouble
   */
  public priceBreakdown!: number
  /** Products */
  public products!: {
    /** Product ID */
    id: string
    /** 
     * Product calculated price 
     * @isDouble
     */
    price: number
    /** 
     * Product accumulated unit 
     * @isDouble
     */
    units: number
  }[]
  /** Billing Period */
  public billingPeriod!: {
    /** 
     * Period Start Date
     * @isDate
     */
    startTime: Date
    /** 
     * Period End Date
     * @isDate
     */
    endTime: Date
  }
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

  public static fromEntity(entity: Invoice): APIInvoice {
    return new APIInvoice({
      id: entity._id.toHexString(),
      name: entity.name,
      accountId: entity.accountId.toHexString(),
      customerId: entity.customerId.toHexString(),
      priceBreakdown: entity.priceBreakdown,
      products: entity.products.map(p => ({
        id: p.id.toHexString(),
        price: p.price,
        units: p.units
      })),
      billingPeriod: {
        startTime: entity.billingPeriod.startTime,
        endTime: entity.billingPeriod.endTime
      },
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    })
  }

  constructor(obj: Partial<Invoice> | Partial<APIInvoice>) {
    Object.assign(this, obj)
  }
}