export const config = {
  PORT: process.env.PORT || 3000,
  MONGO: {
    // uri: 'mongodb+srv://v4yu_ma1n_adm1n:fnlXcw57XfNID12e@dev-servereless-cluster.0zlzw3j.mongodb.net',
    // db: '25k-test',
    // uri: 'mongodb://localhost:27017',
    uri: 'mongodb://mongo:27017',
    db: 'main'
  },
  KAFKA: {
    brokers: ['redpanda-0:9092']
    // brokers: ['localhost:19092']
  },
  REDIS: {
    uri: 'redis://redis:6379'
    // uri: 'redis://localhost:6379'
  },
  MODE: process.env.MODE || 'api'
}