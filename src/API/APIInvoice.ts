import { Invoice } from "../models"


export class APIInvoice {
  /** ID */
  public id!: string
  /** Name */
  public name!: string
  /** Account ID */
  public accountId!: string
  /** Customer ID */
  public customerId!: string
  /** Price Breakdown */
  public priceBreakdown!: number
  /** Products */
  public products!: {
    /** Product ID */
    id: string
    /** Product calculated price */
    price: number
    /** Product accumulated unit */
    units: number
  }[]
  /** Billing Period */
  public billingPeriod!: {
    /** Period Start Date*/
    startTime: Date
    /** Period End Date*/
    endTime: Date
  }

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
      }
    })
  }

  constructor(obj: Partial<Invoice> | Partial<APIInvoice>) {
    Object.assign(this, obj)
  }
}