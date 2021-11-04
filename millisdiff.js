
const moment = require('moment');
/*
//moment(2020-07-15 13:00:00).format("YYYY-MM-DD HH:mm:ss.sss");

start_date = moment(2020/07/15 13:00:00).format("YYYY-MM-DD HH:mm:ss");
end_date = moment(2020/07/15 12:00:00).format("YYYY-MM-DD HH:mm:ss");
var millisDiff = end_date -  start_date;
console.log(millisDiff / 1000);


var startDate = new Date(2020-07-15T05:00:00.000Z);
var endDate  = new Date(2020-07-15T04:00:00.000Z);

var tmp = (endDate.getTime() - startDate.getTime()) / 60000;
console.log(tmp)

var now  = "2020-07-15 13:00:00";
var then = "2020-07-15 12:00:00";

var tmp = (moment(now,"DD-MM-YYYY HH:mm:ss").diff(moment(then,"DD-MM-YYYY HH:mm:ss")))/1000
console.log(tmp)



var pnow  = 2020-07-15 15:00:00
var pthen = 2020-07-15 13:00:00
var now  = "'"+2020-07-15 15:00:00+"'"
var then = "'"+2020-07-15 15:00:00+"'"
*/
var tmp = (moment("2020-07-15 15:00:00").diff(moment("2020-07-15 13:00:00")))/1000
console.log(tmp)