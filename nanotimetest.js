const Influx = require('influx');
const influx = new Influx.InfluxDB('http://admin:password@localhost:8086/ssultest')

//const Influx = require('./').InfluxDB;
//const db = new Influx();

influx.writePoints([
  { measurement: 'test',
    tags: { meta: 'test' },
    fields: { test: 1.5 },
    timestamp: 1479224298038 }
], {
  precision: 'ms',
  database: 'test',
});