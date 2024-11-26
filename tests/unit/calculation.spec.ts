import { ObjectId } from "mongodb"
import { CalculationTestContext } from "../contexts/CalculationTestContext"
import { AggregationMethods, Customer, IngestedEvent, Invoice, Product } from "../../src/models"
import { Mongo } from "../../src/shared"
import { CalculationService } from "../../src/services"
import { expect } from 'chai';

describe('Calculation', () => {
  const context = new CalculationTestContext()


  describe('When the aggregation method is COUNT', () => {
    const accountId = new ObjectId()
    let customer: Customer
    let product: Product
    let invoice: Invoice

    before(async () => {
      await context.setup()
      customer = await context.createCustomer({
        accountId,
        aliases: ['ExternalId', 'Alias'],
        externalId: 'ExternalId'
      })

      product = await context.createProduct({
        accountId,
        pricing: {
          tiers: [
            {
              from: 0,
              to: 500,
              price: 20,
              chunkSize: 100
            },
            {
              from: 500,
              to: Infinity,
              price: 50,
              chunkSize: 150
            }
          ]
        },
        aggregation: {
          type: AggregationMethods.COUNT
        },
      })

      invoice = await context.createInvoice({
        accountId,
        customerId: customer._id,
        products: [
          {
            id: product._id,
            units: 0,
            price: 0
          }
        ],
      })
    })

    describe('When sending events that are aligned with the product', () => {
      let insertedCount = 0;
      let calculatedPrice = 0;
      let messagesLength = 0;
      let invoiceAfterCalculation: Invoice
      let messages: IngestedEvent[]

      before(async () => {
        messages = [
          {
            accountId: accountId.toHexString(),
            customerAlias: 'ExternalId',
            data: {
              count: 1,
              test: true,
              someField: 'not',
              valueField: 12334
            },
            eventName: product.name,
            ref: 'some-ref-' + Date.now() + 1000,
            timestamp: Date.now() + 1000
          },
          {
            accountId: accountId.toHexString(),
            customerAlias: 'ExternalId',
            data: {
              count: 1,
              test: true,
              someField: 'not',
              valueField: 12334
            },
            eventName: product.name,
            ref: 'some-ref-' + Date.now() + 2000,
            timestamp: Date.now() + 2000
          },
          {
            accountId: accountId.toHexString(),
            customerAlias: 'ExternalId',
            data: {
              count: 1,
              test: true,
              someField: 'not',
              valueField: 12334
            },
            eventName: product.name,
            ref: 'some-ref-' + Date.now() + 3000,
            timestamp: Date.now() + 3000
          },
          {
            accountId: accountId.toHexString(),
            customerAlias: 'ExternalId',
            data: {
              count: 1,
              test: true,
              someField: 'not',
              valueField: 12334
            },
            eventName: product.name,
            ref: 'some-ref-' + Date.now() + 4000,
            timestamp: Date.now() + 4000
          },
          {
            accountId: accountId.toHexString(),
            customerAlias: 'ExternalId',
            data: {
              count: 1,
              test: true,
              someField: 'not',
              valueField: 12334
            },
            eventName: product.name,
            ref: 'some-ref-' + Date.now() + 5000,
            timestamp: Date.now() + 5000
          },
          {
            accountId: accountId.toHexString(),
            customerAlias: 'ExternalId',
            data: {
              count: 1,
              test: true,
              someField: 'not',
              valueField: 12334
            },
            eventName: product.name,
            ref: 'some-ref-' + Date.now() + 6000,
            timestamp: Date.now() + 6000
          }
        ]

        messagesLength = messages.length

        await context.messageHandlerService.handle(messages)

        insertedCount = await Mongo.events.countDocuments({
          customerId: customer._id,
          productId: product._id,
          accountId: accountId
        })

        await context.calculationService.calculateInvoiceTotal(invoice._id);

        invoiceAfterCalculation = await Mongo.invoices.findOne({
          _id: invoice._id
        }) as Invoice

        expect(invoiceAfterCalculation).to.not.be.undefined

        calculatedPrice = invoiceAfterCalculation!.priceBreakdown || 0
      })

      it('should insert all events to db', () => {
        expect(insertedCount).to.equal(messagesLength)
      })

      it('should calculate the correct price', () => {
        expect(calculatedPrice).to.equal(20)
        expect(invoiceAfterCalculation.products[0].price).to.equal(20)
      })

      it('should have the correct units for the product', () => {
        expect(invoiceAfterCalculation.products[0].units).to.equal(messagesLength)
      })
    })
  })
});