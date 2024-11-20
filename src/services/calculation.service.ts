import { ObjectId } from 'mongodb'
import { Invoice, Event, Product } from '../models'
import { Mongo, Redis } from '../shared'
import { ProductsService } from './products.service'
import { sumBy, update } from 'lodash'
import { InvoicesService } from './invoices.service'
import { EventsService } from './events.service'

type InvoiceProduct = Invoice['products'][number]
export class CalculationService {
  private productsService: ProductsService
  private invoicesService: InvoicesService
  private eventsService: EventsService

  public constructor() {
    this.productsService = new ProductsService()
    this.invoicesService = new InvoicesService()
    this.eventsService = new EventsService()
  }

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

    const productsIds = invoice.products.map((product) => product.id)
    const calculationPeriod = invoice.billingPeriod

    const products = await this.productsService.getManyByIds(
      invoice.accountId,
      productsIds
    )
    const eventsTotalsById = await this.eventsService.readEventsTotals(
      calculationPeriod,
      productsIds,
      invoice.customerId
    )

    const calculatedProductMap = new Map<ObjectId, InvoiceProduct>()

    for (const product of products) {
      const eventsTotal = eventsTotalsById[product._id.toHexString()]
      const calculatedProduct = this.calculateProduct(eventsTotal, product)

      calculatedProductMap.set(product._id, calculatedProduct)
    }

    const invoiceProducts = [...calculatedProductMap.values()]
    const invoiceTotal = sumBy(invoiceProducts, (product) => product.price)

    const updatedInvoice = await this.invoicesService.update(invoiceId, {
      products: invoiceProducts,
      priceBreakdown: invoiceTotal
    })

    return updatedInvoice
  }

  private calculateProduct(
    eventsTotal: number,
    product: Product
  ): InvoiceProduct {
    const pricing = product.pricing

    let remainingValue = eventsTotal
    let totalAmount = 0

    for (const { from, to, price, chunkSize } of pricing.tiers) {
      if (remainingValue <= 0) break

      const applicableValue = Math.min(remainingValue, to - from + 1)
      const fullChunks = Math.ceil(applicableValue / chunkSize)

      totalAmount += fullChunks * price
      remainingValue -= applicableValue
    }

    return {
      id: product._id,
      price: totalAmount,
      units: eventsTotal
    }
  }
}
