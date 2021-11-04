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
   // Number++;
   // if (Number == 1) console.time("tps");
   // if (Number == 50000) console.timeEnd("tps");
   var fullBody = "",
      jsonbody,
      resources,
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
      }
      res.end();
      return;
   });
});
