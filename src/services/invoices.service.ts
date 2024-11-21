import { ObjectId } from 'mongodb'
import { Invoice } from '../models'
import { Mongo, Redis } from '../shared'

export class InvoicesService {
  public async get(id: ObjectId | string): Promise<Invoice | null> {
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
      return null
    }

    const invoice = new Invoice(result)
    await Redis.set(key, invoice)

    return invoice
  }

  public async update(
    id: string | ObjectId,
    invoice: Partial<Invoice>
  ): Promise<Invoice | null> {
    const parsedId = new ObjectId(id)

    const key = `invoices:${parsedId.toHexString()}`
    const result = await Mongo.invoices.findOneAndUpdate(
      { _id: parsedId },
      { $set: invoice },
      { returnDocument: 'after' }
    )

    await Redis.invalidate(key)
    return result ? new Invoice(result) : null
  }

  public async getAffectedInvoices(productId: ObjectId | string, timestamp: Date | number): Promise<ObjectId[]> {
    const result = await Mongo.invoices.find<{ _id: ObjectId }>({
      'products.id': new ObjectId(productId),
      'billingPeriod.startTime': { $lte: new Date(timestamp) },
      'billingPeriod.endTime': { $gte: new Date(timestamp) }
    }, { projection: { _id: 1 } }).toArray()

    return result.map(({ _id }) => _id)
  }
}
