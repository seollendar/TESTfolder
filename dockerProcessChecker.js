const unirest = require("unirest");
const express = require("express");
const util = require("util");
const fs = require("fs");
const exec = util.promisify(require("child_process").exec);
const app = express();
app.listen(1203, () => {
   console.log("API-Server Start on port 1203");
});

const receiverIP = "192.168.172.67",
   preprocessorIP = "192.168.172.68",
   kafkaIP = "192.168.172.70",
   classifierIP = "192.168.172.71",
   APIserverIP = "192.168.172.72",
   InfluxIP = "192.168.172.73",
   postgresIP = "192.168.172.74";

var receiver = "OK",
   kafka = "OK",
   classifier = "OK",
   preprocessor = "OK",
   influx = "OK",
   postgres = "OK",
   APIserver = "OK";

const Beatperiod = 86400000; //24h
function getResponse(ipAdress, targetIPname) {
   var req = unirest("POST", `http://${ipAdress}:1203/ps`)
      .headers({
         Accept: "application/json",
         "Content-Type": "application/json;ty=4",
         "X-M2M-RI": "1234",
      })
      .send("")
      .end(function (res) {
         console.log(targetIPname, res); // OK || Error

         if (res.error) {
            //throw new Error(res.error);
            console.log(res.error);
         }
         return res;
      });
}
receiver = setInterval(getResponse, Beatperiod, receiverIP, "receiver");
preprocessor = setInterval(
   getResponse,
   Beatperiod,
   preprocessorIP,
   "preprocessor"
);
kafka = setInterval(getResponse, Beatperiod, kafkaIP, "kafka");
classifier = setInterval(getResponse, Beatperiod, classifierIP, "classifier");
APIserver = setInterval(getResponse, Beatperiod, APIserverIP, "APIserver");
influx = setInterval(getResponse, Beatperiod, InfluxIP, "Influx");
postgres = setInterval(getResponse, Beatperiod, postgresIP, "postgres");

var dateTime = Date.now();
const json_data = [
   {
      dateTime,
      receiver,
      kafka,
      classifier,
      preprocessor,
      influx,
      postgres,
      APIserver,
   },
];

const csv_string = jsonToCSV(json_data);
fs.appendFile("json2csv.csv", csv_string, function (err) {
   if (err) console.log(err);
});

function jsonToCSV(json_data) {
   const json_array = json_data;
   let csv_string = "";

   json_array.forEach((content, index) => {
      let row = ""; // 각 인덱스에 해당하는 '내용'을 담을 행
      for (let title in content) {
         // for in 문은 객체의 키값만 추출하여 순회함.
         // 행에 '내용' 할당: 각 내용 앞에 컴마를 삽입하여 구분, 첫번째 내용은 앞에 컴마X
         row += row === "" ? `${content[title]}` : `,${content[title]}`;
         console.log(row);
      } // CSV 문자열에 '내용' 행 삽입: 뒤에 줄바꿈(\r\n) 추가, 마지막 행은 줄바꿈X
      csv_string += index !== json_array.length - 1 ? `${row}\r\n` : `${row}`;
      //console.log(csv_string);
   });
   // 6. CSV 문자열 반환: 최종 결과물(string)
   return csv_string;
}

//The 404 Route (ALWAYS Keep this as the last route)

app.get("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});

app.post("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});
