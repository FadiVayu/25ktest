import { config } from '../../src/config'
import { Mongo } from '../../src/shared'

export class BaseTestContext {
  public async setup() {
    await Mongo.connect(config.MONGO.uri, 'test')
    await Mongo.db.dropDatabase()
  }

  public async teardown() {

  }
}