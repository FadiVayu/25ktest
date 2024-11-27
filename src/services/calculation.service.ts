import { ObjectId } from 'mongodb'
import { sumBy } from 'lodash'
import { InvoicesService, ProductsService } from './entities'
import { CalculationUtils } from '../utils'
import { APIError, Invoice } from '../models'

export class CalculationService {
  private productsService: ProductsService
  private invoicesService: InvoicesService

  public constructor() {
    this.productsService = new ProductsService()
    this.invoicesService = new InvoicesService()
  }

  public async calculateInvoiceTotal(invoiceId: ObjectId | string): Promise<Invoice> {
    const invoice = await this.invoicesService.get(invoiceId)
    if (!invoice) {
      throw new APIError('Products not found', 404)
    }

    const productsIds = invoice.products.map((product) => product.id)
    const calculationPeriod = invoice.billingPeriod

    const productsCusror = await this.productsService.query({
      filter: {
        accountId: invoice.accountId,
        _id: { $in: productsIds }
      }
    })

    const products = await productsCusror.items()


    if (!products || products.length !== productsIds.length) {
      throw new APIError('Invoice Products not found', 404)
    }

    const calculatingProducts = products.map((product) => CalculationUtils.calculateProduct(invoice.customerId, product, calculationPeriod))
    const dbInvoiceProducts = await Promise.all(calculatingProducts)
    const invoiceProducts = dbInvoiceProducts.map((product) => {
      return {
        id: product.id.toHexString(),
        price: product.price,
        units: product.units
      }
    })
    const invoiceTotal = sumBy(invoiceProducts, (product) => product.price)

    const updatedInvoice = await this.invoicesService.update(invoiceId, {
      products: invoiceProducts,
      priceBreakdown: invoiceTotal
    })

    return updatedInvoice
  }
}
