import { ObjectId } from 'mongodb'
import { MongoEntity } from '../../mongo'
import { uniq } from 'lodash'
import { APIError } from '../../api'

export class Customer extends MongoEntity {
  public name!: string
  public accountId!: ObjectId
  public aliases: string[] = []
  public externalId!: string
  public metadata!: Record<string, any>

  constructor(obj: Partial<Customer>) {
    super()
    Object.assign(this, Customer.validate(obj))
  }

  public static validate(obj: Partial<Customer>) {
    obj = super.validate(obj)

    if (!obj.name) {
      throw new APIError('Name is required', 400)
    }
    if (!obj.accountId) {
      throw new APIError('Account ID is required', 400)
    }
    if (!obj.externalId) {
      throw new APIError('Customer ID is required', 400)
    }

    obj.accountId = new ObjectId(obj.accountId)
    obj.aliases = obj.aliases ? uniq([...obj.aliases, obj.externalId]) : [obj.externalId]
    obj.metadata = obj.metadata ?? {}

    return obj;
  }

  public static validateCreate(obj: CreateCustomerPayload) {
    const validated: Partial<Customer> = {}

    if (!obj.name) {
      throw new APIError('Name is required', 400)
    }
    if (!obj.accountId) {
      throw new APIError('Account ID is required', 400)
    }
    if (!obj.externalId) {
      throw new APIError('Customer ID is required', 400)
    }

    Object.assign(validated, obj)

    validated.accountId = new ObjectId(obj.accountId)
    validated.aliases = validated.aliases ? uniq([...validated.aliases, obj.externalId]) : [obj.externalId]
    validated.metadata = obj.metadata ?? {}

    return validated
  }

  public static validateUpdate(obj: UpdateCustomerPayload) {
    const validated: Partial<Customer> = {}

    Object.assign(validated, obj)

    if (validated.externalId) {
      validated.aliases = validated.aliases ? uniq([...validated.aliases, validated.externalId]) : [validated.externalId]
    }

    return validated
  }
}

export interface CreateCustomerPayload {
  name: string
  accountId: string
  externalId: string
  metadata?: Record<string, any>
  aliases?: string[]
}

export interface UpdateCustomerPayload {
  name?: string
  externalId?: string
  metadata?: Record<string, any>
  aliases?: string[]
}