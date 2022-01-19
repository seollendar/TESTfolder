const { DateTime } = require("luxon");

//const now = `${DateTime.now().toFormat("yyyyMMddTHHmmss")}`;

// var dt = DateTime.now().minus({ month: 1 });
// console.log(dt.toFormat("yyyyMMdd'T'HHmmss"));

//every 23:59:00 에 실행
// const schedule = require("node-schedule");
// schedule.scheduleJob("0 59 23 * * *", function () {
//    GETDeviceNum();
// });

const MomentTimezone = require("moment-timezone"); // moment-timezone load

const date = {
   mt: MomentTimezone().tz("America/New_York"),
   luxon: DateTime.fromObject({ zone: "America/New_York" }),
};

console.log(`mt를 통한 뉴욕 시간: ${date.mt.format("YYYY-MM-DD HH:mm")}`);

// mt를 통한 뉴욕 시간: 2020-10-05 10:10

console.log(
   `luxon을 통한 뉴욕 시간: ${date.luxon.toFormat("yyyy-LL-dd HH:mm")}`
);

// luxon을 통한 뉴욕 시간: 2020-10-05 10:10

console.log(`mt로 보는 주차(년 기준): ${date.mt.week()}`); // 41

console.log(`luxon으로 보는 주차(년 기준): ${date.luxon.weekNumber}`); // 41

const weekOfMonth = {
   mt:
      MomentTimezone().tz("America/New_York").week() -
      MomentTimezone().tz("America/New_York").startOf("month").week() +
      1,
   luxon: date.luxon.weekNumber - date.luxon.startOf("month").weekNumber + 1,
};

console.log(`mt로 보는 주차(월 기준): ${weekOfMonth.mt}`); // 2

console.log(`luxon으로 보는 주차(월 기준): ${weekOfMonth.luxon}`); // 2

const diff = {
   mt: MomentTimezone.tz("Asia/Seoul").diff(
      MomentTimezone("2020-10-05 00:00:00").tz("Asia/Seoul")
   ),
   luxon: DateTime.fromObject({ zone: "Asia/Seoul" })
      .diff(
         DateTime.fromObject({
            zone: "Asia/Seoul",
            year: 2020,
            month: 10,
            day: 5,
            hour: 0,
            minute: 0,
            second: 0,
         })
      )
      .toObject(),
};

console.log(`mt로 보는 현재 - 지정된 날 = ts: ${diff.mt}`); // 87448000

console.log(`luxon으로 보는 현재 - 지정된 날 = ts: ${diff.luxon.milliseconds}`); // 87448004

const ts = new Date().getTime(); // 1516717417146
const dt = DateTime.fromMillis(ts); // { ts: ts: 2018-01-23T09:23:37.146-05:00 ...
console.log(dt.valueOf()); // 1516717417146
console.log(new Date().getTime());
