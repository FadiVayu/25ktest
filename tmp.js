const AWS = require('aws-sdk');

// Configure AWS SDK for Kinesis
const kinesis = new AWS.Kinesis({ region: 'us-east-1' }); // Replace 'us-east-1' with your region

// Define Kinesis stream name
const streamName = '25ktest'; // Replace with your stream name

// Generate messages
function generateMessages() {
  let count = 0;
  const messages = [];

  for (let product = 0; product < 100; product++) {
    for (let i = 0; i < 1000; i++) {
      messages.push({
        accountId: '60d5ec49f1b2c72b8c8b4567',
        timestamp: Date.now(),
        data: {
          count: count++,
          test: true,
          someField: 'not',
          valueField: 12334,
        },
        ref: `some-ref-${i}-${product}-${Date.now()}`,
        customerAlias: `customer-${i % 10}`,
        eventName: `Meter ${product}`,
      });
    }
  }

  return messages;
}

// Send messages to Kinesis
async function sendMessagesToKinesis(messages) {
  const records = messages.map((msg) => ({
    Data: JSON.stringify(msg), // Convert message to a string
    PartitionKey: `accountId-60d5ec49f1b2c72b8c8b4567`, // Use a partition key
  }));

  try {
    // Kinesis limits: max 500 records per request, max 5MB per request
    const chunkSize = 500;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const params = {
        StreamName: streamName,
        Records: chunk,
      };
      const result = await kinesis.putRecords(params).promise();
      console.log(`Batch ${Math.floor(i / chunkSize) + 1}:`, result);
    }
    console.log('All messages sent successfully!');
  } catch (error) {
    console.error('Error sending messages:', error);
  }
}

// Main function
async function main() {
  const messages = generateMessages();
  await sendMessagesToKinesis(messages);
}

// Run the script
main().catch((error) => console.error('Script error:', error));