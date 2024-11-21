import RedisClient from 'ioredis'
import Redlock, { Lock } from 'redlock'

export class Redis {
    private static client: RedisClient
    private static locker: Redlock

    public static async connect(uri: string): Promise<void> {
        this.client = new RedisClient(uri, {
            lazyConnect: true
        })

        await this.client.connect()

        this.locker = new Redlock([this.client], {
            driftFactor: 0.01, // Compensation for clock drift
            retryCount: -1,    // Infinite retries, we handle the limit manually
            retryDelay: 100,   // Initial retry delay (can be overridden)
            retryJitter: 200   // Optional jitter to reduce contention
        })
    }

    public static async lock(key: string): Promise<Lock> {
        return this.locker.acquire([`locks:${key}`], 1000)
    }

    public static async set(key: string, value: string | Record<string, any>, lock?: boolean): Promise<void> {
        let rLock: Lock | null = null

        if (lock) {
            const lockKey = `locks:${key}`
            rLock = await this.locker.acquire([lockKey], 1000)
        }

        const stringified = typeof value === 'object' ? JSON.stringify(value) : value
        await this.client.set(key, stringified);

        if (rLock) {
            await rLock.release()
        }
    }

    public static async get<T = string>(key: string, materialize?: (value: Partial<T>) => T, lock?: boolean): Promise<T | null> {
        let rLock: Lock | null = null

        if (lock) {
            const lockKey = `locks:${key}`
            rLock = await this.locker.acquire([lockKey], 1000)
        }

        const value = await this.client.get(key)

        if (rLock) {
            await rLock.release()
        }

        if (!value) {
            return null
        }

        if (materialize) {
            const parsed = JSON.parse(value)
            return materialize(parsed)
        }

        return value as unknown as T
    }



    public static async invalidate(key: string): Promise<void> {
        await this.client.del(key)
    }
}