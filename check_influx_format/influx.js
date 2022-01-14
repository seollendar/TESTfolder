const Influx = require("influx");
const influx = new Influx.InfluxDB(
   `http://admin:password@localhost:8086/listCheckTest`
);
const { isObject } = require("./lib");

async function query(sql) {
   const result = await influx
      .query(sql)
      .then((data) => data.filter((index) => isObject(index)));

   return result;
}

module.exports = query;
