import { MongoClient, Db } from 'mongodb'
import { config } from '../config'
import { Customer } from '../models'

export class Mongo {
  public static client: MongoClient
  public static db: Db

  private static async createIndexes(): Promise<void> {
    const customersCollection = this.db.collection<Customer>('customers')

    await customersCollection.createIndex(
      {
        accountId: 1,
        externalId: 1
      },
      { unique: true, background: true }
    )

    const eventsCollection = this.db.collection('events')

    await eventsCollection.createIndex(
      {
        accountId: 1,
        ref: 1
      },
      { unique: true, background: true }
    )

    const productsCollection = this.db.collection('products')

    await productsCollection.createIndex(
      {
        accountId: 1,
        name: 1
      },
      { unique: true, background: true }
    )
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
}
