const express = require("express");
const app = express();
const util = require("util");
const where = require("lodash.where");
var moment = require("moment-timezone");
moment.tz.setDefault("UTC");
const mqtt = require("mqtt");

const port = 1203;
app.listen(port, () => {
   console.log(`Server Start on http://localhost:${port}`);
});

/** kafka **/
const kafka = require("kafka-node");
var HighLevelProducer = kafka.HighLevelProducer,
   client = new kafka.KafkaClient({
      kafkaHost: "10.252.73.37:9092, 10.252.73.42:9092, 10.252.73.43:9092",
   }),
   producer = new HighLevelProducer(client, {
      partitionerType: 3,
   });
producer.on("ready", function () {
   console.log("Producer is on ready");
});
producer.on("error", function (err) {
   console.log("error", err);
});

/** MQTT **/
var client = mqtt.connect("mqtt://127.0.0.1:1883");
// var options = { retain:true, qos:1 };
client.on("connect", function () {
   console.log("connected!", client.connected);
});
client.on("error", (error) => {
   console.log("Can't connect" + error);
   process.exit(1);
});
client.on("message", (topic, message, packet) => {
   console.log("topic: " + topic + ", message: " + message);
});

/*
 * MQTT-subscribe
client.subscribe("dp_sensor_data", function (err) {
    if (err) {
        console.log("dp_sensor subscribe err!", err);
    }
});
 */

/* sensorNameList = [sensor1, sensor2...]
 * sensorDOpair = {sensor1:DO1, sensor2:DO1} => sensor data come in! => kafka(Topic: DOName, key: sensorName, value: sensorData)
 * "DO object" received from DigitalBrain
 */
let sensorDOpair = {};
app.post("/DigitalConnector/DO", function (req, res) {
   let fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let DOWholeData;
      DOWholeData = JSON.parse(fullBody);
      DOName = DOWholeData.name;
      SensorList = DOWholeData.sensor;
      SensorList.forEach((index, i) => {
         if (sensorNameList.includes(index.name)) {
            sensorDOpair[index.name] = DOName;
            console.log("sensorDOpair", sensorDOpair);
         }
      });
   });
   res.end();
});

/*
 * sensor Creation
 */
let sensorNameList = [];
app.post("/DigitalConnector/sensor", function (req, res) {
   let fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let sensorNameObj;
      sensorNameObj = JSON.parse(fullBody);
      sensorName = sensorNameObj.name;

      let hasSensorName = sensorNameList.some(
         (sensor) => sensor === sensorName
      );
      if (hasSensorName) {
         res.status(500).send("sensor is already exist");
      } else {
         res.status(200).send("Received sensor Data");
         sensorNameList.push(sensorName);
         console.log(
            "sensor List: ",
            util.inspect(sensorNameList, false, null, true)
         );
      }
   });
});

/*
 * sensor Retrieve
 */
app.get("/DigitalConnector/sensor", (req, res) => {
   res.send(sensorNameList);
});

/*
 * sensor delete
 */
app.delete("/DigitalConnector/:sensorName", (req, res) => {
   let sensorName = req.params.sensorName;
   res.status(200).send("ok");
   sensorNameList.forEach((element, index) => {
      if (element == sensorName) {
         sensorNameList.splice(index, 1);
      }
   });
});

/*
 * sensor Data Creation
 */
app.post("/DigitalConnector/sensorData", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      var sensorDataObj;
      sensorDataObj = JSON.parse(fullBody);
      //console.log("sensorDataObj: ", sensorDataObj);
      let hasSensorName = sensorNameList.some(
         (sensor) => sensor === sensorDataObj.name
      );
      if (hasSensorName) {
         res.send("received sensor data");
         let DataToString = JSON.stringify(sensorDataObj.data);
         dataTimeSet = Date.now() + ", " + DataToString;
         sensorDataObj.data = dataTimeSet;
         let SensorDataToString = JSON.stringify(sensorDataObj);
         console.log("sensorDataObj: ", sensorDataObj);
         client.publish("dp_sensor_data", SensorDataToString);
      } else {
         res.status(404).send("sensor does not exist");
      }
   });
});

/*
 * physical sensor Data Creation
 */
app.post("/DigitalConnector/sensor/:sensorName", function (req, res) {
   var fullBody = "";
   const { sensorName } = req.params;
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      var DataObj;
      DataObj = JSON.parse(fullBody);
      //console.log("DataObj: ", DataObj);

      if (sensorDOpair[sensorName]) {
         let payload = [
            {
               topic: sensorDOpair[sensorName],
               key: sensorName,
               value: fullBody,
            },
         ];
         console.log(payload);
         producer.send(payload, function (err, data) {
            if (!err) console.log(data);
            // if (err) console.log(err);
            // else console.log(data);
         });
      } else {
         console.log(sensorDOpair[sensorName]);
         return;
      }
   });

   res.end();
});

//The 404 Route (ALWAYS Keep this as the last route)
app.delete("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});

app.get("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});

app.post("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});
