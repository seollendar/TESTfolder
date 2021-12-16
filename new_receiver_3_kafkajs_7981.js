//const Config = require("./HostAddressConfig.json");
const express = require("express");
const app = express();
const util = require("util");
var cluster = require("cluster");
var numCPUs = require("os").cpus().length;
const { Kafka } = require("kafkajs");
/*
 * config setting
 */
const topic = "SmartPortData";
const partitionSet = 5;
//const kafkaHostAddress = Config.kafkaHostAddress;

const port = 7981;
app.listen(port, () => console.log(`server listening at port:${port}`));

const kafka = new Kafka({
   //brokers: [`${kafkaHostAddress}`],
   brokers: ["localhost:9092"],
});

const producer = kafka.producer();
producer.connect();
// ================================================================

app.post("/noti_for_fastdata", function (req, res) {
   var fullBody = "",
      jsonbody,
      resources,
      ae,
      partitionNum;
   req.on("data", function (chunk) {
      fullBody += chunk;
   });
   req.on("end", async function () {
      jsonbody = JSON.parse(fullBody);
      //console.log(jsonbody);
      if (
         jsonbody["m2m:sgn"] &&
         jsonbody["m2m:sgn"].sur &&
         jsonbody["m2m:sgn"].nev &&
         jsonbody["m2m:sgn"].nev.rep &&
         jsonbody["m2m:sgn"].nev.rep["m2m:cin"]
      ) {
         resources = jsonbody["m2m:sgn"].sur.split("/");
         if (!resources[4]) {
            res.status(404).send("Error : resources does not exist");
            return;
         }

         ae = resources[4];
         partitionNum = ae.hashCode() % partitionSet;

         await producer
            .send({
               topic,
               messages: [
                  { value: JSON.stringify(jsonbody), partition: partitionNum },
               ],
            })
            //.then(console.log)
            .catch((e) => console.error(`[example/producer] ${e.message}`, e));

         res.status(200).send("Received Data");
      } else {
         console.log("sur does not exist. check DataBody: ", jsonbody);
         res.status(400).send("Received Data (sur does not exist)");
      }

      res.end();
      return;
   });
});

String.prototype.hashCode = function () {
   var hash = 0,
      i = 0,
      len = this.length;
   while (i < len) {
      hash = ((hash << 5) - hash + this.charCodeAt(i++)) << 0;
   }
   return hash + 2147483647 + 1;
};
