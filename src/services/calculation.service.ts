import { ObjectId } from 'mongodb'
import { Invoice, Event } from '../models'
import { Mongo, Redis } from '../shared'

export class CalculationService {
  public get invoicesCollection() {
    return Mongo.db.collection<Invoice>('invoices')
  }

  public get eventsCollection() {
    return Mongo.db.collection<Event>('event')
  }

  public async calculateInvoiceTotal(invoiceId: ObjectId) {
    const invoice = await this.invoicesCollection.findOne({ _id: invoiceId })
    if (!invoice) {
      throw new Error('Invoice not found')
    }

    const calculationPeriod = invoice.billingPeriod


    const eventsTotalsById = readEventsTotal(calculationPeriod, invoice.productsIds, invoice.customerId)
  }

  private async calculateProduct(eventsTotal: number, )
}

function readEventsTotal(period: { startTime: Date, endTime: Date }, productsIds: ObjectId[], customerId: ObjectId): Record<string, number> {
  return 0;
}