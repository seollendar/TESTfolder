//const moment = require('moment');
const moment = require('moment-timezone'); 
//moment.tz.setDefault("UTC"); 
      var startdatetime = moment(moment(new Date).format("YYYYMMDD")) / 0.000001;
	  var startdatetime = moment(moment('20220103')) / 0.000001;
      var enddatetime = startdatetime + 86399999999000;
	  console.log(startdatetime, enddatetime)
//var startdatetime = moment(new Date).format("YYYYMMDD") / 0.000001;
//var enddatetime = startdatetime + 86399999999000;
//console.log(moment(new Date).format("YYYYMMDD"), `from = ${startdatetime}, to = ${enddatetime}`);
/*
let cinContents = moment('2021-07-26 15:44:55.175');
let prevData = moment('2021-07-26 15:44:53.195');
console.log(cinContents, prevData, cinContents - prevData);	 
*/
/* sql
select con from cincontents where ae = 'D1' and container = 'scnt-location' 
--update cincontents set con = 'ssul' where ae = 'D1' and container = 'scnt-location' 

--SELECT * FROM public.preproc order by time asc LIMIT 1
--SELECT * FROM public.preproc order by time desc LIMIT 1
--delete from cincontents
--select count(*) from cincontents
select StartTime, LastTime, LastTime - StartTime as timediff
from (
select executetime as StartTime 
FROM preproc order by time asc LIMIT 1
) x,
(
select executetime as LastTime
from preproc order by time desc LIMIT 1
 ) y;


 
select StartTime, LastTime, LastTime - StartTime as timediff
from (
select time as StartTime 
FROM cincontents  where time::timestamp > to_timestamp('2021-07-27 15:00:00' , 'YYYY-MM-DD HH24:MI:SS') order by time asc LIMIT 1
) x,
(
select time as LastTime
from cincontents order by time desc LIMIT 1
 ) y;
*/


// let milliseconds = new Date("Mon Nov 09 2020 01:48:11 GMT+0000").getTime() //1604886491000
// console.log(milliseconds);

/* console.log(moment().valueOf()); //1604650919610
console.log(moment().format('YYYY-MM-DDTHH:mm:ss')); //2020-11-06T08:22:57
 */
// /* let deviceTime = "2020-11-04T10:29:34.200";
// let epoch = moment(deviceTime).unix();
// console.log("epoch: ", epoch*1000); */
// let DateformatConversion = moment(deviceTime).format('YYYY-MM-DD'); //2020-11-04
// let epoch = moment(Day).unix(); //1604448000 == GMT: 2020년 November 4일 Wednesday AM 12:00:00
// console.log("epoch: ", epoch) 
// var startTime = epoch;
// var EndTime = epoch + 86399;
// console.log("EndTime: ", EndTime) 

// 2020-10-22T09:14:39.600 2020-10-22T09:14:38.600

// var TimeDiff = cinContents.time - prevData[ae].time;




//1000, timediff로 속도 계산하려면 1000으로 나눠야 함
// let wtime = "2020-10-22T07:01:31.200";

 //let epoch = moment(wtime).unix();
 //console.log("epoch:", epoch);
//var d = new Date();
//var now = moment(d).format('YYYY-MM-DD HH:mm:ss'); //Date 객체를 파라미터로 넣기
//console.log(now);
// var a = moment().valueOf();
// var now = moment(new Date()).unix();
// console.log(a);

// let wtime = cinContents.wtime; //epochtime
// let utcTime = moment.utc(wtime); //epochtime To UTCzero
// console.log("utctime:", utcTime);
// wtimeUTC = utcTime.format('YYYY-MM-DD HH:mm:ss');

// var st = moment('2020-09-16T13:46:03+09:00');
// var pt = moment('2020-09-16T13:46:19+09:00');
// console.log(pt-st);
//let wtime = ct.format('YYYY-MM-DD HH:mm:ss');

// let wtime = 1603340088000; //epochtime
// let utcTime = moment.utc(wtime); //epochtime To UTCzero
// let wtimeUTC = utcTime.format('YYYY-MM-DD HH:mm:ss');

// console.log("utc: ",utcTime);
//console.log("wtime: ",wtime.format('YYYY-MM-DD HH:mm:ss'));


//ct = jsonbody['m2m:sgn'].nev.rep['m2m:cin'].ct;

/*
 let swtime = '2020-10-22T07:01:31.200'
// let wtime = 1603340088000; //epochtime
// let epoch = moment(wtime).unix(); //epochtime To UTCzero
// wtimeUTC = utcTime.format('YYYY-MM-DD HH:mm:ss');
// console.log(epoch)//2020-10-22 04:14:48
// 1640710838034000000
// 1603340088000
 let wtime = 1640710838034000000; //epochtime
 let utcTime = moment(wtime); //epochtime To UTCzero
 wtimeUTC = utcTime.format('YYYY-MM-DDTHH:mm:ss.SSS');
 console.log(wtimeUTC)//2020-10-22T13:14:48

var newDate = moment(1640710838034000000).format("MM/DD/YYYY");
 console.log(newDate)
*/
//var date = new Date("2021-12-30T13:14:48.232"); 
//var milliseconds = date.getTime(); 
// This will return you the number of milliseconds
// elapsed from January 1, 1970 
// if your date is less than that date, the value will be negative

//console.log(milliseconds);



/*
let ct = '20200728T100000';
creationtime = moment(ct).format('YYYY-MM-DD HH:mm:ss');
console.log(creationtime)
*/
/*
let ct = '20191212T173020';
var startdatetime = moment.utc(ct)/0.000001
console.log(startdatetime)

/*
let ct = '20200728T100000';
creationtime = moment(ct).format('YYYY-MM-DDTHH:mm:ssZ');
console.log(creationtime)
//format('YYYY-MM-DDTHH:mm:ssZ');

let ct = '20200731';
//creationtime = moment(ct).format('YYYYMMDDTHHmmss');
//console.log(ct)
//console.log(creationtime)
//1596499199000
//1596412800000
//86,399,000
//86,400,000
//let ct = '20200728T000000'
//var enddatetime = moment.utc(ct)/0.000001;
//console.log(enddatetime)

//1596499199000-1596412800000

var startdatetime = moment.utc('20200731')/0.000001;
var enddatetime = startdatetime + 86399000000000; 
//console.log(typeof(startdatetime))
console.log(startdatetime)
console.log(enddatetime)
86399000000000
86399999999000
1596153600000000000 //2020년 July 31일 Friday AM 12:00:00
1596239999000000000 //2020년 July 31일 Friday PM 11:59:59
1596585599000000000 //2020년 August 4일 Tuesday PM 11:59:59 
1596239999999999000 //2020년 July 31일 Friday PM 11:59:59.999
1596239999999999990 //2020년 August 1일 Saturday AM 12:00:00
*/