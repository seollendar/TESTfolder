/*
const d = new Date();

// 날짜를 정하기
new Date(2020, 0, 1).toLocaleDateString();
// "2020. 1 1."


const year = d.getFullYear(); // 년
const month = d.getMonth();   // 월
const day = d.getDate();      // 일


// 어제 날짜 구하기
new Date(year, month, day - 1).toLocaleDateString();


// 일주일 전 구하기
new Date(year, month, day - 7).toLocaleDateString();


// 한달 전 구하기
const pastMonth = new Date(year, month - 1, day).toLocaleDateString();
console.log(pastMonth);


// 일년 전 구하기
new Date(year - 1, month, day).toLocaleDateString();
*/
const moment = require('moment'); 
//moment.tz.setDefault("UTC"); 

const d = new Date();
const year = d.getFullYear(); // 년
const month = d.getMonth();   // 월
const day = d.getDate();      // 일
const pastMonth = new Date(year, month - 1, day).toLocaleDateString();
//console.log(pastMonth); //2021. 12. 4.

const pastTIme = d.getTime() - (30*24*60*60*1000);
//console.log(moment(pastTIme).format('YYYYMMDDTHHmmss')); //20211205T155457
const setTime = moment(pastTIme).format('YYYYMMDDTHHmmss');
const sql=`Delete from spatio where time <= ${}`;
console.log(sql);