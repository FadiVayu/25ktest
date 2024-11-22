export const config = {
  PORT: process.env.PORT || 3000,
  MONGO: {
    uri: process.env.MONGO_URI || '',
    db: process.env.MONGO_DB || '25k-test',
  },
  KAFKA: {
    brokers: JSON.parse(process.env.KAFKA_BROKERS || '["localhost:19092"]'),
  },
  REDIS: {
    uri: process.env.REDIS_URI || 'redis://localhost:6379',
  },
  MODE: process.env.MODE || 'api'
}