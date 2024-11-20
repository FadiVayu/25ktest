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
}
