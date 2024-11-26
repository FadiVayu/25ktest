import { MongoClient, Db, IndexSpecification, CreateIndexesOptions } from 'mongodb'
import { Event, Customer, Product, Invoice, IngestedEvent } from '../models'

type IndexForT<T> = Partial<Record<keyof T, 1 | -1>> & IndexSpecification;


export class Mongo {
  public static client: MongoClient
  public static db: Db

  private static async createIndexSafely<T = any >(collection: string, index: IndexSpecification & Partial<Record<keyof T, 1 | -1>>, options?: CreateIndexesOptions) {
    const collections = await this.db.listCollections({ name: collection }).toArray();
    
    if (collections.length === 0) {
      await this.db.createCollection(collection);
    }

    const existingIndexes = await this.db.collection(collection).listIndexes().toArray();

    const indexExists = existingIndexes.some((existingIndex) =>
      JSON.stringify(Object.keys(existingIndex)) === JSON.stringify(Object.keys(index))
    );


    const indexEntries = Object.entries(index).map(([key, value]) => `${key}_${value}`).join('_')
    const indexName = `${options?.unique ? 'uniq' : 'idx'}_${indexEntries}`

    if (!indexExists) {
      await this.db.collection(collection).createIndex(index, { ...options, name: indexName, background: true });
    } else {
      console.log(`Index already exists for collection ${collection}:`, index);
    }
  }
  
  private static async createIndexes(): Promise<void> {
    // await this.createIndexSafely<Customer>('customers', { accountId: 1, externalId: 1 }, { unique: true })
    // await this.createIndexSafely<Event>('events', { accountId: 1, ref: 1 }, { unique: true })
    // await this.createIndexSafely<Product>('products', { accountId: 1, name: 1 }, { unique: true })
    // await this.createIndexSafely<Event>('events', { accountId: 1, customerId: 1, productId: 1 })
    // await this.createIndexSafely<Event>('events', { accountId: 1, customerId: 1, productId: 1, timestamp: 1 })
  }

  public static async connect(uri: string, db: string): Promise<void> {
    this.client = new MongoClient(uri)

    try {
      await this.client.connect()
    } catch (e) {
      throw Error('Unable to connect to the database')
    }

    this.db = this.client.db(db)

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
