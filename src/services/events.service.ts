import { CreateEventPayload, Event } from '../models'
import { Mongo } from '../shared'

export class EventsService {
  public async getByRef(ref: string): Promise<Event | null> {
    const result = await Mongo.events.findOne({
      ref
    })

    return result ? new Event(result) : null
  }

  public async create(event: CreateEventPayload): Promise<string> {
    const createdResult = await Mongo.events.insertOne(new Event(event))

    return createdResult.insertedId.toHexString()
  }
}
