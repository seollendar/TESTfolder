const Influx = require("influx");
const influx = new Influx.InfluxDB(
   `http://admin:password@localhost:8086/SmartPortData`
);
const util = require("util");
//const sql = "show series";
const sql = `select * from test4`; // where "container"='heartbeat'`; //${device} group by container order by desc limit 1`;

function getInfluxTime(sql) {
   //sql = `select * from ${Device} where "container" = '${container}' order by desc limit ${dateCount}`;
   //    sql = `select * from ${Device} where "container" = '${container}' order by desc limit 20`;
   console.log(sql);
   influx
      .query(sql)
      .then((result) => {
         console.log(result);
         /*
         if (result[0]) {
            for (var index = 0; index < result.length; index++) {
               console.log(result[index]);
               console.log("===================");
            }
         } else {
            //if no response
            console.log("{ no response }");
         }
         */
      })
      .catch((err) => {
         console.log("Error", err);
      });
}

//getInfluxTime(sql);

async function query(sql) {
   const result = await influx.query(sql).then((data) => console.log(data)); //data.filter((index) => isObject(index)));

   return result;
}

query(sql);
