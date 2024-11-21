import RedisClient from 'ioredis'

export class Redis {
    private static client: RedisClient

    public static async connect(uri: string): Promise<void> {
        this.client = new RedisClient(uri, {
            lazyConnect: true
        })

        await this.client.connect()
    }

    public static async set(key: string, value: string | Record<string, any>): Promise<void> {
        const stringified = typeof value === 'object' ? JSON.stringify(value) : value
        await this.client.set(key, stringified);
    }

    public static async get<T = string>(key: string, materialize?: (value: Record<string, any>) => T): Promise< T | null> {
        const value = await this.client.get(key)

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