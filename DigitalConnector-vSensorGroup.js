const config = require("./configs.json");
const express = require("express");
const app = express();
const util = require("util");
const { DateTime } = require("luxon"); //DateTime.now().toFormat("yyyy-MM-dd")
const port = 1220;
app.listen(port, () => {
   console.log(`Server Start on http://localhost:${port}`);
});

var redis = require("redis");
var client = redis.createClient({
   port: config.redis.port,
   host: config.redis.ip,
});
client.on("error", function (err) {
   console.log("Error " + err);
});

const { tryJSONparse } = require("./lib");

/*
 * POST sensor Creation
 */
app.post("/DigitalConnector/SensorGroup", function (req, res) {
   let fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let messageObject = fullBody;
      if (tryJSONparse(messageObject)) {
         sensorNameObj = tryJSONparse(messageObject);
         if (sensorNameObj?.name && sensorNameObj?.mq) {
            client.hset(
               "SensorGroup",
               sensorNameObj.name,
               JSON.stringify(sensorNameObj.mq)
            );

            res.status(200).send("create sensorGroup");
         } else {
            res.status(500).send("please check mandatory field");
         }
      } else {
         res.status(500).send("is not a json structure");
      }
   });
});

/*
 * sensorGroup Retrieve
 */
app.get("/DigitalConnector/SensorGroup", async (req, res) => {
   const SensorList = [];
   client.hkeys("SensorGroup", function (err, keys) {
      // 해시테이블 모든 키 데이터 가져오기
      if (err) throw err;
      keys.forEach(function (key, i) {
         SensorList.push(key);
      });
      //console.log("SensorList " + SensorList);
      res.send({ SensorList: SensorList });
   });
});

/*
 * sensorGroup delete
 */
app.delete("/DigitalConnector/SensorGroup", async (req, res) => {
   const resLength = await getHlength().then(function (resLength) {
      return resLength;
   });

   client.del("SensorGroup", redis.print);

   res.send({ deleted: resLength });
});
//get hash table flield count
function getHlength() {
   return new Promise((resolve) => {
      client.hkeys("SensorGroup", function (err, keys) {
         if (err) throw err;
         resolve(keys.length);
      });
   });
}

/*
 * sensor Data Creation
 */
app.post("/DigitalConnector/SensorGroup/:sensorName", function (req, res) {
   let fullBody = "";

   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", async function () {
      if (!req.params?.sensorName) {
         res.status(500).send("please check sensorName parameter");
      }
      let messageObject = fullBody;
      if (tryJSONparse(messageObject)) {
         sensorNameObj = tryJSONparse(messageObject);
         if (sensorNameObj?.data) {
            const MQ = await getMQ(req.params.sensorName).then(function (MQ) {
               return MQ;
            });
            if (MQ == null) {
               res.status(200).send("Unregistered sensor.");
            } else {
               console.log("mq: ", MQ); // ["kafka","mqtt"]
               res.status(200).send("ok");
               for (let index of JSON.parse(MQ)) {
                  switch (index) {
                     case "kafka":
                        console.log("send to kafka ", sensorNameObj.data);
                        break;
                     case "mqtt":
                        console.log("send to mqtt ", sensorNameObj.data);
                        break;
                  }
               }
            }
         } else {
            res.status(500).send("please check mandatory field");
         }
      } else {
         res.status(500).send("is not a json structure");
      }
   });
});
//get hash table fliel value
function getMQ(sensorName) {
   return new Promise((resolve) => {
      client.hget("SensorGroup", sensorName, function (err, value) {
         resolve(value);
      });
   });
}

/*
 * sensor Data delete
 */
app.delete("/DigitalConnector/SensorGroup/:sensorName", async (req, res) => {
   if (!req.params?.sensorName) {
      res.status(500).send("please check sensorName parameter");
   } else {
      client.HDEL("SensorGroup", req.params.sensorName, redis.print);
   }

   res.send({ success: 1 });
});

/*
 * sensor Data Retrieve
 */
app.get("/DigitalConnector/SensorGroup/:sensorName", async (req, res) => {
   if (!req.params?.sensorName) {
      res.status(500).send("please check sensorName parameter");
   } else {
      const MQ = await getMQ(req.params.sensorName).then(function (MQ) {
         return MQ;
      });
      if (MQ == null) {
         res.status(200).send("Unregistered sensor.");
      } else {
         console.log("mq: ", MQ); // ["kafka","mqtt"]
         res.status(200).send({
            name: req.params.sensorName,
            mq: JSON.parse(MQ),
         });
      }
   }
});
