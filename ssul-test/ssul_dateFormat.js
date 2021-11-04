const moment = require('moment');

var time = '2020-06-17T04:43:17.000Z';
var customTimeFormat = moment(time).format('YYYY-MM-DDTHH:MM:ss');

console.log(customTimeFormat);