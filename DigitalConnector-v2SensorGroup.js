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
let sensorNameList = [];
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
            let hasSensorName = sensorNameList.some(
               (sensor) => sensor === sensorNameObj.name
            );
            if (hasSensorName) {
               res.status(500).send("sensor is already exist");
            } else {
               const sensorName = sensorNameObj.name;
               console.log("name: ", sensorName);
               client.rpush("SensorGroup", sensorName);
               sensorNameList.push(sensorNameObj.name);
               const sensorFields = Object.keys(sensorNameObj);
               for (var i = 0; i < sensorFields.length; i++) {
                  const field = sensorFields[i];
                  if (sensorFields[i] != "name") {
                     client.hset(
                        sensorNameObj.name,
                        sensorFields[i],
                        JSON.stringify(sensorNameObj[field])
                     );
                  }
               }

               res.status(200).send("create sensorGroup");
            }
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
   client.lrange("SensorGroup", 0, -1, function (err, keys) {
      if (err) throw err;
      // const SensorList = keys.map((v) => {
      //    return JSON.parse(v);
      // });
      res.send({ SensorList: keys });
   });
});

/*
 * sensorGroup delete
 */
app.delete("/DigitalConnector/SensorGroup", async (req, res) => {
   const resLength = await getListLength_delete().then(function (resLength) {
      return resLength;
   });

   client.DEL("SensorGroup");
   sensorNameList = [];
   res.send({ deleted: resLength });
});
//get hash table flield count
function getListLength_delete() {
   return new Promise((resolve) => {
      client.lrange("SensorGroup", 0, -1, function (err, keys) {
         if (err) throw err;
         keys.forEach((key) => {
            console.log(key, "delete");
            client.DEL(key);
         });

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
            const MQ = await getMessageQueList(req.params.sensorName).then(
               function (MQ) {
                  return MQ;
               }
            );
            if (MQ == null) {
               res.status(200).send("Unregistered sensor.");
            } else {
               //console.log("mq: ", MQ); // ["kafka","mqtt"]
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
function getMessageQueList(sensorName) {
   return new Promise((resolve) => {
      client.hget(sensorName, "mq", function (err, value) {
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
      let hasSensorName = sensorNameList.some(
         (sensor) => sensor === req.params.sensorName
      );
      if (!hasSensorName) {
         res.send("Unregistered sensor.");
      } else {
         client.DEL(req.params.sensorName, redis.print);
         client.lrem("SensorGroup", -1, req.params.sensorName);
         for (let sI = 0; sI < sensorNameList.length; sI++) {
            if (sensorNameList[sI] == req.params.sensorName) {
               sensorNameList.splice(sI, 1);
               sI--;
            }
         }
         res.send({ success: 1 });
      }
   }
});

/*
 * sensor Data Retrieve
 */
app.get("/DigitalConnector/SensorGroup/:sensorName", async (req, res) => {
   if (!req.params?.sensorName) {
      res.status(500).send("please check sensorName parameter");
   } else {
      let resObject = { name: req.params.sensorName };
      const keys = await getKeys(req.params.sensorName).then(function (keys) {
         return keys;
      });
      if (keys.length == 0) {
         res.status(200).send("Unregistered sensor.");
      } else {
         for (let key of keys) {
            const value = await getValue(req.params.sensorName, key);
            resObject[key] = value;
         }
         res.status(200).send(resObject);
      }
   }
});

//get hash table fliel value
function getKeys(sensorName) {
   return new Promise((resolve) => {
      client.hkeys(sensorName, function (err, keys) {
         resolve(keys);
      });
   });
}

//get hash table fliel value
function getValue(sensorName, key) {
   return new Promise((resolve, reject) => {
      client.hget(sensorName, key, function (err, value) {
         if (err) reject(err);
         resolve(JSON.parse(value));
      });
   });
}
