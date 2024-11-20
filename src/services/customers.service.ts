import { ObjectId } from 'mongodb'
import { Customer } from '../models'
import { Mongo, Redis } from '../shared'

export class CustomersService {
  public get collection() {
    return Mongo.db.collection<Customer>('customers')
  }

  public async getByAlias(
    accountId: ObjectId | string,
    customerAlias: string
  ): Promise<Customer | null> {
    const key = `customers.accountId.${accountId}.alias.${customerAlias}`
    const cached = await Redis.get(key)
    if (cached) {
      return new Customer(JSON.parse(cached))
    }

    const result = await this.collection.findOne({
      accountId: new ObjectId(accountId),
      aliases: { $in: [customerAlias] }
    })

    if (result) {
      await Redis.set(key, JSON.stringify(result))
    }

    return result ? new Customer(result) : null
  }
}
