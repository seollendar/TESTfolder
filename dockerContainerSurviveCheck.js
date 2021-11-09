const express = require("express");
const app = express();
app.listen(1005, () => {
   console.log("API-Server Start on port 1005");
});

const Influx = require("influx");
const influx = new Influx.InfluxDB(
   //`http://admin:password@192.168.172.73:8086/SmartPortData`
   `http://admin:password@localhost:8086/SmartPortData`
);
var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("UTC");

function SetInfluxData(containerName) {
   influx
      .writePoints(
         [
            {
               measurement: containerName,
               tags: { tag: "check" },
               fields: { heartBeat: 1 },
               timestamp: Date.now(),
            },
         ],
         {
            precision: "ms",
         }
      )
      .then((result) => {
         //console.log("write success");
      })
      .catch((e) => {
         console.log("write err: ", e.stack);
      });
}

// Check = setInterval(SetInfluxData, 86400000, "containerName"); //24H
Check = setInterval(SetInfluxData, 2000, "receiver"); //24H
Check = setInterval(SetInfluxData, 2000, "kafka"); //24H
Check = setInterval(SetInfluxData, 2000, "classifier"); //24H
Check = setInterval(SetInfluxData, 2000, "preprocessor"); //24H
Check = setInterval(SetInfluxData, 2000, "influx"); //24H
Check = setInterval(SetInfluxData, 2000, "postGIS"); //24H
Check = setInterval(SetInfluxData, 2000, "APIserver"); //24H
Check = setInterval(SetInfluxData, 2000, "test");
Check = setInterval(SetInfluxData, 2000, "test6");
