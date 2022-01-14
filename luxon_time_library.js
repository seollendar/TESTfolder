const { DateTime } = require("luxon");

//const now = `${DateTime.now().toFormat("yyyyMMddTHHmmss")}`;

var dt = DateTime.now().minus({ month: 1 });
console.log(dt.toFormat("yyyyMMdd'T'HHmmss"));

//every 23:59:00 에 실행
const schedule = require("node-schedule");
schedule.scheduleJob("0 59 23 * * *", function () {
   GETDeviceNum();
});
