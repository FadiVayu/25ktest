import { ObjectId } from 'mongodb'
import { Customer } from '../models'
import { Mongo, Redis } from '../shared'

export class CustomersService {

  public async getByAlias(
    accountId: ObjectId | string,
    customerAlias: string
  ): Promise<Customer | null> {
    const parsedAccountId = new ObjectId(accountId)
    
    const key = `customers:${parsedAccountId.toHexString()}.${customerAlias}`
    const cached = await Redis.get<Customer>(key, (data) => new Customer(data))
    if (cached) {
      return cached
    }

    const result = await Mongo.customers.findOne({
      accountId: parsedAccountId,
      aliases: { $in: [customerAlias] }
    })

    if (!result) {
      return null
    }

    await Redis.set(key, result)
    return new Customer(result)
  }
}
