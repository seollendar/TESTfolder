const schedule = require("node-schedule");
// const rule = new schedule.RecurrenceRule();
// rule.tz = "ETC/UTC";
// rule.second = 1;
// const job = schedule.scheduleJob(rule, function () {
//    const date = new Date();
//    console.log(date);
//    console.log("The answer to life, the universe, and everything!");
// });

// const date = new Date(2021, 12, 9, 16, 43, 0);
// const job = schedule.scheduleJob(date, function () {
//    console.log("The world is going to end today.");
// });

// var j = schedule.scheduleJob("0 47 07 * *", function () {
//    console.log("일, 목, 금, 토 중 실행 날짜 17시 0분에 실행");
// });

schedule.scheduleJob("* * 0 * * *", function () {
   const date = new Date();
   console.log(date);
   console.log("실행");
});
