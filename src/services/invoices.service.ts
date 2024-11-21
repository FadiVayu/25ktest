import { ObjectId } from 'mongodb'
import { Invoice } from '../models'
import { Mongo, Redis } from '../shared'

export class InvoicesService {
  public async get(id: ObjectId | string): Promise<Invoice | null> {
    const key = `invoices.id.${id}`
    const cached = await Redis.get(key, (data) => new Invoice(data))

    if (cached) {
      return cached
    }

    const result = await Mongo.invoices.findOne({
      _id: new ObjectId(id)
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
    const key = `invoices.id.${id}`
    const result = await Mongo.invoices.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: invoice },
      { returnDocument: 'after' }
    )

    await Redis.invalidate(key)
    return result ? new Invoice(result) : null
  }
}
