import { ObjectId } from "mongodb"

async function main() {
  const customerTemplate = {
    accountId: new ObjectId('60d5ec49f1b2c72b8c8b4567'),
    aliases: [],
    name: 'John Doe',
    externalId: '',
    metadata: {}
  }

  const customerIds = [
      "673dd42b527b693b55753d06",
      "673dd42b527b693b55753d07",
      "673dd42b527b693b55753d08",
      "673dd42b527b693b55753d09",
      "673dd42b527b693b55753d0a",
      "673dd42b527b693b55753d0b",
      "673dd42b527b693b55753d0c",
      "673dd42b527b693b55753d0d",
      "673dd42b527b693b55753d0e",
      "673dd42b527b693b55753d0f"
    ];


  const toCreate: any[] = []
  for (let i = 0; i < 10; ++i) {
    toCreate.push({
      ...customerTemplate,
      name: `Customer ${i}`,
      externalId: `customer-${i}`,
      aliases: [`customer-${i}`]
    })
  }


  const meters: any[] = []
  let count = 0;
  for(const customer of customerIds) {
    for(let i = 0; i < 10; ++i) {
      meters.push({
        accountId: new ObjectId('60d5ec49f1b2c72b8c8b4567'),
        customerId: new ObjectId(customer),
        name: `Meter ${count++}`,
        aggregation: {
          type: 'count'
        }
      })
    }
  }

  console.log(meters);

}

main().catch(console.error)