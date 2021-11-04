const Influx = require('influxdb-nodejs');
const client = new Influx('http://admin:password@203.254.173.175:8086/ssultest2');
// i --> integer
// s --> string
// f --> float
// b --> boolean

//unindexed column
const fieldSchema = {
  use: 'i',
  bytes: 'i',
  url: 's',
};
//indexed clolumn
const tagSchema = {
  spdy: ['speedy', 'fast', 'slow'],
  method: '*',
  // http stats code: 10x, 20x, 30x, 40x, 50x
  type: ['1', '2', '3', '4', '5'],
};
client.schema('http', fieldSchema, tagSchema, {
  // default is false
  stripUnknown: true,
});
client.write('http')
  .tag({
    spdy: 'fast',
    method: 'GET',
    type: '2',  
  })
  .field({
    use: 300,
    bytes: 2312,
    url: 'https://github.com/vicanso/influxdb-nodejs',
  })
  .then(() => console.info('write point success'))
  .catch(console.error);