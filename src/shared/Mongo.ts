import { MongoClient, Db, IndexSpecification, CreateIndexesOptions } from 'mongodb'
import { config } from '../config'
import { Event, Customer, Product, Invoice, IngestedEvent } from '../models'

export class Mongo {
  public static client: MongoClient
  public static db: Db

  private static async createIndexSafely<T = any >(collection: string, index: IndexSpecification & Partial<Record<keyof T, 1 | -1>>, options?: CreateIndexesOptions) {
    const collectionExists = await this.db.listCollections({ name: collection }).hasNext()
    if (!collectionExists) {
      await this.db.createCollection(collection)
    }

    const indexEntries = Object.entries(index).map(([key, value]) => `${key}_${value}`).join('_')
    const indexName = `${options?.unique ? 'uniq' : 'idx'}_${indexEntries}`

    return this.db.collection(collection).createIndex(index, { ...options, name: indexName, background: true })
  }
  
  private static async createIndexes(): Promise<void> {
    await this.createIndexSafely<Customer>('customers', { accountId: 1, externalId: 1 }, { unique: true })
    await this.createIndexSafely<Event>('events', { accountId: 1, ref: 1 }, { unique: true })
    await this.createIndexSafely<Product>('products', { accountId: 1, name: 1 }, { unique: true })
  }

  public static async connect(uri: string): Promise<void> {
    this.client = new MongoClient(uri)

    try {
      await this.client.connect()
    } catch (e) {
      throw Error('Unable to connect to the database')
    }

    this.db = this.client.db(config.MONGO.db)

    await this.createIndexes()
  }

  public static get rawEvents() {
    return this.db.collection<IngestedEvent>('rawEvents')
  }

  public static get events() {
    return this.db.collection<Event>('events')
  }

  public static get customers() {
    return this.db.collection<Customer>('customers')
  }

  public static get products() {
    return this.db.collection<Product>('products')
  }

  public static get invoices() {
    return this.db.collection<Invoice>('invoices')
  }
}
