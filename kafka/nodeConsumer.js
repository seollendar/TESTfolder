var kafka = require("kafka-node"),
   client = new kafka.KafkaClient(),
   offset = new kafka.Offset(client);
offset.fetch(
   [{ topic: "test-bash", partition: 0, time: Date.now(), maxNum: 1 }],
   function (err, data) {
      console.log(data);
      // { 't': { '0': [999] } }
   }
);
