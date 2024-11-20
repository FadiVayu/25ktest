import { ObjectId } from 'mongodb'
import { CreateEventPayload, Event } from '../models'
import { Mongo } from '../shared'

export class EventsService {
  public get collection() {
    return Mongo.db.collection<Event>('events')
  }

  public async getByRef(ref: string): Promise<Event | null> {
    const result = await this.collection.findOne({
      ref
    })

    return result ? new Event(result) : null
  }

  public async create(event: CreateEventPayload): Promise<string> {
    // const existingEvent = await this.getByRef(event.ref)

    // if (existingEvent) {
    //   throw Error('Event already exists')
    // }

    const createdResult = await this.collection.insertOne(new Event(event))

    return createdResult.insertedId.toHexString()
  }

  public async readEventsTotals(
    period: { startTime: Date; endTime: Date },
    productsIds: ObjectId[],
    customerId: ObjectId
  ): Promise<Record<string, number>> {
    const eventTotals = await this.collection
      .aggregate<{ _id: ObjectId, total: { $sum: number } }>([
        {
          $match: {
            customerId,
            productId: { $in: productsIds },
            time: { $gte: period.startTime, $lte: period.endTime }
          }
        },
        {
          $group: {
            _id: '$productId',
            total: { $sum: '$value' }
          }
        }
      ])
      .toArray()

    const results: Record<string, number> = {}

    for (const total of eventTotals) {
      results[total._id.toHexString()] = total.total.$sum
    }

    return results
  }
}
