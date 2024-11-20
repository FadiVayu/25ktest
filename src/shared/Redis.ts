import RedisClient from 'ioredis'

export class Redis {
    private static client: RedisClient

    public static async connect(uri: string): Promise<void> {
        this.client = new RedisClient(uri, {
            lazyConnect: true
        })

        await this.client.connect()
    }

    public static async set(key: string, value: string): Promise<void> {
        await this.client.set(key, value);
    }

    public static async get(key: string): Promise<string | null> {
        return this.client.get(key)
    }

    public static async invalidate(key: string): Promise<void> {
        await this.client.del(key)
    }
}