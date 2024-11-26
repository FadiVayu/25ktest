import { ObjectId } from "mongodb";
import { AggregationMethods, CreateCustomerPayload, CreateInvoicePayload, CreateProductPayload, Customer, Invoice, Product } from "../../src/models";
import { BaseTestContext } from "./BaseTestContext";
import { CalculationService, CustomersService, InvoicesService, MessageHandlerService, ProductsService } from "../../src/services";
import { Redis } from "../../src/shared";
import { config } from "../../src/config";

export class CalculationTestContext extends BaseTestContext {
  public invoicesService: InvoicesService
  public productsService: ProductsService
  public messageHandlerService: MessageHandlerService
  public customersService: CustomersService
  public calculationService: CalculationService

  public async setup() {
    await super.setup()
    await Redis.connect(config.REDIS.uri)

    this.invoicesService = new InvoicesService()
    this.productsService = new ProductsService()
    this.customersService = new CustomersService()
    this.messageHandlerService = new MessageHandlerService()
    this.calculationService = new CalculationService()
  }

  public async teardown() {
    await Redis.clear()
    await super.teardown()
  }

  public async createCustomer(customer: Partial<CreateCustomerPayload>): Promise<Customer> {
    const dummyCustomer = Object.assign<Partial<Customer>, any>({
      updatedAt: new Date(),
      createdAt: new Date(),
      _id: new ObjectId(),
      accountId: new ObjectId(),
      name: 'Test Customer - ' + Date.now()
    }, customer)

    await this.customersService.create(dummyCustomer);
    return new Customer(dummyCustomer)
  }


  public async createInvoice(invoice: Partial<CreateInvoicePayload>): Promise<Invoice> {
    const dummyInvoice = Object.assign<Partial<Invoice>, any>({
      priceBreakdown: 0,
      products: [],
      updatedAt: new Date(),
      createdAt: new Date(),
      _id: new ObjectId(),
      accountId: new ObjectId(),
      customerId: new ObjectId(),
      name: 'Test Invoice - ' + Date.now(),
      billingPeriod: {
        startTime: new Date(),
        endTime: new Date(new Date().setDate(new Date().getDate() + 30))
      }
    }, invoice)

    await this.invoicesService.create(dummyInvoice);
    return new Invoice(dummyInvoice)
  }

  public async createInvoices(invoices: Partial<CreateInvoicePayload>[]): Promise<Invoice[]> {
    return Promise.all(invoices.map(i => this.createInvoice(i)))
  }

  public async createProduct(product: Partial<CreateProductPayload>): Promise<Product> {
    const dummyProduct = Object.assign<Partial<Product>, any>({
      updatedAt: new Date(),
      createdAt: new Date(),
      _id: new ObjectId(),
      accountId: new ObjectId(),
      aggregation: {
        type: AggregationMethods.COUNT
      },
      name: 'Test Product - ' + Date.now(),
      pricing: {
        tiers: [
          {
            from: 0,
            to: Infinity,
            price: 10,
            chunkSize: 1
          }
        ]
      }
    }, product)

    await this.productsService.create(dummyProduct);
    return new Product(dummyProduct)
  }

  public async createProducts(products: Partial<CreateProductPayload>[]): Promise<Product[]> {
    return Promise.all(products.map(p => this.createProduct(p)))
  }
}