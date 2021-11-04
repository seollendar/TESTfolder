// var DataforCheck = [];
// 	var ae = 'dt';
// 	var container = 'location';
// 	let cinContentsData = {
// 		"latitude": 35.9000505,
// 		"longitude": 127.3000505,
// 	};
// 	// console.log("before: ",cinContentsData);

// 	// cinContentsData.waitingTime = 3000;
	
// 	// console.log(cinContentsData);

// 	DataforCheck[ae][container] = { ...cinContentsData };
// 	console.log(DataforCheck);
//moment
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("UTC");

const cintime = '2021-03-30T12:00:00.200';
let epoch = moment(cintime).unix();
console.log("moment cin: ",epoch); // (second) 1617105600 cintime이 GMT 

let epochv = moment(cintime).valueOf();
console.log("momentv cin: ",epochv); // (milliseconds) 1617105600200 cintime이 GMT 

let epochnow = moment().unix();
console.log("moment now: ",epochnow); // (second)

let epochnowv = moment().valueOf();
console.log("momentv now: ",epochnowv); //(milliseconds)

//============== date =============
someD = new Date(cintime).getTime();
console.log("date cin", someD); //1617073200200 cintime이 GMT+9

var currentTimeInMilliseconds=Date.now();
console.log("date now: ", currentTimeInMilliseconds); //1617079093477


