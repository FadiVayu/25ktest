import { Admin, Consumer, Kafka as KafkaClient, KafkaMessage, Producer } from 'kafkajs'
import { MessageHandlerService } from '../services'
import { sleep } from '../utils'
import { isEqual } from 'lodash'
import { IngestedEvent } from '../models'

const KAFKA_GROUP_ID = 'test-group'

export class Kafka {
  public static client: KafkaClient
  private static consumer: Consumer
  private static handler: MessageHandlerService
  private static admin: Admin
  private static producer: Producer

  public static async connect(brokers: string[]): Promise<void> {
    this.handler = new MessageHandlerService()

    this.client = new KafkaClient({
      brokers
    })

    this.admin = this.client.admin()
    await this.admin.connect()

    this.producer = this.client.producer()
    await this.producer.connect()
  }

  public static async start() {
    await this.restartConsumer()

    this.pollForNewTopics()
  }

  public static async subscribeToTopics() {
    this.consumer = this.client.consumer({
      groupId: KAFKA_GROUP_ID,
      minBytes: 100
    })
    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: new RegExp(/^.*-dynamic-topic$/),
      fromBeginning: true
    })
  }

  public static async restartConsumer() {
    if (this.consumer) {
      await this.consumer.stop()
      await this.consumer.disconnect()
    }

    await this.subscribeToTopics()

    this.consumer.run({
      eachBatch: async ({ batch }) => {
        await Promise.all(
          batch.messages.map(async (message: KafkaMessage) => {
            const parsed = JSON.parse(message.value as any) as IngestedEvent
            await this.handler.handle(parsed as any)
          })
        )
      }
    })
  }

  public static async pollForNewTopics() {
    let currentTopics = await this.admin.listTopics()

    while (true) {
      const topics = await this.admin.listTopics()
      if (!isEqual(topics, currentTopics)) {
        console.log('Detected new topics, restarting consumer, TODO: something')
        currentTopics = topics
      }

      await sleep(5000)
    }
  }

  public static async produce(topic: string, messages: any[]) {
    await this.producer.send({
      topic,
      messages
    })
  }
}
