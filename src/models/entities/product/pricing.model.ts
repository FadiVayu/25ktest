export type Pricing = {
  tiers: {
    from: number
    to: number
    price: number
    chunkSize: number
  }[]
}