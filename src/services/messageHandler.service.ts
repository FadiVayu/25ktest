import { IngestedEvent, Event, CreateEventPayload } from '../models'
import { Redis } from '../shared'
import { CustomersService } from './customers.service'
import { EventsService } from './events.service'
import { ProductsService } from './products.service'

export class MessageHandlerService {
  private customersService: CustomersService
  private productsService: ProductsService
  private eventsService: EventsService

  public constructor() {
    this.customersService = new CustomersService()
    this.productsService = new ProductsService()
    this.eventsService = new EventsService()
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
      meterId: product!._id,
      ref: message.ref,
      timestamp: message.timestamp,
      metadata: message.data,
      name: product!.name
    }

    return this.eventsService.create(event)
  }
}
