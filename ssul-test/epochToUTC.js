
/*
 * UNIX time(epoch time) -> UTC

const moment = require('moment');

var now = Date();
console.log(now);

var epochTime = Date.now();
console.log(epochTime);

var utcTime = moment(epochTime);
console.log(utcTime.format('YYYY-MM-DD HH:mm:ss'));
 */

const moment = require('moment');

//var now = Date();
//console.log(now);

//var epochTime = Date.now();
//console.log(epochTime);

var utcTime = moment.utc(1593566962569);
console.log(utcTime.format('YYYY-MM-DD HH:mm:ss'));