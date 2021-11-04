const Config = require('./HostAddressConfig.json');

const kafkaHostAddress = Config.kafkaHostAddress;
const influxServerAddress = Config.influxServerAddress;
const postgisServerAddress = Config.postgisServerAddress;
const postgisPassWord = Config.postgisPassWord;


console.log(kafkaHostAddress);

console.log(influxServerAddress);

console.log(postgisServerAddress);

console.log(postgisPassWord);

