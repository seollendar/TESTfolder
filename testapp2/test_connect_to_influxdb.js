const Influx = require('influx');
const influx = new Influx.InfluxDB('http://admin:password@localhost:8086/ssultest')
//const moment = require('moment');

/* influxdb에 접근해서 테이블들을 조회 */
// influx.getDatabaseNames().then(names => {
    // console.log(names);
// }).catch(error => console.log({
   // error
// }));

influx.writePoints([
   {
      measurement: 'spatiotime',
      // tags: { time :  moment()},
      fields: { value : 1},
   }
]).catch(err => {
   console.error(`Error saving data to InfluxDB! ${err.stack}`)
});