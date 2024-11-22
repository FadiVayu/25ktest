import { parse } from 'jsonc-parser'
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3'
import fs from 'fs/promises'
import path from 'path'
import { EventEmitter } from 'events'

import { Redis } from './Redis'
import { IngestedEvent, RawEvent } from '../models'
import { Mongo } from './Mongo'
import { v4 } from 'uuid'

import { Client } from 'pg'

// PostgreSQL connection configuration
const client = new Client({
  user: 'v4yu_ev3nts_adm1n',
  host: 'localhost', // or your PostgreSQL host
  database: '25k',
  password: '',
  port: 5432 // Default PostgreSQL port
})

export class S3FileProcessor {
  private s3: S3Client
  private bucketName: string
  private localDir: string

  constructor(
    region: string,
    bucketName: string,
    localDir: string = './downloads'
  ) {
    EventEmitter.setMaxListeners(50)
    this.s3 = new S3Client({ region })
    this.bucketName = bucketName
    this.localDir = localDir
  }

  private async ensureLocalDir(): Promise<void> {
    await fs.mkdir(this.localDir, { recursive: true })
  }

  private async downloadFile(key: string): Promise<string> {
    const params = { Bucket: this.bucketName, Key: key }
    const getObjectCommand = new GetObjectCommand(params)
    // console.time(`downloadFile: ${key}`);
    const data = await this.s3.send(getObjectCommand)
    // console.timeEnd(`downloadFile: ${key}`);
    const body = data.Body

    if (!body || typeof body.transformToString !== 'function') {
      throw new Error(`Failed to download or transform file: ${key}`)
    }

    const fileAsString = await body.transformToString()
    // const filePath = path.join(this.localDir, path.basename(key));
    // await fs.writeFile(filePath, fileAsString); // Save locally
    return fileAsString // Return file content
  }

  private processFile(fileAsString: string) {
    const events = parse(fileAsString) // Replace `parse` with your actual parser

    return events
  }

  public async processBucket(): Promise<void> {
    console.time('processBucket')
    // await this.ensureLocalDir();

    const listParams = { Bucket: this.bucketName }
    const listObjectsCommand = new ListObjectsV2Command(listParams)
    const objects = await this.s3.send(listObjectsCommand)

    const keys =
      objects.Contents?.map((obj) => obj.Key).filter(
        (key) => key !== undefined
      ) ?? []

    const tasks: Promise<number>[] = []

    const tasks2 = keys.map(async (key) => {
      if (!key) return

      const exists = await Redis.get(key + '123123dd1')
      if (exists) {
        console.log(`Skipping ${key}`)
        return
      }

      const fileAsString = await this.downloadFile(key)

      await Redis.set(key, key)

      const events = this.processFile(fileAsString)

      const parsedEvents = events.map(
        (rawEvent: { value: string }) => new RawEvent(parse(rawEvent.value))
      )

      // console.log(parsedEvents[0])


      await Mongo.rawEvents.insertMany(parsedEvents);

      return parsedEvents
    })

    const results = (await Promise.all(tasks2))
      .flat()
      .filter((r) => r !== undefined)
    console.timeEnd('processBucket')
    return;
    console.time('insertMany')

    const chunkSize = 2500
    const promises = []

    await client.connect()

    for (let i = 0; i < results.length; i += chunkSize) {
      const chunk = results.slice(i, i + chunkSize)

    //   const values = chunk
    //     .map(
    //       ({
    //         accountId,
    //         timestamp,
    //         data,
    //         ref,
    //         customerAlias,
    //         eventName,
    //         _id,
    //         createdAt,
    //         updatedAt
    //       }) => `(
    //       '${accountId}',
    //       ${timestamp},
    //       '${JSON.stringify(data)}',
    //       '${ref}-${v4()}',
    //       '${customerAlias}',
    //       '${eventName}',
    //       '${_id.toHexString()}', 
    //       '${new Date(createdAt).toISOString()}',
    //       '${new Date(updatedAt).toISOString()}'
    //     )`
    //     )
    //     .join(',')

    //   const query = `
    //   INSERT INTO raw_events (
    //     account_id, timestamp, data, ref, customer_alias, event_name, mongo_id, created_at, updated_at
    //   ) VALUES ${values};
    // `

    //   promises.push(client.query(query))

      promises.push(Mongo.rawEvents.insertMany(chunk))
    }

    await Promise.all(promises)

    console.timeEnd('insertMany')

    console.log(`Total events processed: ${results.length}`)
  }
}
