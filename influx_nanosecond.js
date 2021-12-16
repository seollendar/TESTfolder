var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("UTC");

//var startdatetime = moment(getToday()) / 0.000001;
var startdatetime = moment("2021-12-09") / 0.000001;
var enddatetime = startdatetime + 86399999999000;
sql = `select count(*) from S01220882455 where time >= ${startdatetime} and time <= ${enddatetime}`;
console.log(sql);

function getToday() {
   var today = new Date();

   var year = today.getFullYear();
   var month = ("0" + (today.getMonth() + 1)).slice(-2);
   var day = ("0" + today.getDate()).slice(-2);

   var dateString = year + "-" + month + "-" + day;
   console.log(dateString);
   return dateString;
}

//select count(*) from '' where time >= 1639008000000000000 and time <= 1639094399999999000
