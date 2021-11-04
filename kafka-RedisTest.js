const express = require("express");
const app = express();
const kafka = require("kafka-node");
const redis = require("redis");
const Rclient = redis.createClient();

Rclient.on("error", function (error) {
   console.error(error);
});

/*
 * config setting
 */
const topic = "ta6";

const port = 7980;
app.listen(port, () => console.log(`server listening at port:${port}`));

var HighLevelProducer = kafka.HighLevelProducer,
   client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" }),
   producer = new HighLevelProducer(client);
producer.on("ready", function () {
   console.log("Producer is on ready");
});

producer.on("error", function (err) {
   console.log("error", err);
});

let partitionNumber = 0;
app.post("/noti_for_fastdata", (req, res) => {
   var fullBody = "",
      jsonbody,
      resources,
      getPid,
      Pid,
      ae;
   req.on("data", function (chunk) {
      fullBody += chunk;
   });
   req.on("end", async function () {
      jsonbody = JSON.parse(fullBody);
      if (
         jsonbody["m2m:sgn"]?.sur &&
         jsonbody["m2m:sgn"]?.nev?.rep["m2m:cin"]
      ) {
         resources = jsonbody["m2m:sgn"].sur.split("/");
         if (!resources[4]) {
            res.status(404).send("Error : resources does not exist");
            return;
         }

         ae = resources[4];
         Promise.all[
            (client.set("key", "hehehehe"), client.get("key", redis.print))
         ];
         getPid = Rclient.get(ae);
         console.log("getPid", getPid);
         if (!getPid) {
            Pid = partitioning();
            Rclient.set(ae, Pid);
            payloads = [
               {
                  topic: topic,
                  messages: JSON.stringify(jsonbody),
                  partition: Pid,
               },
            ];

            producer.send(payloads, function (err, data) {
               if (err) console.log(err);
               //else console.log(data);
            });
         } else {
            payloads = [
               {
                  topic: topic,
                  messages: JSON.stringify(jsonbody),
                  partition: getPid,
               },
            ];

            producer.send(payloads, function (err, data) {
               if (err) console.log(err);
               //else console.log(data);
            });
         }
      }
      res.end();
      return;
   });
});

const partitioning = () => {
   const newPartitionNumber = ++partitionNumber % 5;
   partitionNumber = newPartitionNumber == 0 ? 0 : newPartitionNumber;
   return newPartitionNumber;
};
