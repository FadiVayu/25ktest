import dotenv from 'dotenv'
import express, { Express, Request, Response, NextFunction } from 'express'
import { config } from './config'
import { RegisterRoutes } from './routes'
import bodyParser from 'body-parser'
import { errorMiddleware, unknownMiddleware } from './middlewares'
import { logger, Kafka, Mongo, Redis } from './shared'
import { traceMiddleware } from './middlewares'

dotenv.config()

async function initDependencies() {
    await Promise.all([
        Mongo.connect(config.MONGO.uri),
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

async function main() {
    try {
        switch (config.MODE) {
            case 'api':
                await initDependencies()
                await startAPI()
                break
            case 'worker':
                await initDependencies()
            default:
                throw new Error('Invalid mode')
        }
    } catch (e) {
        logger.error('Unable to start the server', e)
        process.exit(1)
    }
}

main()
