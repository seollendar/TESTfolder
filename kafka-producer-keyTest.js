const express = require("express");
const app = express();
const kafka = require("kafka-node");
/*
 * config setting
 */
const topic = "ta9";

const port = 7980;
app.listen(port, () => console.log(`server listening at port:${port}`));

var HighLevelProducer = kafka.HighLevelProducer,
   client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" }),
   producer = new HighLevelProducer(client, {
      partitionerType: 3,
   });
producer.on("ready", function () {
   console.log("Producer is on ready");
});

producer.on("error", function (err) {
   console.log("error", err);
});

let Number = 0;
app.post("/noti_for_fastdata", (req, res) => {

         let payload = [
            {
               topic: topic,
               key: ae,
               value: JSON.stringify(jsonbody),
            },
         ];
         await producer.send(payload, function (err, data) {
            if (err) console.log(err);
            //else console.log(data);
         });
      
      res.end();

});

