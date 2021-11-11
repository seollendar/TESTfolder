/*
post req: curl -d '{"url": ["http://192.168.172.67:7980/noti_for_fastdata"]}' -H "Content-Type: application/json" -X POST http://192.168.172.66:10003/api/v1/service/CB00003/noti
get req: curl -H "Content-Type: application/json" -X GET http://192.168.172.66:10003/api/v1/service/CB00003/noti
res: {"url":["http://192.168.172.67:7980/noti_for_fastdata"],"createDate":"20211108153129","updateDate":"20211108153129"}
*/
const util = require("util");
const exec = util.promisify(require("child_process").exec);

var Beatperiod = 86400000;
var interval;
const subURL = `http://192.168.172.67:7980/noti_for_fastdata`;

interval = setInterval(GETnoti, Beatperiod);

function GETnoti() {
   var cmd = `curl -H "Content-Type: application/json" -X GET http://192.168.172.66:10003/api/v1/service/CB00003/noti`;
   exec(cmd, options, function (err, res) {
      if (err) {
         console.log("err: ", err);
         return;
      }
      console.log("res:", res);

      if (res) {
         resSplit = res.split(`"`);
         if (resSplit[3] == subURL) {
            console.log(resSplit[3]);
         } else {
            POSTnoti();
         }
      } else {
         POSTnoti();
      }
   });
}

/**
 *
res: {"url":["http://192.168.172.67:7980/noti_for_fastdata"],"createDate":"20211108153129","updateDate":"20211108153129"}
resSplit [ '{',
  'url',
  ':[',
  'http://192.168.172.67:7980/noti_for_fastdata',
  '],',
  'createDate',
  ':',
  '20211108153129',
  ',',
  'updateDate',
  ':',
  '20211108153129',
  '}' ]
http://192.168.172.67:7980/noti_for_fastdata

 *
 */

function POSTnoti() {
   var cmd = `curl -d '{"url": ["http://192.168.172.67:7980/noti_for_fastdata"]}' -H "Content-Type: application/json" -X POST http://192.168.172.66:10003/api/v1/service/CB00003/noti`;
   console.log("POST ", cmd);
   exec(cmd, options, function (err, stdout) {
      if (err) {
         console.log("err: ", err);
         return;
      }
      console.log("res:", stdout);
   });
}
