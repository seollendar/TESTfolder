const express = require("express");
const app = express();
const kafka = require("kafka-node");
const HashMap = require("hashmap");
var map = new HashMap();
/*
 * config setting
 */
const topic = "tp3";

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
let Number = 0;
var aeTime = { 1: "1", 2: "2", 3: "3" };
app.post("/noti_for_fastdata", (req, res) => {
   // Number++;
   // if (Number == 1) console.time("tps");
   // if (Number == 50000) console.timeEnd("tps");
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
         console.log(ae, jsonbody["m2m:sgn"].nev.rep["m2m:cin"].con.time);
         // aeTime[ae] = jsonbody["m2m:sgn"].nev.rep["m2m:cin"].con.time
         preTime = aeTime[ae];
         curTime = jsonbody["m2m:sgn"].nev.rep["m2m:cin"].con.time;
         getPid = await map.get(ae);
         if (getPid == undefined) {
            aeTime[ae] = jsonbody["m2m:sgn"].nev.rep["m2m:cin"].con.time;
            Pid = partitioning();
            map.set(ae, Pid);
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
            if (curTime - preTime < 5000) {
               aeTime[ae] = jsonbody["m2m:sgn"].nev.rep["m2m:cin"].con.time;
               Pid = partitioning();
               map.set(ae, Pid);
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
      }
      res.end();
      return;
   });
});

const partitioning = () => {
   const newPartitionNumber = ++partitionNumber % 15;
   partitionNumber = newPartitionNumber == 0 ? 0 : newPartitionNumber;
   return newPartitionNumber;
};
