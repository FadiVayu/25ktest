import { ObjectId } from 'mongodb'
import { Invoice } from '../models'
import { Mongo } from '../shared'

export class InvoicesService {
  public get collection() {
    return Mongo.db.collection<Invoice>('invoices')
  }

  public async get(id: string): Promise<Invoice | null> {
    const result = await this.collection.findOne({
      _id: new ObjectId(id)
    })

    return result ? new Invoice(result) : null
  }

  public async update(
    id: string | ObjectId,
    invoice: Partial<Invoice>
  ): Promise<Invoice | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: invoice },
      { returnDocument: 'after' }
    )

    return result ? new Invoice(result) : null
  }
}
