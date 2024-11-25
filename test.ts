import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const run = async () => {
  let count = 0

  for (let product = 0; product < 1000; product++) {
    const messages: any[] = []
    for (let i = 0; i < 1000; i++) {
      messages.push({
          accountId: '60d5ec49f1b2c72b8c8b4567',
          timestamp: Date.now(),
          data: {
            count: count++,
            test: true,
            someField: 'not',
            valueField: 12334
          },
          ref: `some-ref-${i}-${product}-${Date.now()}`,
          customerAlias: `customer-${i % 10}`,
          eventName: `Meter ${product}`
        }
      )
    }

    const sendMessageCommands = new PutObjectCommand({
      Bucket: 'eyal-ingest-test',
      Key: `test-key-v3-${product}`,
      Body: JSON.stringify(messages)
    })

    console.time('send')
    await new S3Client({ region: 'us-east-1' }).send(sendMessageCommands)
    console.timeEnd('send')
  }
}

run().catch(console.error)
