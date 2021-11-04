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

const Beatperiod = 86400000; //24h

async function GETbeat(container) {
   var dailyResult = {};
   sql = `SELECT * FROM ${container} order by desc limit 1`;
   // console.log(sql);
   return await influx
      .query(sql)
      .then((result) => {
         if (result[0]) {
            //console.log(result[0]);
            dailyTime = result[0].time._nanoISO; //YYYY-MM-DD
            date = dailyTime.toString().split("T")[0];
            //console.log(dailyTime.toString().split("T")[0], getToday());
            if (dailyTime.toString().split("T")[0] == getToday()) {
               dailyResult[container] = "OK";
               return dailyResult;
            } else {
               dailyResult[container] = "Error";
               return dailyResult;
            }
         }
      })
      .catch((err) => {
         console.log("Error", err);
      });
}

const getInfoOfContainers = (ids) => {
   const result = Promise.all(
      ids.map((name) => {
         return GETbeat(name).then((res) => res);
      })
   );
   return result;
};

function writeCSVfile() {
   var count = 0;
   var csv_string;
   getInfoOfContainers([
      "receiver",
      "kafka",
      "classifier",
      "preprocessor",
      "influx",
      "postGIS",
      "APIserver",
   ]).then((values) => {
      //console.log("Containers", values);
      for (idx in values) {
         for (key in values[idx]) {
            //console.log(values[idx][key]);
            if (values[idx][key] == "Error") {
               count++;
            }
         }
      }
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

// receiver = setInterval(writeCSVfile, 10000);

function getToday() {
   var today = new Date();

   var year = today.getFullYear();
   var month = ("0" + (today.getMonth() + 1)).slice(-2);
   var day = ("0" + today.getDate()).slice(-2);

   var dateString = year + "-" + month + "-" + day;

   return dateString;
}

function jsonToCSV(titles) {
   let title_string = "";

   titles.forEach((title, index) => {
      title_string +=
         index !== titles.length - 1 ? `${title},` : `${title}\r\n`;
   });

   return title_string;
}

const titles = [
   "Date",
   "receiver",
   "kafka",
   "classifier",
   "preprocessor",
   "influx",
   "postGIS",
   "APIserver",
   "Error",
];
const title_string = jsonToCSV(titles);
console.log(title_string);

//fs.writeFileSync(`containerMonitoring.csv`, title_string);

fs.exists("./containerMonitoring.csv", (e) => {
   console.log("exist?", e);
   if (e) {
      receiver = setInterval(writeCSVfile, Beatperiod);
   } else {
      fs.writeFileSync(`containerMonitoring.csv`, title_string);
      receiver = setInterval(writeCSVfile, Beatperiod);
   }
});
