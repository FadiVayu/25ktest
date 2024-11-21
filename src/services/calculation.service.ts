import { ObjectId } from 'mongodb'
import { Invoice, Event, Product } from '../models'
import { Mongo, Redis } from '../shared'
import { ProductsService } from './products.service'
import { sumBy, update } from 'lodash'
import { InvoicesService } from './invoices.service'
import { EventsService } from './events.service'
import { CalculationUtils, InvoiceProduct } from '../utils'

export class CalculationService {
  private static _intervalId: NodeJS.Timeout | null = null
  private static _instance: CalculationService | null = null
  public static get instance() {
    if (!CalculationService._instance) {
      CalculationService._instance = new CalculationService()
    }

    return CalculationService._instance
  }

  public static startCron() {
    if (this._intervalId) {
      clearInterval(this._intervalId)
    }

    this._intervalId = setInterval(async () => {
      try {
        // const cachedInvoiceIdsToCalc = await Redis.get('invoices:to-calculate')
        const cachedInvoiceIdsToCalc = JSON.stringify(['673e04c93238bdbca1662453'])
        if (!cachedInvoiceIdsToCalc) return

        const invoiceIdsToCalc = JSON.parse(cachedInvoiceIdsToCalc) as string[]

        console.log('Calculating invoice totals:', invoiceIdsToCalc)
        for (const invoice of invoiceIdsToCalc) {
          await this.instance.calculateInvoiceTotal(invoice)
        }
      } catch (error) {
        console.error('Error calculating invoice totals:', error)
      }
    }, 100)
  }

  private productsService: ProductsService
  private invoicesService: InvoicesService

  public constructor() {
    this.productsService = new ProductsService()
    this.invoicesService = new InvoicesService()
  }

  public async calculateInvoiceTotal(invoiceId: ObjectId | string) {
    const invoice = await this.invoicesService.get(invoiceId)
    if (!invoice) {
      throw new Error('Invoice not found')
    }

    const productsIds = invoice.products.map((product) => product.id)
    const calculationPeriod = invoice.billingPeriod

    const products = await this.productsService.getManyByIds(
      invoice.accountId,
      productsIds
    )

    if (!products) {
      throw new Error('Products not found')
    }

    const eventsTotalsById = await this.readEventsTotals(
      calculationPeriod,
      productsIds,
      invoice.customerId
    )

    const calculatedProductMap = new Map<ObjectId, InvoiceProduct>()

    for (const product of products) {
      const eventsTotal = eventsTotalsById[product._id.toHexString()]
      const calculatedProduct = CalculationUtils.calculateProduct(eventsTotal, product)

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

  
  private async readEventsTotals(
    period: { startTime: Date; endTime: Date },
    productsIds: ObjectId[],
    customerId: ObjectId
  ): Promise<Record<string, number>> {
    const eventTotals = await Mongo.events.find({
      customerId,
      productId: { $in: productsIds },
      timestamp: { $gte: period.startTime.getTime(), $lte: period.endTime.getTime() }
    }, { batchSize: 1000 })


    const results: Record<string, number> = {}
    for (const productId of productsIds) {
      results[productId.toHexString()] = 0
    }

    const MAX_BATCH_SIZE = 1000
    let batch = []

    const findEventValue = async (event: Event) => {
      const product = await this.productsService.getById(event.accountId, event.productId)
      if (!product) {
        return 0
      }

      results[event.productId.toHexString()] = CalculationUtils.calculateEventValue(event, product.aggregation.type, product.aggregation.field)
    }

    while (await eventTotals.hasNext()) {
      const event = await eventTotals.next()

      if (!event) { continue; }

      batch.push(findEventValue(event))

      if (batch.length === MAX_BATCH_SIZE) {
        await Promise.all(batch)
        batch = []
      }
    }

    if (batch.length) {
      await Promise.all(batch)
    }

    return results
  }

}
