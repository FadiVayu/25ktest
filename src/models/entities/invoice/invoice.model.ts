import { APIError } from '../../api'
import { MongoEntity } from '../../mongo'
import { ObjectId } from 'mongodb'

export class Invoice extends MongoEntity {
  public name!: string
  public accountId!: ObjectId
  public customerId!: ObjectId
  public priceBreakdown!: number
  public products!: {
    id: ObjectId
    price: number
    units: number
  }[]
  public billingPeriod!: {
    startTime: Date
    endTime: Date
  }

  constructor(obj: Partial<Invoice>) {
    super()
    Object.assign(this, Invoice.validate(obj))
  }

  public static validate(obj: Partial<Invoice>) {
    obj = super.validate(obj)

    if (!obj.name) {
      throw new APIError('Name is required', 400)
    }
    if (!obj.accountId) {
      throw new APIError('Account ID is required', 400)
    }
    if (!obj.customerId) {
      throw new APIError('Customer ID is required', 400)
    }
    if (!obj.products) {
      throw new APIError('Products are required', 400)
    }
    if (!obj.billingPeriod) {
      throw new APIError('Billing Period is required', 400)
    }

    obj.priceBreakdown = obj.priceBreakdown ?? 0

    obj.accountId = new ObjectId(obj.accountId)
    obj.customerId = new ObjectId(obj.customerId)

    obj.billingPeriod = {
      startTime: new Date(obj.billingPeriod.startTime),
      endTime: new Date(obj.billingPeriod.endTime)
    }

    obj.products = obj.products.map(product => ({
      id: new ObjectId(product.id),
      price: product.price,
      units: product.units
    }))

    return obj;
  }

  public static validateCreate(obj: CreateInvoicePayload) {
    const validated: Partial<Invoice> = {}

    if (!obj.name) {
      throw new APIError('Name is required', 400)
    }
    if (!obj.accountId) {
      throw new APIError('Account ID is required', 400)
    }
    if (!obj.customerId) {
      throw new APIError('Customer ID is required', 400)
    }
    if (!obj.products) {
      throw new APIError('Products are required', 400)
    }
    if (!obj.billingPeriod) {
      throw new APIError('Billing Period is required', 400)
    }

    Object.assign(validated, obj)

    validated.accountId = new ObjectId(obj.accountId)
    validated.customerId = new ObjectId(obj.customerId)

    validated.billingPeriod = {
      startTime: new Date(validated.billingPeriod!.startTime),
      endTime: new Date(validated.billingPeriod!.endTime)
    }

    if (validated.products!.length === 0) {
      throw new APIError('At least one Product is required', 400)
    }

    return validated
  }

  public static validateUpdate(obj: UpdateInvoicePayload) {
    const validated: Partial<Invoice> = {}

    Object.assign(validated, obj)

    if (validated.customerId) {
      validated.customerId = new ObjectId(obj.customerId)
    }

    if (validated.billingPeriod) {
      validated.billingPeriod = {
        startTime: new Date(validated.billingPeriod.startTime),
        endTime: new Date(validated.billingPeriod.endTime)
      }
    }

    return validated
  }
}

export interface CreateInvoicePayload {
  /** Name */
  name: string
  /** Account ID */
  accountId: string
  /** Customer ID */
  customerId: string
  /** Products */
  products: {
    /** Product ID */
    id: string
    /** Product calculated price */
    price: number
    /** Product accumulated unit */
    units: number
  }[]
  /** Billing Period */
  billingPeriod: {
    /** Period Start Date*/
    startTime: Date
    /** Period End Date*/
    endTime: Date
  }
}

export interface UpdateInvoicePayload {
  /** Name */
  name?: string
  /** Account ID */
  customerId?: string
  /** Price Breakdown */
  products?: {
    /** Product ID */
    id: string
    /** Product calculated price */
    price: number
    /** Product accumulated unit */
    units: number
  }[]
  /** Billing Period */
  billingPeriod?: {
    /** Period Start Date*/
    startTime: Date
    /** Period End Date*/
    endTime: Date
  },
  /** Price Breakdown */
  priceBreakdown?: number
}
