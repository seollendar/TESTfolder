const Influx = require("influx");
const influx = new Influx.InfluxDB("http://admin:password@localhost:8086/consumer");
var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("UTC");



sql = `select * from Dt999 order by desc limit 1`;
// sql = `select * from Dt999 where time >= 1617678110000 and time <= 1617678120000 and cnt = 'scnt-location'` ;
console.log(sql)

influx.query(sql).then(result => {
   // console.log(`res[0]: `+ result[0][container_key]);
   //console.log(`res[0]: `+ result[0]);
   //console.log(result);
   var returnValues = {};

   if (result) {
      var values = [];
      for (var index = 0; index < result.length; index++) {
		console.log(result[index]);
        console.log(moment(result[index].time).format("YYYYMMDDTHHmmss.SSS")) ;
      }

   }
}).catch(err => {
  console.log(err);
})