import { parse } from 'jsonc-parser'
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3'
import { EventEmitter } from 'events'
import { Redis } from './Redis'
import { IngestedEvent } from '../models'
import { MessageHandlerService } from '../services'


export class S3FileProcessor {
  private s3: S3Client
  private bucketName: string
  private handlerService: MessageHandlerService

  constructor(
    region: string | undefined,
    bucketName: string | undefined,
  ) {
    if (!bucketName || !region) {
      throw new Error('Invalid parameters')
    }

    EventEmitter.setMaxListeners(50)
    this.s3 = new S3Client({ region })
    this.bucketName = bucketName
    this.handlerService = new MessageHandlerService()
  }

  public async start(): Promise<void> {
    while (true) {
      await this.processBucket()
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  private async processBucket(): Promise<void> {
    console.time('Processing Single Bucket Events')

    const listParams = { Bucket: this.bucketName }
    const listObjectsCommand = new ListObjectsV2Command(listParams)
    const objects = await this.s3.send(listObjectsCommand)

    const keys =
      objects.Contents?.map((obj) => obj.Key).filter(
        (key) => key !== undefined
      ) ?? []


    const tasks2 = keys.map(async (key) => {
      if (!key) return

      const exists = await Redis.get(key)
      if (exists) {
        console.log(`Skipping ${key}`)
        return
      }

      console.time('Processing single file')

      const fileAsString = await this.downloadFile(key)

      await Redis.set(key, key)

      const events = this.processFile(fileAsString)

      await this.handlerService.handle(events)


      console.timeEnd('Processing single file')
    })

    await Promise.all(tasks2)
    console.timeEnd('Processing Single Bucket Events')

    return;
  }

  private async downloadFile(key: string): Promise<string> {
    const params = { Bucket: this.bucketName, Key: key }
    const getObjectCommand = new GetObjectCommand(params)
    const data = await this.s3.send(getObjectCommand)
    const body = data.Body

    if (!body || typeof body.transformToString !== 'function') {
      throw new Error(`Failed to download or transform file: ${key}`)
    }

    const fileAsString = await body.transformToString()
    return fileAsString
  }

  private processFile(fileAsString: string): IngestedEvent[] {
    const fileEvents = parse(fileAsString)

    return Array.isArray(fileEvents) ? fileEvents : [fileEvents]
  }
}
