import { Kafka } from 'kafkajs'

const kafka = new Kafka({
  brokers: ['localhost:19092']
})

const producer = kafka.producer()

const run = async () => {
  await producer.connect()

  let count = 0
  for (let j = 0; j < 100; j++) {
    const messages: any[] = []
    for (let i = 0; i < 1000; i++) {
      messages.push({
        value: JSON.stringify({
          accountId: '60d5ec49f1b2c72b8c8b4567',
          timestamp: Date.now(),
          data: {
            count: count++,
            test: true,
            someField: 'not',
            valueField: 12334
          },
          ref: `some-ref-${i}-${j}`,
          customerAlias: `customer-${j % 10}`,
          eventName: `Meter ${j}`
        })
      })
    }

    await producer.send({
      topic: '1-dynamic-topic',
      messages
    })
  }
  await producer.disconnect()
}

run().catch(console.error)
