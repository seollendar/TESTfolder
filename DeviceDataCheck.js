// const express = require("express");
// const app = express();
// app.listen(1224, () => {
//    console.log("server start");
// });

const Influx = require("influx");
const influx = new Influx.InfluxDB(
   `http://admin:password@192.168.172.73:8086/SmartPortData2`
);
const util = require("util");
const exec = util.promisify(require("child_process").exec);
var Devices = [];
const Device = "S01228451616";
const container = "location_power";
const command_cin = `curl -H "Content-Type: application/json" -X GET http://192.168.172.66:10003/api/v1/device/cin/CB00003/${Device}/${container}`;
//const command_device = `curl -H "Content-Type: application/json" -X GET http://192.168.172.66:10003/api/v1/device/CB00003?p=${page}`;
const tmpDeviceArr = [
   "S01228454081",
   "S01228451409",
   "S01228451125",
   "S01228446321",
   "S01228451550",
   "S01228451331",
   "S01228426606",
   "S01228451411",
   "S01228451523",
   "S01228427466",
   "S01228457025",
   "S01228456966",
   "S01228457154",
   "S01228457095",
   "S01228456010",
   "S01228456185",
   "S01228456307",
];
async function DeviceCRUL() {
   for (var page = 1; page < 21; page++) {
      const command_device = `curl -H "Content-Type: application/json" -X GET http://192.168.172.66:10003/api/v1/device/CB00003?p=${page}`;
      var { stdout, stderr } = await exec(command_device);
      var resData = JSON.parse(stdout);
      var checkArr = resData.list;
      checkArr.forEach((element) => {
         Devices.push(element.deviceID);
      });
      console.log(Devices);
      console.log(Devices.length);
   }
}
DeviceCRUL();

async function containerCRUL() {
   var { stdout, stderr } = await exec(command);
   var resData = JSON.parse(stdout);
   var checkArr = resData.list;
   var dateCount = checkArr.length;
   console.log(checkArr.length);
   let CheckList = await checkArr.map((v) => {
      let contents = JSON.parse(v.content);
      console.log(contents.time);
      // var date = new Date(contents.time);
      // var milliseconds = date.getTime();
      // return milliseconds;
      return contents.time;
   });
   console.log(CheckList);
   getInfluxTime(dateCount);
}
//containerCRUL();

async function cinCRUL() {
   var { stdout, stderr } = await exec(command_cin);
   var resData = JSON.parse(stdout);
   var checkArr = resData.list;
   var dateCount = checkArr.length;
   console.log(checkArr.length);
   let CheckList = await checkArr.map((v) => {
      let contents = JSON.parse(v.content);
      console.log(contents.time);
      // var date = new Date(contents.time);
      // var milliseconds = date.getTime();
      // return milliseconds;
      return contents.time;
   });
   console.log(CheckList);
   getInfluxTime(dateCount);
}
//cinCRUL();

function getInfluxTime(dateCount) {
   var startdatetime = moment(moment(new Date()).format("YYYYMMDD")) / 0.000001;
   //var startdatetime = moment(moment('20211229')) / 0.000001;
   var enddatetime = startdatetime + 86399999999000;
   //var sql = `select * from S01228451616 where "container" = 'location_power' and time >= 1640703600000000000 and time <= 1640789999999999000 order by desc`

   var sql = `select * from ${Device} where "container" = '${container}' order by desc limit ${dateCount}`;
   console.log(sql);
   influx
      .query(sql)
      .then((result) => {
         if (result[0]) {
            for (var index = 0; index < result.length; index++) {
               var savedTime = result[index].time._nanoISO;
               console.log(savedTime.split("Z")[0]);
            }
         } else {
            //if no response
            console.log("{ no response }");
         }
      })
      .catch((err) => {
         console.log("Error", err);
      });
}
