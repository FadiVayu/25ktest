import { MongoClient, ObjectId } from "mongodb";
async function main() {

  const ids = [
    "673dd57b527b693b55753d10",
    "673dd57b527b693b55753d11",
    "673dd57b527b693b55753d12",
    "673dd57b527b693b55753d13",
    "673dd57b527b693b55753d14",
    "673dd57b527b693b55753d15",
    "673dd57b527b693b55753d16",
    "673dd57b527b693b55753d17",
    "673dd57b527b693b55753d18",
    "673dd57b527b693b55753d19"
  ];

  const mongo = new MongoClient('mongodb://localhost:27017');

  await mongo.connect();

  const document = mongo.db('main');
  const products = document.collection('products');
  for (const id of ids) {
    console.info('handling id', id)
    if (id === "673dd57b527b693b55753d10") {
      await products.updateOne(
        { _id: new ObjectId("673dd57b527b693b55753d10") },
        {
          $set: {
            pricing: { tiers: [
              { from: 0, to: 100, price: 10, chunkSize: 50 },
              { from: 100, to: 300, price: 20, chunkSize: 75 },
              {
                from: 300,
                to: Number.MAX_VALUE,
                price: 50,
                chunkSize: 100,
              },
            ] },
          },
        }
      );
    } else if (id === "673dd57b527b693b55753d11") {
      await products.updateOne(
        { _id: new ObjectId("673dd57b527b693b55753d11") },
        {
          $set: {
            pricing: { tiers: [
              { from: 0, to: 200, price: 15, chunkSize: 60 },
              { from: 200, to: 500, price: 30, chunkSize: 80 },
              {
                from: 500,
                to: Number.MAX_VALUE,
                price: 60,
                chunkSize: 120,
              }
            ]},
          },
        }
      );
    } else if (id === "673dd57b527b693b55753d12") {
      await products.updateOne(
        { _id: new ObjectId("673dd57b527b693b55753d12") },
        {
          $set: {
            pricing: { tiers: [
              { from: 0, to: 150, price: 12, chunkSize: 40 },
              { from: 150, to: 400, price: 25, chunkSize: 70 },
              { from: 400, to: Number.MAX_VALUE, price: 55, chunkSize: 90 }
            ]},
          },
        }
      );
    } else if (id === "673dd57b527b693b55753d13") {
      await products.updateOne(
        { _id: new ObjectId("673dd57b527b693b55753d13") },
        {
          $set: {
            pricing: { tiers: [
              { from: 0, to: 50, price: 5, chunkSize: 20 },
              { from: 50, to: 250, price: 15, chunkSize: 40 },
              { from: 250, to: Number.MAX_VALUE, price: 35, chunkSize: 80 }
            ]},
          },
        }
      );
    } else if (id === "673dd57b527b693b55753d14") {
      await products.updateOne(
        { _id: new ObjectId("673dd57b527b693b55753d14") },
        {
          $set: {
            pricing: { tiers: [
              { from: 0, to: 75, price: 8, chunkSize: 30 },
              { from: 75, to: 275, price: 18, chunkSize: 50 },
              { from: 275, to: Number.MAX_VALUE, price: 40, chunkSize: 85 }
            ]},
          },
        }
      );
    } else {
      await products.updateOne(
        { _id: new ObjectId("673dd57b527b693b55753d15") },
        {
          $set: {
            pricing: { tiers: [
              { from: 0, to: 500, price: 20, chunkSize: 100 }, // Default tier if ID doesn't match any case
              { from: 500, to: Number.MAX_VALUE, price: 50, chunkSize: 150 }
            ]},
          },
        }
      );
    }
  }

  console.info('done');
  return 0;
}

main().catch(console.error)