const kafka = require("kafka-node");
const topic = "influxt";
const partitionSet = 3;
const kafkaHostAddress = "10.252.73.37:9092";

const Producer = kafka.Producer,
   client = new kafka.KafkaClient({ kafkaHost: kafkaHostAddress }),
   producer = new Producer(client);

producer.on("ready", function () {
   console.log("Producer is on ready");
});
producer.on("error", function (err) {
   console.log("error", err);
});

let jsonbody = `{
   "connector": "test-sink",
   "task": "11"
}`;

async function send2kafka() {
   payloads = [
      {
         topic: topic,
         messages: jsonbody,
         //partition: partitionSet,
      },
   ];

   await producer.send(payloads, function (err, data) {
      if (err) console.error("err: ", err);
      else console.log(data);
   });
}

send2kafka();
