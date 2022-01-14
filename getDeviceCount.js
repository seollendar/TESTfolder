const express = require("express");
const app = express();
const fs = require("fs");
const util = require("util");
const Influx = require("influx");
const influx = new Influx.InfluxDB(
   `http://admin:password@localhost:8086/SmartPortData`
);
app.listen(1209, () => {
   console.log("API-Server Start on port 1209");
});
var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("UTC");
const schedule = require("node-schedule");

//schedule.scheduleJob("0 59 23 * * *", function(){
//      GETDeviceNum();
//});

var DeviceNum = 0,
   newDeviceCount = 0;
var titles = ["Date"],
   Devices = [],
   createDate;

isObject = (obj) => {
   return (
      obj?.constructor === {}.constructor ||
      obj?.constructor.toString().includes("TextRow")
   );
};

async function iQuery(sql) {
   const result = await influx
      .query(sql)
      .then((data) => data.filter((index) => isObject(index)));

   return result;
}

async function getAllAEContainer() {
   const sql = "show series";
   const result = await iQuery(sql);

   const processed = result.map((index) => {
      let [ae, container] = index.key.split(",");
      container = container.replace("container=", "");
      Devices.push({ ae, container });
      return { ae, container };
   });

   return processed;
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

async function GETdataCount(deviceID, container) {
   //container 추가 필요
   var startdatetime = moment(getToday()) / 0.000001;
   var enddatetime = startdatetime + 86399999999000;
   sql = `select count(*) from ${deviceID}  where "container"='${container}' and time >= ${startdatetime} and time <= ${enddatetime}`;
   const [result] = await iQuery(sql);
   console.log("res: ", result);
   return result;
}

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

var csv_string = `${getToday()}`;
async function main() {
   // 1. influxdb에서 모든 ae와 container 세트를 가져온다.
   const aeContainerList = await getAllAEContainer();
   const newDeviceCount = aeContainerList.length; //총 디바이스 개수
   for (let index of aeContainerList) {
      console.log({ ae: index.ae, container: index.container });
      const row = await GETdataCount(index.ae, index.container); //디바이스 데이터 개수 가져와서 csv_string에 추가
      csv_string += `,${row}`;
      console.log("csv_string", util.inspect(csv_string, false, null, true));
   }

   if (DeviceNum == newDeviceCount) {
      //writeCSVfile(Devices, `${createDate}_KETI_Count_${newDeviceCount}.csv`);
      fs.appendFile(
         `${createDate}_KETI_Count_${newDeviceCount}.csv`,
         `${csv_string}\n`,
         function (err) {
            if (err) console.log(err);
         }
      );
      csv_string = `${getToday()}`;
   } else {
      DeviceNum = newDeviceCount;
      createDate = getToday();
      const title_string = makeTitle(Devices);
      fs.writeFileSync(
         `${createDate}_KETI_Count_${newDeviceCount}.csv`,
         title_string
      );
      //writeCSVfile(Devices, `${createDate}_KETI_Count_${newDeviceCount}.csv`);
      fs.appendFile(
         `${createDate}_KETI_Count_${newDeviceCount}.csv`,
         `${csv_string}\n`,
         function (err) {
            if (err) console.log(err);
         }
      );
      csv_string = `${getToday()}`;
   }

   (newDeviceCount = 0), (titles = ["Date"]), (Devices = []);
}

main();
