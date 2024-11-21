import { ObjectId } from 'mongodb'
import { Redis } from '../shared'
import { ProductsService } from './products.service'
import { sumBy } from 'lodash'
import { InvoicesService } from './invoices.service'
import { CalculationUtils } from '../utils'

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
        const lock = await Redis.lock('invoices:to-calculate')
        const invoiceIdsToCalc = await Redis.get<ObjectId[]>('invoices:to-calculate', (data) => data.map((id) => new ObjectId(id)))
        await Redis.invalidate('invoices:to-calculate')
        await lock.release()
  
        console.log('Calculating invoice totals:', invoiceIdsToCalc)
        if (!invoiceIdsToCalc || !invoiceIdsToCalc.length) {
          return
        }

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

    const calculatingProducts = products.map((product) => CalculationUtils.calculateProduct(invoice.customerId, product, calculationPeriod))
    const invoiceProducts = await Promise.all(calculatingProducts)
    const invoiceTotal = sumBy(invoiceProducts, (product) => product.price)

    const updatedInvoice = await this.invoicesService.update(invoiceId, {
      products: invoiceProducts,
      priceBreakdown: invoiceTotal
    })

    return updatedInvoice
  }
}
