const express = require("express");
const app = express();
const redis = require("redis");
const Rclient = redis.createClient();

Rclient.on("error", function (error) {
   console.error(error);
});

const port = 1005;
app.listen(port, () => console.log(`server listening at port:${port}`));

let key = "DO0";
let value = [
   {
      name: "DO1",
      sensor: [
         {
            name: "PO1.boom_angle",
         },
         {
            name: "PO1.crane_rotation",
         },
         {
            name: "Cam",
         },
      ],
      control: [
         {
            name: "crane_control",
            data: [
               "1627475400001, 320, -, -",
               "1627475400002, 320, received",
               "1627475400003, 320, received, done",
               "1627475400004, 320, received, done",
               "1627475400005, 320, received, done",
            ],
         },
         {
            name: "crane_angle",
            data: [
               "1627475400001, 22, -, -",
               "1627475400002, 23, received, done",
               "1627475400003, 34, received, done",
               "1627475400004, 32, received, done",
               "1627475400005, 15, received, done",
            ],
         },
      ],
      simulation: [
         {
            name: "pos_3sec_later",
         },
         {
            name: "pos_5sec_later",
         },
      ],
   },
   {
      name: "DO2",
      sensor: [
         {
            name: "PO1.boom_angle",
         },
         {
            name: "PO1.crane_rotation",
         },
         {
            name: "Cam",
         },
      ],
      control: [
         {
            name: "crane_control",
            data: [
               "1627475400001, 320, -, -",
               "1627475400002, 320, received",
               "1627475400003, 320, received, done",
               "1627475400004, 320, received, done",
               "1627475400005, 320, received, done",
            ],
         },
         {
            name: "crane_angle",
            data: [
               "1627475400001, 22, -, -",
               "1627475400002, 23, received, done",
               "1627475400003, 34, received, done",
               "1627475400004, 32, received, done",
               "1627475400005, 15, received, done",
            ],
         },
      ],
      simulation: [
         {
            name: "pos_3sec_later",
         },
         {
            name: "pos_5sec_later",
         },
      ],
   },
];
// var getP = Rclient.get(key);
// console.log("getPid", getP);
// if (!getP) {

// Rclient.set(key, JSON.stringify(value), redis.print);

Rclient.get("DO5", function (err, data) {
   if (err) throw err;
   console.log("get \n", data);
   console.log("get JSON: \n", JSON.parse(data));
   DOWholeDataList = JSON.parse(data);
   console.log("after: ", DOWholeDataList);
});

setInterval(setDO, 3000);
setInterval(getDO, 5000);

function setDO() {
   Rclient.set("DO5", JSON.stringify(value), redis.print);
}

function getDO() {
   Rclient.get("DO5", function (err, data) {
      if (err) throw err;
      //console.log("get \n", data);
      console.log("get JSON: \n", JSON.parse(data));
      DOWholeDataList = JSON.parse(data);
      console.log("after: ", DOWholeDataList);
   });
}

// client.lpush(key1, value1, redis.print); // 리스트에 값 추가
// client.lpush("tasks", "Redis", redis.print);
// client.lrange("tasks", 0, -1, function (err, items) {
//    // 시작, 종료인자 이용해 리스트 항목 가져오기
//    // -1는 리스트의 마지막 항목 의미, 즉 다 가져오기
//    if (err) throw err;
//    items.forEach(function (item, i) {
//       console.log("list " + i + " : " + item);
//    });
// });

// const key_DO = "DO3";
// Rclient.get(key_DO, function (err, data) {
//    if (err) console.log(err);
//    // console.log()
//    console.log("get DOWholeDataList: \n", JSON.parse(data));
//    DOWholeDataList = JSON.parse(data);
//    console.log("before: ", DOWholeDataList);
// });
var DOWholeDataList = [];
// let DOWholeDataList = [];
