/*
select value from response_times
where time > '2013-08-12 23:32:01.232' and time < '2013-08-13';

select value from response_times where time > now() - 1h limit 1000;
*/

var today = new Date();

var year = today.getFullYear();
var month = ("0" + (today.getMonth() + 1)).slice(-2);
var day = ("0" + today.getDate()).slice(-2);

var TodayString = year + "-" + month + "-" + day;

var YesterdayString = year + "-" + month + "-" + (day - 1);

console.log(TodayString, YesterdayString);

sql = `select * from Measurement where time > '${YesterdayString}' and time < '${TodayString}'`;

console.log(sql);
