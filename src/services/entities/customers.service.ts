import { ObjectId } from 'mongodb'
import { APIError, CreateCustomerPayload, Cursor, Customer, QueryPayload, UpdateCustomerPayload } from '../../models'
import { Mongo, Redis } from '../../shared'

export class CustomersService {

  public async get(id: ObjectId | string): Promise<Customer> {
    const parsedId = new ObjectId(id)

    const key = `customers:${parsedId.toHexString()}`
    const cached = await Redis.get<Customer>(key, (data) => new Customer(data))

    if (cached) {
      return cached
    }

    const result = await Mongo.customers.findOne({
      _id: parsedId
    })

    if (!result) {
      throw new APIError('Customer not found', 404)
    }

    const customer = new Customer(result)
    await Redis.set(key, customer)

    return customer
  }

  public async create(customer: CreateCustomerPayload): Promise<Customer> {
    const validatedPayload = Customer.validateCreate(customer)
    const newCustomer = new Customer(validatedPayload)

    const createdResult = await Mongo.customers.insertOne(newCustomer)

    return this.get(createdResult.insertedId)
  }

  public async update(id: string | ObjectId, payload: UpdateCustomerPayload): Promise<Customer> {
    const parsedId = new ObjectId(id)
    const validatedPayload = Customer.validateUpdate(payload)

    const key = `customers:${parsedId.toHexString()}`
    const result = await Mongo.customers.findOneAndUpdate(
      { _id: parsedId },
      { $set: validatedPayload },
      { returnDocument: 'after' }
    )

    if (!result) {
      throw new APIError('Customer not found', 404)
    }

    await Redis.invalidate(key)

    return new Customer(result)
  }

  public async delete(id: string | ObjectId): Promise<void> {
    const parsedId = new ObjectId(id)

    const key = `customers:${parsedId.toHexString()}`
    const result = await Mongo.customers.deleteOne({
      _id: parsedId
    })

    if (!result) {
      return
    }

    await Redis.invalidate(key)
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
