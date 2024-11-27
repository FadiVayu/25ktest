import { ObjectId } from 'mongodb'
import { APIError, CreateInvoicePayload, Cursor, Invoice, QueryPayload, UpdateInvoicePayload } from '../models'
import { Mongo, Redis } from '../shared'

export class InvoicesService {
  public async get(id: ObjectId | string): Promise<Invoice> {
    const parsedId = new ObjectId(id)

    const key = `invoices:${parsedId.toHexString()}`
    const cached = await Redis.get<Invoice>(key, (data) => new Invoice(data))

    if (cached) {
      return cached
    }

    const result = await Mongo.invoices.findOne({
      _id: parsedId
    })

    if (!result) {
      throw new APIError('Invoice not found', 404)
    }

    const invoice = new Invoice(result)
    await Redis.set(key, invoice)

    return invoice
  }

  public async create(invoice: CreateInvoicePayload): Promise<Invoice> {
    const validatedPayload = Invoice.validateCreate(invoice)
    const newInvoice = new Invoice(validatedPayload)

    const createdResult = await Mongo.invoices.insertOne(newInvoice)

    return this.get(createdResult.insertedId)
  }

  public async update(
    id: string | ObjectId,
    payload: UpdateInvoicePayload
  ): Promise<Invoice> {
    const parsedId = new ObjectId(id)
    const validatedPayload = Invoice.validateUpdate(payload)

    const key = `invoices:${parsedId.toHexString()}`
    const result = await Mongo.invoices.findOneAndUpdate(
      { _id: parsedId },
      { $set: validatedPayload },
      { returnDocument: 'after' }
    )

    if (!result) {
      throw new APIError('Invoice not found', 404)
    }

    await Redis.invalidate(key)

    return new Invoice(result)
  }

  public async delete(id: string | ObjectId): Promise<void> {
    const parsedId = new ObjectId(id)

    const key = `invoices:${parsedId.toHexString()}`
    const result = await Mongo.invoices.deleteOne({
      _id: parsedId
    })

    if (result.deletedCount === 0) {
      return // do not indicate errors to not expose internal state
    }

    await Redis.invalidate(key)
  }

  public async query({
    filter,
    page,
    pageSize,
    sort
  }: QueryPayload<Invoice>): Promise<Cursor<Invoice>> {
    const query = Mongo.invoices.find(filter ?? {}, { skip: page, limit: pageSize })

    if (sort) {
      query.sort(sort)
    }
    
    return new Cursor<Invoice>(query, (data) => new Invoice(data))
  }
}
