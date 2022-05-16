// const express = require('express');
// const app = express();
// const os = require('os')
// const port = 6000
// app.listen(port, () => console.log(`server listening at http://localhost:${port}`))
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("UTC");

const Influx = require('influx');
const influx = new Influx.InfluxDB('http://localhost:8086/SmartPortData')
// const influx = new Influx.InfluxDB({
//    host: 'localhost',
//    database: 'ssultest',
//    schema: [
//      {
//        measurement: 'response_times',
//        fields: {
//          path: Influx.FieldType.STRING,
//          duration: Influx.FieldType.INTEGER
//        },
//        tags: [
//          'host'
//        ]
//      }
//    ]
//  }) 

//  influx.getDatabaseNames()
//   .then(names => {
//     if (!names.includes('express_response_db')) {
//       return influx.createDatabase('express_response_db');
//     }
//   })
//   .catch(err => {
//     console.error(`Error creating Influx database!`);
//   })
	
function writeToInflux(){		
	let ae_name  = 'kriso';
	let cnt_name  = 'cctv_veh_container';
	let cinContentsData = {
		"truck_arrive": 330
	};
	//let epoch = moment().valueOf();
	
	influx.writePoints([
		{ measurement: ae_name,
			tags: { deviceID: cnt_name },
			fields: cinContentsData, 
			timestamp: 1641970000000000000
			}
	 ],{
		precision: 'ns',
	}).then(result => {
      console.log(">>> Send Response (Influx), 200");
   }).catch(err => {
		console.error(`Error saving data to InfluxDB! ${err.stack}`)
	});

}
writeToInflux();

/*
function input_sample_data(){

   var ae_name = 'dt1';
   var cnt_name = 'timeseries';
   let wtime = 1604455200; 
   let lat = 33.459646
   let lng = 126.561136
   let alt = 277.3
   let speed = 0
   
   for(i=0; i <= 100; i++){
   
      let cinContentsData = {
         "lat": lat,
         "lng": lng,
         "alt": alt,
         "speed" : speed
       }   
   
      influx.writePoints([
         { measurement: ae_name,
           tags: { cnt: cnt_name },
           fields: cinContentsData,
           timestamp: wtime }
       ],{
       precision: 's',
      //database: 'test',
       }
       );
   
       wtime += 1000;
       //lat += 0.000001;
       //lng += 0.000001;
       speed += 0.5;
   
   }
   console.log("done")
      
}
//input_sample_data()	
	
	

var container_key = 'latitude';
//sql = `select ` + container_key + ` from undefined` ;
sql = `select * from undefined` ;
console.log(sql)

influx.query(sql).then(result => {
   // console.log(`res[0]: `+ result[0][container_key]);
   //console.log(`res[0]: `+ result[0]);
   //console.log(result);
   var returnValues = {};

   if (result) {
      var values = [];
      for (var index in result) {
        if (result[index][container_key]) {
          let value = result[index];
          delete value.time;
          value.time = moment(result[index].time).format("YYYYMMDDTHHmmss");
          //console.log(value);
          values.push({ value });
        }
      }
      returnValues["values"] = values;
      console.log(returnValues);
   }
}).catch(err => {
  console.log(err);
})

/*  
var ae_name = 'device01';
var cnt_name = 'location';
//var cin_data = req.body["m2m:cin"].con

var ct = '20200728T100000';
let creationtime = moment(ct).format('YYYY-MM-DD HH:mm:ss');

let wtime = 1474444002000; //epochtime
/*
influx.writePoints([
   {
      measurement: 'at7',
      tags: {container:'location'},
      fields: { 
        latitude : 10,
        longitude : 10,
        altitude : 10,
      },
      timestamp: 1595938332000000000
   }
]).catch(err => {
   console.error(`Error saving data to InfluxDB! ${err.stack}`)
});
*/

/* 
influx.writePoints([
   { measurement: ae_name,
     tags: { cnt: cnt_name },
     fields: cin_data,
     timestamp: wtime }
 ], {
   precision: 'ms',
   //database: 'test',
 });
*/