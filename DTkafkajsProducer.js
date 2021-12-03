const { Kafka } = require("kafkajs");

const kafka = new Kafka({
   brokers: ["localhost:9092"],
});
/*
const producer = kafka.producer();

producer.connect();
// await producer.send({
//    topic: "topic-name",
//    messages: [
//       { value: "hello world", partition: 0 },
//       { value: "hey hey!", partition: 1 },
//    ],
// });

async () => {
   await producer.send({
      topic: "tp01",
      messages: [
         { value: "hello world", partition: 0 },
         { value: "hey hey!", partition: 1 },
      ],
   });
};
*/

const topic = "SmartPortData";
const producer = kafka.producer();
producer.connect();

const sendMessage = () => {
   return producer
      .send({
         topic,
         messages: [
            { value: "ssul zzzz", partition: 2 },
            { value: "heeeeeeeeeeeeeeeey", partition: 4 },
         ],
      })
      .then(console.log)
      .catch((e) => console.error(`[example/producer] ${e.message}`, e));
};

const run = async () => {
   // await producer.connect();
   //sendMessage();
   setInterval(sendMessage, 3000);
};

run().catch((e) => console.error(`[example/producer] ${e.message}`, e));
