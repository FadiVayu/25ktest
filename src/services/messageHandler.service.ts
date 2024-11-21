import { IngestedEvent, Event, CreateEventPayload } from '../models'
import { Redis } from '../shared'
import { CustomersService } from './customers.service'
import { EventsService } from './events.service'
import { InvoicesService } from './invoices.service'
import { ProductsService } from './products.service'

export class MessageHandlerService {
  private customersService: CustomersService
  private productsService: ProductsService
  private eventsService: EventsService
  private invoicesService: InvoicesService

  public constructor() {
    this.customersService = new CustomersService()
    this.productsService = new ProductsService()
    this.eventsService = new EventsService()
    this.invoicesService = new InvoicesService()
  }

  public async handle(message: IngestedEvent): Promise<string> {
    const customer = await this.customersService.getByAlias(
      message.accountId,
      message.customerAlias
    )
    const product = await this.productsService.getByName(
      message.accountId,
      message.eventName
    )

    const event: CreateEventPayload = {
      accountId: customer!.accountId,
      customerId: customer!._id,
      productId: product!._id,
      ref: message.ref,
      timestamp: message.timestamp,
      metadata: message.data,
      name: product!.name
    }

    const affectedInvoices = await this.invoicesService.getAffectedInvoices(
      product!._id,
      message.timestamp
    )

    const lock = await Redis.lock('invoices:to-calculate')
    const currValue = await Redis.get<string>('invoices:to-calculate')
    const parsedCurrent = [...(currValue ? JSON.parse(currValue) : [])]
    const parsedAffectedIds = affectedInvoices.map((invoiceId) => invoiceId.toHexString())
    const newValue = [...new Set([...parsedCurrent, ...parsedAffectedIds])]
    await Redis.set('invoices:to-calculate', Array.isArray(newValue) ? newValue : [newValue])
    await lock.release()

    return this.eventsService.create(event)
  }
}
