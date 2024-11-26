export const config = {
  PORT: process.env.PORT || 3000,
  MONGO: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    db: process.env.MONGO_DB || '25k-test',
  },
  REDIS: {
    uri: process.env.REDIS_URI || 'redis://localhost:6379',
  },
  S3: {
    BUCKET_REGION: process.env.S3_BUCKET_REGION,
    BUCKET_NAME: process.env.S3_BUCKET_NAME,
  },
  MODE: process.env.MODE || 'api'
}