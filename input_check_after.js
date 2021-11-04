const express = require('express');
const app = express();
const { Client } = require('pg');
const Config = require('./config.json');
const DBConfig = Config.database;

const client = new Client({
  "host": DBConfig.host,
  "port": DBConfig.port,
  "user": DBConfig.user,
  "password": DBConfig.password,
  "database": DBConfig.database
})

client.connect(err => {
  if (err) {
    console.error('Database connection error', err.stack)
  } else {
    console.log('Database connected')
  }
})

const Influx = require('influx');
const influx = new Influx.InfluxDB('http://admin:password@localhost:8086/preprocessing')
var moment = require('moment');
require('moment-timezone'); 
moment.tz.setDefault("UTC"); 

app.listen(7981, ()=> {
  console.log("Server Start on port 7981");
})


var DataforCheck = {};
app.post("/noti_for_fastdata", (req, res)=>{
	var fullBody = '';
	req.on('data', function(chunk) {
		fullBody += chunk; 
	});
  
	req.on('end', function() {
		//console.log("fullBody: ",fullBody);
		var jsonbody = JSON.parse(fullBody);
    //res.status (200).send ('Received Data');

		if(jsonbody['m2m:sgn']&& jsonbody['m2m:sgn'].nev && jsonbody['m2m:sgn'].nev.rep && jsonbody['m2m:sgn'].nev.rep['m2m:cin']){
      let cinContents = jsonbody['m2m:sgn'].nev.rep['m2m:cin'].con;
			//let resources = jsonbody['m2m:sgn'].sur.split('/');
      let ae  = "y9";
      let container  = "location";
      
      if(DataforCheck[ae] == undefined){
        Promise.all([sendToPostgresql(cinContents, ae, container), sendToInfluxdb(cinContents, ae)]).then(function (values) {
          res.status (200).send ('Received Data');
        });
        DataforCheck[ae] = {...cinContents};
      }else
      {
        // 중복데이터 검사.
        if(cinContents.time === DataforCheck[ae].time){
          res.status (200).send ('Received overlap Data');
        }
        else{
          Promise.all([sendToPostgresql(cinContents, ae, container), sendToInfluxdb(cinContents, ae)]).then(function (values) {
            res.status (200).send ('Received Data');
          });
          DataforCheck[ae] = {...cinContents};
        }  

      }


		}else{
      console.log("Receive other notification message (Not exists content-location)");
      //console.log("jsonbody['m2m:sgn'].nev.rep: ", jsonbody['m2m:sgn'].nev.rep); //m2m:sub이 들어옴.
			res.status(400).send("Bad Request");
			return;
		}   
    
	});

})


function sendToPostgresql(cinContents, ae, container){
  if(cinContents.latitude && cinContents.longitude && cinContents.altitude){
  
    let saveDataQuery = 'INSERT INTO spatio (ae, container, latitude, longitude, altitude, velocity, direction, time, gps)' +
              ' values (\''+ ae + '\',\''+ container + '\', \'' + cinContents.latitude + '\', \'' + cinContents.longitude + '\', \'' + cinContents.altitude + '\', \'' + cinContents.velocity + '\', \'' + cinContents.direction + '\', \'' + cinContents.time + '\', ST_SetSRID(ST_MakePoint('+parseFloat(cinContents.longitude)+','+parseFloat(cinContents.latitude)+'),4326))';
  
    //console.log (saveDataQuery);
    client.query (saveDataQuery)
    .then (result =>{
      console.log (">>> Send Response (PostgreSQL), 200");
    }).catch (e =>{
      console .log (e .stack );
    })
   
  }else{
    console.log("PostgreSQL: Receive other notification message (NOT EXIST location data)")
    return;
  }
}


var prevData = {};
function sendToInfluxdb(cinContents, ae){ 

  let epoch = moment(cinContents.time).unix();
  let raw_cinContents = JSON.stringify(cinContents);	
  
  if(prevData[ae] === undefined){
    prevData[ae] = {...cinContents};
    
    let cinContentsData = {
      "latitude": cinContents.latitude,
      "longitude": cinContents.longitude,
      "velocity": cinContents.velocity,
      "direction": cinContents.direction,
      "raw" : raw_cinContents,
    };

    influx.writePoints([
    { measurement: 'location',
    tags: { cnt: ae },
    fields: cinContentsData, 
    timestamp: epoch, 
    }], {
    precision: 's',
    }).then (result =>{
        console.log (">>> Send Response (Influx_Time:now), 200");
      }).catch (e =>{
        console .log ("influx ERR: ", e .stack );
 		}) 			
  }
  // 있을 경우
  else {
    var distancePerM = distance(prevData[ae].latitude, prevData[ae].longitude, cinContents.latitude, cinContents.longitude)//이동거리
    var TimeDiff = moment(cinContents.time) - moment(prevData[ae].time);
    var computevelocity = computespeed(TimeDiff, distancePerM)//이동속도

    let cinContentsData = {
      "latitude": cinContents.latitude,
      "longitude": cinContents.longitude,
      "computevelocity": computevelocity,
      "computeDistance": distancePerM,
      "velocity": cinContents.velocity,
      "direction": cinContents.direction,
      "raw" : raw_cinContents,
    };

    influx.writePoints([
    { measurement: 'location',
    tags: { cnt: ae },
    fields: cinContentsData, 
    timestamp: epoch, 
    }], {
    precision: 's',
    }).then (result =>{
        console.log (">>> Send Response (Influx_Time:now), 200");
      prevData[ae] = {...cinContents};
      }).catch (e =>{
        console .log ("influx ERR: ", e .stack );
 		})       
  }    
}


function distance(lat1, lon1, lat2, lon2){ 
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  //console.log(12742 * Math.asin(Math.sqrt(a))*1000)// 2 * R; R = 6371 km
  return (12742 * Math.asin(Math.sqrt(a))*1000);
}


function computespeed (timediff, distancediff){
  if(distancediff == 0){
    tspeed = 0;  
  }else{
    tspeed = distancediff / timediff;
  }
  //console.log(`speed: ${tspeed} timediff ${timediff} distancediff ${distancediff}`);
  return tspeed;
} 




app.post('*', function(req, res){
  res.send("Bad Request (Wrong Url)", 404);
  console.log("404 Bad request (Wrong Url)");    
});
