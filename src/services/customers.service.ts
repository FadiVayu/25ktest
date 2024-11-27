import { ObjectId } from 'mongodb'
import { CreateCustomerPayload, Cursor, Customer, QueryPayload } from '../models'
import { Mongo, Redis } from '../shared'

export class CustomersService {

  public async create(customer: CreateCustomerPayload): Promise<string> {
    const createdResult = await Mongo.customers.insertOne(new Customer(customer as any))

    return createdResult.insertedId.toHexString()
  }


  public async query({
    filter,
    page,
    pageSize,
    sort
  }: QueryPayload<Customer>): Promise<Cursor<Customer>> {
    const query = Mongo.customers.find(filter ?? {}, { skip: page, limit: pageSize })

    if (sort) {
      query.sort(sort)
    }
    
    return new Cursor<Customer>(query, (data) => new Customer(data))
  }
}
