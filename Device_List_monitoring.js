const express = require("express");
const app = express();
const fs = require("fs");
const Influx = require("influx");
const influx = new Influx.InfluxDB(
   `http://admin:password@192.168.172.73:8086/SmartPortData2`
);
app.listen(1209, () => {
   console.log("API-Server Start on port 1209");
});
var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("UTC");
const schedule = require("node-schedule");
//GETDeviceNum();

schedule.scheduleJob("* * 0 * * *", function () {
   GETDeviceNum();
});

// repeater = setInterval(GETDeviceNum, 5000);

const Beatperiod = 86400000; //24h
var DeviceNum = 0,
   newDeviceCount = 0;
var titles = ["Date"],
   Devices = [],
   createDate;

async function GETDeviceNum() {
   sql = "show measurements";
   return await influx
      .query(sql)
      .then((result) => {
         if (result[0]) {
            for (idx in result) {
               for (key in result[idx]) {
                  if (key == "name") {
                     newDeviceCount++;
                     titles.push(result[idx][key]);
                     Devices.push(result[idx][key]);
                  }
               }
            }
         }

         if (DeviceNum == newDeviceCount) {
            writeCSVfile(
               Devices,
               `${createDate}_KETI_Count_${newDeviceCount}.csv`
            );
         } else {
            DeviceNum = newDeviceCount;
            createDate = getToday();
            const title_string = makeTitle(titles);
            fs.writeFileSync(
               `${createDate}_KETI_Count_${newDeviceCount}.csv`,
               title_string
            );
            writeCSVfile(
               Devices,
               `${createDate}_KETI_Count_${newDeviceCount}.csv`
            );
         }

         (newDeviceCount = 0), (titles = ["Date"]), (Devices = []);
      })
      .catch((err) => {
         console.log("Error", err);
      });
}

function getToday() {
   var today = new Date();

   var year = today.getFullYear();
   var month = ("0" + (today.getMonth() + 1)).slice(-2);
   var day = ("0" + today.getDate()).slice(-2);

   var dateString = year + "-" + month + "-" + day;

   return dateString;
}

function makeTitle(titles) {
   let title_string = "";

   titles.forEach((title, index) => {
      title_string +=
         index !== titles.length - 1 ? `${title},` : `${title}\r\n`;
   });
   console.log(getToday(), title_string);
   return title_string;
}

var csv_string = `${getToday()}`;
function writeCSVfile(Devices, csvFileName) {
   getInfoOfDevices(Devices).then((values) => {
      for (idx in values) {
         for (key in values[idx]) {
            // console.log(key, "values", values[idx][key]); //data NUM
            csv_string += `,${values[idx][key]}`;
         }
      }
      console.log("csv_string", csv_string);

      fs.appendFile(csvFileName, `${csv_string}\n`, function (err) {
         if (err) console.log(err);
      });
   });
   csv_string = `${getToday()}`;
}

const getInfoOfDevices = (ids) => {
   const result = Promise.all(
      ids.map((name) => {
         return GETdataCount(name).then((res) => res);
      })
   );
   return result;
};

async function GETdataCount(deviceID) {
   var startdatetime = moment(getToday()) / 0.000001;
   var enddatetime = startdatetime + 86399999999000;
   sql = `select count(*) from ${deviceID} where time >= ${startdatetime} and time <= ${enddatetime}`;
   return await influx
      .query(sql)
      .then((result) => {
         if (result[0]) {
            dailyDeviceDataCount = result[0].count_container;
            return { [deviceID]: dailyDeviceDataCount };
         } else {
            return { [deviceID]: 0 };
         }
      })
      .catch((err) => {
         console.log("Error", err);
      });
}
