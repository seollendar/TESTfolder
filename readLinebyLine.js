const lineByLine = require('n-readlines');
const liner = new lineByLine('kriso.txt');
let line;
 
while (line = liner.next()) {
    console.log(line);
}
/*const events = require('events');
const fs = require('fs');
const readline = require('readline');

(async function processLineByLine() {
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream('kriso.txt'),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
		var data = line.split(",");
        console.log(data[0], data[1], data[2]);
		influx.writePoints(
         [
            {
               measurement: "kriso",
               tags: { deviceID: data[1] },
               fields: { truck_arrive: data[2] },
               timestamp: data[0],
            },
         ],
         {
            precision: "ns",
         }
      )
      .then((result) => {
         console.log(">>> Send Response (Influx), 200");
      })
      .catch((err) => {
         console.error(`Error saving data to InfluxDB! ${err.stack}`);
      });
		
    });

    await events.once(rl, 'close');

    } catch (err) {
    console.error(err);
  }
})();


const Influx = require("influx");
const influx = new Influx.InfluxDB("http://localhost:8086/SmartPortData");

lineReader.eachLine("kriso.txt", function (line, last) {
   var data = line.split(",");
   console.log(data);
   //if(last) {
   //  console.log('Last line printed.');
   //}
   influx
      .writePoints(
         [
            {
               measurement: "kriso",
               tags: { deviceID: data[1] },
               fields: { truck_arrive: data[2] },
               timestamp: data[0],
            },
         ],
         {
            precision: "ns",
         }
      )
      .then((result) => {
         console.log(">>> Send Response (Influx), 200");
      })
      .catch((err) => {
         console.error(`Error saving data to InfluxDB! ${err.stack}`);
      });
});
*/