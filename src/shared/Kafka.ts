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
    this.logRate()
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
        this.messageCount += batch.messages.length
        await Promise.all(
          batch.messages.map(async (message: KafkaMessage) => {
            const parsed = JSON.parse(message.value as any) as IngestedEvent
            await this.handler.handle(parsed as any)
          })
        )
        this.messageCountAfterProcessing += batch.messages.length
      }
    })
  }

  private static messageCount = 0
  private static messageCountAfterProcessing = 0
  private static maxMessagePerSec = 0
  private static maxMessagePerSecAfterProcessing = 0
  private static lastLoggedTime = Date.now()
  public static async logRate() {
    const logRate = () => {
      const now = Date.now()
      const elapsedSeconds = (now - this.lastLoggedTime) / 1000

      const messagesPerSecondAfterProcessing =
        this.messageCountAfterProcessing / elapsedSeconds
      const messagesPerSecond = this.messageCount / elapsedSeconds
      this.maxMessagePerSec = Math.max(this.maxMessagePerSec, messagesPerSecond)
      this.maxMessagePerSecAfterProcessing = Math.max(
        this.maxMessagePerSecAfterProcessing,
        messagesPerSecondAfterProcessing
      )
      // console.log(
      //   `Messages per second: ${messagesPerSecond.toFixed(2)};  Max: ${this.maxMessagePerSec.toFixed(2)}`
      // )
      // console.log(
      //   `Messages per second after processing: ${messagesPerSecondAfterProcessing.toFixed(2)};  Max: ${this.maxMessagePerSecAfterProcessing.toFixed(2)}`
      // )

      this.messageCount = 0
      this.messageCountAfterProcessing = 0
      this.lastLoggedTime = now
    }

    setInterval(logRate, 1000)
  }

  public static async pollForNewTopics() {
    let currentTopics = await this.admin.listTopics()

    while (true) {
      const topics = await this.admin.listTopics()
      if (!isEqual(topics, currentTopics)) {
        console.log('Detected new topics, restarting consumer, TODO: something')
        // await this.restartConsumer();
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
