const moment = require('moment')

//1600131649117
var tenMinutesAgo = moment().utcOffset('+09:00').subtract(10, 'minutes').format('x');

//Moment<2020-09-15T10:01:34+09:00>
var tenMinutesAgo = moment().utcOffset('+09:00').subtract(10, 'minutes');


console.log(tenMinutesAgo)