import { ObjectId, UnorderedBulkOperation } from 'mongodb'
import { IngestedEvent, Event, CreateEventPayload, Customer, Product } from '../models'
import { Mongo, Redis } from '../shared'
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

  public async handle(events: IngestedEvent[]){
    const unorderBulkOp = Mongo.events.initializeUnorderedBulkOp()

    const parsedAccountId = new ObjectId(events[0].accountId);
    const customerAliases = [
      ...new Set(events.map((event) => event.customerAlias)),
    ];
    const productNames = [...new Set(events.map((event) => event.eventName))];
  
    const [customers, products] = await Promise.all([
      Mongo.customers
        .find({ accountId: parsedAccountId, aliases: { $in: customerAliases } })
        .toArray(),
      Mongo.products
        .find({ accountId: parsedAccountId, name: { $in: productNames } })
        .toArray(),
    ]);

    const customerMap = new Map(
      customers.flatMap((c) => c.aliases.map((alias) => [alias, c]))
    );
    const productMap = new Map(products.map((p) => [p.name, p]));
  
    await Promise.all(events.map((event) => this.handleSingleEvent(unorderBulkOp, event, customerMap, productMap)))

    await unorderBulkOp.execute()
  }

  private async handleSingleEvent(op: UnorderedBulkOperation, event: IngestedEvent, customerMap: Map<string, Customer>, productMap: Map<string, Product>) {
    const customer = customerMap.get(event.customerAlias)
    const product = productMap.get(event.eventName)

    if (!customer || !product) {
      console.error('Could not find customer or product for event')
      return
    }

    const createPayload: CreateEventPayload = {
      accountId: customer!.accountId,
      customerId: customer!._id,
      productId: product!._id,
      ref: event.ref,
      timestamp: event.timestamp,
      metadata: event.data,
      name: product!.name
    }

    // const affectedInvoices = await this.invoicesService.getAffectedInvoices(
    //   product!._id,
    //   event.timestamp
    // )

    // const lock = await Redis.lock('invoices:to-calculate')
    // const currValue = await Redis.get<string>('invoices:to-calculate')
    // const parsedCurrent = [...(currValue ? JSON.parse(currValue) : [])]
    // const parsedAffectedIds = affectedInvoices.map((invoiceId) => invoiceId.toHexString())
    // const newValue = [...new Set([...parsedCurrent, ...parsedAffectedIds])]
    // await Redis.set('invoices:to-calculate', Array.isArray(newValue) ? newValue : [newValue])
    // await lock.release()

    return op.insert(new Event(createPayload))
  }
}
