const express = require("express");
const app = express();
const fs = require("fs");
const Influx = require("influx");
const influx = new Influx.InfluxDB(
   //`http://admin:password@192.168.172.73:8086/SmartPortData`
   `http://admin:password@localhost:8086/SmartPortData`
);
app.listen(1203, () => {
   console.log("API-Server Start on port 1203");
});

GETDeviceNum();

const Beatperiod = 86400000; //24h
const DeviceNum = 0,
   count = 0;
const titles = ["Date"],
   Devices = [];

async function GETDeviceNum() {
   sql = "show measurements";
   console.log(sql);
   return await influx
      .query(sql)
      .then((result) => {
         if (result[0]) {
            //console.log("res: ", result);
            for (idx in result) {
               for (key in result[idx]) {
                  if (key == "name") {
                     count++;
                     console.log("res", result[idx][key]);
                     titles.push(result[idx][key]);
                     Devices.push(result[idx][key]);
                  }
               }
            }
         }
         console.log("count", count);
         if (DeviceNum == count) {
            //존재하는 파일에 업데이트
         } else {
            //디바이스 수를 업데이트하여 새로운 파일 생성
            DeviceNum = count;
            const title_string = makeTitle(titles);
            console.log(title_string);
            fs.writeFileSync(`KETI_Count_${count}.csv`, title_string);
         }
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

   return title_string;
}

function writeCSVfile() {
   var count = 0;
   var csv_string;
   getInfoOfDevices(Devices).then((values) => {
      //console.log("Containers", values);
      for (idx in values) {
         for (key in values[idx]) {
            console.log(values[idx][key]); //data NUM
         }
      }
      //////////////////////////////////////////// values 값 봐서 수정하기
      csv_string = `${getToday()},${values[0].receiver},${values[1].kafka},${
         values[2].classifier
      },${values[3].preprocessor},${values[4].influx},${values[5].postGIS},${
         values[6].APIserver
      },${count}\r\n`;

      fs.appendFile(`containerMonitoring.csv`, csv_string, function (err) {
         console.log(csv_string);
         if (err) console.log(err);
      });
   });
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
   var startdatetime = Date.now() / 0.000001;
   var enddatetime = startdatetime + 86399999999000;
   console.log(startdatetime, enddatetime);
   sql = `select count(*) from ${deviceID} where time >= ${startdatetime} and time <= ${enddatetime}`;
   console.log(sql);
   return await influx
      .query(sql)
      .then((result) => {
         if (result[0]) {
            //console.log(result[0]);
            dailyDeviceDataCount = result[0].count;
            return dailyDeviceDataCount;
         }
      })
      .catch((err) => {
         console.log("Error", err);
      });
}
