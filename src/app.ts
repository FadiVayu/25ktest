import dotenv from 'dotenv'
dotenv.config()

import express, { Express } from 'express'
import { config } from './config'
import { RegisterRoutes } from './routes'
import bodyParser from 'body-parser'
import { errorMiddleware, unknownMiddleware } from './middlewares'
import { logger, Mongo, Redis, S3FileProcessor, Redoc } from './shared'
import { traceMiddleware } from './middlewares'

async function initDependencies() {
    await Promise.all([
        Mongo.connect(config.MONGO.uri, config.MONGO.db),
        Redis.connect(config.REDIS.uri)
    ])
}

async function startAPI() {
    const app: Express = express()

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(traceMiddleware)

    Redoc.init(app)

    RegisterRoutes(app)

    app.use(errorMiddleware)
    app.use(unknownMiddleware)

    app.listen(config.PORT, () => {
        logger.info(`Server running on port ${config.PORT}`)
    })
}

async function startEvents() {
    const processor = new S3FileProcessor(config.S3.BUCKET_REGION, config.S3.BUCKET_NAME)
    await processor.start()
}

async function main() {
    try {
        switch (config.MODE) {
            case 'api':
                await initDependencies()
                await startAPI()
                break
            case 'events':
                await initDependencies()
                await startEvents()
                break
            default:
                throw new Error('Invalid mode')
        }
    } catch (e) {
        logger.error('Error Occurred', e)
        process.exit(1)
    }
}

main()
