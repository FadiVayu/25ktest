import dotenv from 'dotenv'
dotenv.config()

import express, { Express } from 'express'
import { config } from './config'
import { RegisterRoutes } from './routes'
import bodyParser from 'body-parser'
import { errorMiddleware, unknownMiddleware } from './middlewares'
import { logger, Kafka, Mongo, Redis } from './shared'
import { traceMiddleware } from './middlewares'
import { CalculationService } from './services'

async function initDependencies() {
    await Promise.all([
        Mongo.connect(config.MONGO.uri, config.MONGO.db),
        Kafka.connect(config.KAFKA.brokers),
        Redis.connect(config.REDIS.uri)
    ])
}

async function startAPI() {
    const app: Express = express()

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(traceMiddleware)

    RegisterRoutes(app)

    app.use(errorMiddleware)
    app.use(unknownMiddleware)

    app.listen(config.PORT, () => {
        logger.info(`Server running on port ${config.PORT}`)
    })
}

async function startEvents() {
    await Kafka.start()
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
            case 'worker':
                await initDependencies()
                await CalculationService.startCron()
                break
            default:
                throw new Error('Invalid mode')
        }
    } catch (e) {
        logger.error('Unable to start the server', e)
        process.exit(1)
    }
}

main()
