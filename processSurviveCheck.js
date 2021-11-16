const express = require("express");
const app = express();
app.listen(2021, () => {
   console.log("Server Start");
});
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const Influx = require("influx");

const influx = new Influx.InfluxDB(
   `http://admin:password@192.168.172.73:8086/monit`
   //`http://admin:password@localhost:8086/SmartPortData`
);

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

function GETps_ef(processName) {
   var cmd = `ps -ef | grep ${processName}`;
   exec(cmd, function (err, res) {
      if (err) {
         console.log("err: ", err);
         return;
      }
      console.log("res:", res);

      let pos = 0,
         foundCount = 0;
      while (true) {
         let foundPos = res.indexOf(processName, pos);
         if (foundPos == -1) break;
         //console.log("found: ", foundPos );
         pos = foundPos + 1;

         foundCount++;
         //console.log("foundC", foundCount);
      }

      if (foundCount >= 2) {
         //Running
         SetInfluxData(processName);
      } else {
         //Not running
         console.log("");
      }
   });
}

Check = setInterval(GETps_ef, 3600000, "processName"); //1h

/*
Check = setInterval(GETps_ef, 2000, "receiver"); //24H
Check = setInterval(GETps_ef, 2000, "kafka"); //24H
Check = setInterval(GETps_ef, 2000, "classifier"); //24H
Check = setInterval(GETps_ef, 2000, "preprocessor"); //24H
Check = setInterval(GETps_ef, 2000, "influx"); //24H
Check = setInterval(GETps_ef, 2000, "postgres"); //24H
Check = setInterval(GETps_ef, 2000, "APIserver"); //24H
*/
