const express = require("express");
const app = express();
const pg = require("pg");
const ip = require("ip");
const { DateTime } = require("luxon");

var dt = DateTime.now().minus({ month: 1 }).toFormat("yyyyMMdd'T'HHmmss");
console.log(dt);

app.listen(1203, () => {
   console.log(`Server Start on ${ip.address()}:1203`);
});

const config = {
   host: "postgres",
   port: 5432,
   user: "postgres",
   password: "portpassword",
   database: "spatiodata",
};

console.log(config);
console.log(config);
const client = new pg.Client(config);

client.connect((err) => {
   if (err) throw err;
   else {
      console.log("Database connected");
   }
});

//==============

async function sendToPostgresql() {
   console.log("set");
   let sql = `DELETE FROM spatio WHERE time <= '${dt}'`;
   const result = await client
      .query(sql)
      .then(() => console.log("delete success"))
      .catch((err) => console.log("Postgres Insert Err", err));

   return result;
}

async function main() {
   console.log("main()");
   const result = await sendToPostgresql();
   console.log(result);
}
//setInterval(sendToPostgresql, 3000);
//sendToPostgresql();

const schedule = require("node-schedule");
schedule.scheduleJob("0 59 23 * * *", function () {
   main();
});
