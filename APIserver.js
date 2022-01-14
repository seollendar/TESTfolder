var pg = require("pg"); //postgres
pg.types.setTypeParser(1114, (str) => str);

const express = require("express");

const app = express();
//var cluster = require("cluster");
//var numCPUs = require("os").cpus().length;
/*
if (cluster.isMaster) {
   // console.log("number of cpu = " + numCPUs + "\n");

   for (var i = 0; i < numCPUs / 2; i++) {
      cluster.fork(); 
   }

   cluster.on("exit", function (worker, code, signal) {
      console.log("worker " + worker.process.pid + " died");
   });
} else {

   /*
   * config setting
   */
const cors = require("cors");

const Influx = require("influx");
const influx = new Influx.InfluxDB(`http://admin:password@localhost:8086/gps`);
var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("UTC");

// console.log(config);
// const client = new pg.Client(config);
const client = new pg.Client({
   user: "postgres",
   host: "203.254.173.175",
   database: "spatiodata",
   password: "keti123",
   port: 5432,
});
client.connect((err) => {
   if (err) throw err;
   else {
      console.log("Database connected");
   }
});

app.listen(7979, () => {
   console.log("API-Server Start on port 7979");
});

/* GET Retrieve Types
 * 1. 디바이스 위치 조회
 * 설명 : 디바이스의 아이디를 통해 해당 디바이스의 마지막 위치 조회
 * localhost:7979/location/:deviceID/:containerName/latest
 */
app.get("/location/:deviceID/:containerName/latest", (req, res) => {
   if (req.params.deviceID && req.params.containerName) {
      let { deviceID, containerName } = req.params;
      let sql =
         "SELECT spatio.ae, spatio.container, spatio.latitude, spatio.longitude, spatio.altitude, spatio.time from (SELECT ae, container, MAX(spatio.time) as time FROM spatio where ae = '" +
         deviceID +
         "' AND container = '" +
         containerName +
         "' GROUP BY ae, container)  AS lastvalue, spatio   WHERE lastvalue.time=spatio.time AND lastvalue.ae=spatio.ae AND lastvalue.container=spatio.container";

      console.log(sql);
      client
         .query(sql)
         .then((response) => {
            if (response.rowCount) {
               var { ae, container, latitude, longitude, altitude, time } =
                  response.rows[0];
               var time = moment(time).format("YYYYMMDDTHHmmss");
               let parseresponse = {
                  deviceID: ae,
                  container,
                  location: { latitude, longitude, altitude },
                  time,
               };
               res.send(parseresponse);
               console.log(">>> 200 OK  (latest - Location)");
            } else {
               //if no response
               res.send("{}");
               console.log("{}");
               console.log(">>> 200 OK  (latest - Location)");
            }
         })
         .catch((e) => {
            res.status(500).send("Internal Server Error");
            console.log(">>> 500, Internal Server Error...");
            console.log(e.stack);
         }); //client.query
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

/* GET Retrieve Types
 * 2. 주변 디바이스 조회
 * 설명 : 디바이스의 아이디를 통해 해당 디바이스 주변에 위치하는 다른 디바이스 조회
 * localhost:7979/location/deviceID/containerName/around?radius={중심 반경 거리(단위:m)}&term={조회 기간 (단위:s)}
 */
app.get("/location/:deviceID/:containerName/around", (req, res) => {
   if (
      req.params.deviceID &&
      req.params.containerName &&
      req.query.radius &&
      req.query.term
   ) {
      let { deviceID, containerName } = req.params;
      let { radius, term } = req.query;
      let sql =
         "select spatio.ae, spatio.container, spatio.latitude, spatio.longitude, spatio.altitude, spatio.time " +
         "from (" +
         "select spatio.ae, spatio.container, max(spatio.time) " +
         "from spatio " +
         "WHERE st_DistanceSphere(gps, (SELECT DISTINCT spatio.gps from (SELECT ae, container, MAX(spatio.time) as time FROM spatio where ae = '" +
         deviceID +
         "' AND container = '" +
         containerName +
         "' AND time::timestamp > NOW() - interval '" +
         term +
         " sec' " +
         " GROUP BY ae, container) AS lastvalue, spatio WHERE lastvalue.time=spatio.time AND lastvalue.ae=spatio.ae)) < " +
         radius +
         " AND time::timestamp > NOW() - interval '" +
         term +
         " sec' " +
         "group by ae, container) as lastvalue, spatio " +
         "WHERE lastvalue.max = spatio.time AND lastvalue.ae=spatio.ae AND lastvalue.container = spatio.container";

      console.log(sql);
      client
         .query(sql)
         .then((response) => {
            if (response.rowCount) {
               var devices = [];
               for (var index in response.rows) {
                  if (response.rows[index].ae != deviceID) {
                     var {
                        ae,
                        container,
                        latitude,
                        longitude,
                        altitude,
                        time,
                     } = response.rows[index];
                     var time = moment(time).format("YYYYMMDDTHHmmss");
                     let parseresponse = {
                        deviceID: ae,
                        container,
                        location: { latitude, longitude, altitude },
                        time,
                     };
                     devices.push(parseresponse);
                  }
               } //for
               res.send({ devices });
               console.log(">>> 200 OK  (around)");
            } else {
               //if no response
               res.send("{}");
               console.log("{}");
               console.log(">>> 200 OK  (around)");
            }
         })
         .catch((e) => {
            console.log(e.stack);
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error");
         }); //client.query
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

/* GET Retrieve Types
 * 3. 영역 내 디바이스 조회
 * 설명 : 두 개의 GPS좌표를 통해 특정 영역 내 위치하는 디바이스 조회
 * localhost:7979/location/field?firstPoint={[37.408977, 127.127674]}&secondPoint={[37.410804, 127.129812]}&term={조회 기간 (단위:s)}
 */
app.get("/location/field", (req, res) => {
   if (req.query.firstPoint && req.query.secondPoint && req.query.term) {
      let { firstPoint, secondPoint, term } = req.query;

      try {
         firstArr = JSON.parse(firstPoint);
         secondArr = JSON.parse(secondPoint);
      } catch (error) {
         res.status(400).send("Bad Request");
         console.log("Bad Request: JSON parse error");
         return;
      }

      if (firstArr.length == 2 && secondArr.length == 2) {
         let latitude = [
            firstArr[0],
            firstArr[0],
            secondArr[0],
            secondArr[0],
            firstArr[0],
         ];
         let longitude = [
            firstArr[1],
            secondArr[1],
            secondArr[1],
            firstArr[1],
            firstArr[1],
         ];
         let gpsList = "";
         for (let index = 0; index < latitude.length; index++) {
            gpsList +=
               (index ? ", " : "") + longitude[index] + " " + latitude[index];
         }

         getObjectsInSomeSQfield(gpsList, term)
            .then((response) => {
               res.send(response);
               console.log(">>> 200 OK  (field)");
            })
            .catch((e) => {
               res.status(500).send("Internal Server Error");
               console.log(">>> 500 Internal Server Error");
               console.log(e.stack);
            });
      } else {
         res.status(400).send("Bad Request");
         console.log("Bad Request: Input argument count error");
         console.log(">>> 400 Bad Request");
         return;
      }
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

function getObjectsInSomeSQfield(gpsList, term) {
   return new Promise((resolve, reject) => {
      let areaType =
         " ST_Contains(ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(" +
         gpsList +
         ")')),4326), GPS)";
      let searchObjectsFromAreaSql =
         "select spatio.ae, spatio.container, spatio.latitude, spatio.longitude, spatio.altitude, spatio.time " +
         "from ( " +
         "select spatio.ae, max(spatio.time) " +
         "from spatio " +
         "WHERE time::timestamp > NOW() - interval '" +
         term +
         " sec' AND " +
         areaType +
         " group by ae) as lastvalue, spatio " +
         "WHERE lastvalue.max = spatio.time AND lastvalue.ae=spatio.ae ";

      console.log(searchObjectsFromAreaSql);
      client
         .query(searchObjectsFromAreaSql)
         .then((response) => {
            var devices = [];
            for (var index in response.rows) {
               var { ae, container, latitude, longitude, altitude, time } =
                  response.rows[index];
               var time = moment(time).format("YYYYMMDDTHHmmss");
               let parseresponse = {
                  deviceID: ae,
                  container,
                  location: { latitude, longitude, altitude },
                  time,
               };
               devices.push(parseresponse);
            }
            resolve({ devices });
         })
         .catch((e) => {
            console.log(e.stack);
            reject(e);
         }); //client.query
   }); //return new Promise
} //function

/* GET Retrieve Types
 * 4. 디바이스 누적 이동 거리 조회
 * 설명 : 디바이스의 아이디를 통해 특정 디바이스의 누적 이동 거리 조회
 * localhost:7979/location/:deviceID/:containerName/distance?from={startDateTime}&to={endDateTime}
 */
app.get("/location/:deviceID/:containerName/distance", (req, res) => {
   if (
      req.params.deviceID &&
      req.params.containerName &&
      req.query.from &&
      req.query.to
   ) {
      let { deviceID, containerName } = req.params;
      var startdatetime = moment(req.query.from).format("YYYY-MM-DD HH:mm:ss");
      var enddatetime = moment(req.query.to).format("YYYY-MM-DD HH:mm:ss");
      sql =
         "SELECT st_Length(ST_Transform(ST_MakeLine(geom.gps),5179)) as distancevalue FROM ( select * from (select * from spatio where ae='" +
         deviceID +
         "' and container='" +
         containerName +
         "') as aevalue " +
         "where time  between '" +
         startdatetime +
         "' and '" +
         enddatetime +
         "' order by time) As geom";

      console.log(sql);
      client
         .query(sql)
         .then((response) => {
            if (response.rows[0].distancevalue != null) {
               var returnValues = {};
               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["value"] = response.rows[0].distancevalue;
               res.send(returnValues);
               console.log(">>> 200 OK   (distance)");
            } else {
               console.log("{}");
               res.send("{}");
               console.log(">>> 200 OK   (distance)");
            }
         })
         .catch((e) => {
            console.log(e.stack);
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error");
         });
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

function distance(start_point, end_point) {
   var lat1 = start_point.latitude;
   var lng1 = start_point.longitude;
   var lat2 = end_point.latitude;
   var lng2 = end_point.longitude;

   var p = 0.017453292519943295; // Math.PI / 180
   var c = Math.cos;
   var a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lng2 - lng1) * p))) / 2;
   return 12742 * Math.asin(Math.sqrt(a)) * 1000;
}

function gettimediff(startpoint, endpoint) {
   let starttime = moment(startpoint.time).format("YYYY-MM-DD HH:mm:ss.SSS");
   let endtime = moment(endpoint.time).format("YYYY-MM-DD HH:mm:ss.SSS");
   let timediffvalue = moment(endtime).diff(moment(starttime)) / 1000;
   return timediffvalue;
}

// (km/h)
function computespeed(startpoint, endpoint) {
   let timediff = gettimediff(startpoint, endpoint);

   let distancediff = distance(startpoint, endpoint);

   if (distancediff == 0) {
      tspeed = 0;
   } else {
      tspeed = distancediff / timediff;
   }
   return tspeed * 3.6;
}

/* GET Retrieve Types
 * 5. 디바이스 누적 평균 이동 속도 조회
 * 설명 : 디바이스의 아이디를 통해 기간 내 디바이스의 이동 속력 평균값 조회
 * localhost:7979/location/:deviceID/:containerName/speed?from={startDateTime}&to={endDateTime}
 */
app.get("/location/:deviceID/:containerName/speed", (req, res) => {
   if (
      req.params.deviceID &&
      req.params.containerName &&
      req.query.from &&
      req.query.to
   ) {
      let { deviceID, containerName } = req.params;
      var startdatetime = moment(req.query.from).format("YYYY-MM-DD HH:mm:ss");
      var enddatetime = moment(req.query.to).format("YYYY-MM-DD HH:mm:ss");
      sql =
         "select * from (select * from spatio where ae='" +
         deviceID +
         "' and container='" +
         containerName +
         "' ) as aevalue where time  between '" +
         startdatetime +
         "' and '" +
         enddatetime +
         "' order by time asc";

      console.log(sql);
      client
         .query(sql)
         .then((response) => {
            var rescount = response.rowCount;
            if (rescount) {
               let speedsum = 0;
               let datacount = 0;

               for (i = 0; i < rescount - 1; i++) {
                  let startpoint = response.rows[i];
                  let endpoint = response.rows[i + 1];
                  let speed = computespeed(startpoint, endpoint);
                  if (speed > 0) {
                     speedsum += speed;
                     datacount++;
                  } else {
                  }
               }
               let speedaverage = speedsum / datacount;
               var returnValues = {};
               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["value"] = speedaverage;

               res.send(returnValues);
               console.log(">>> 200 OK  (speed)");
            } else {
               res.send("{}");
               console.log("no travel distance");
               console.log(">>> 200 OK   (speed)");
            }
         })
         .catch((e) => {
            console.log(e.stack);
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error");
         });
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

/* GET Retrieve Types
 * 6. 기간별 이동 경로 조회
 * 설명 : 디바이스의 아이디를 통해 기간 내 디바이스의 이동 방향 조회
 * localhost:7979/location/:deviceID/:containerName/direction?from={startDateTime}&to={endDateTime}
 */
function convertdecimaldegreestoradians(deg) {
   return (deg * Math.PI) / 180;
}
/*decimal radian -> degree*/
function convertradianstodecimaldegrees(rad) {
   return (rad * 180) / Math.PI;
}
/*bearing*/
function getbearing(lat1, lon1, lat2, lon2) {
   let lat1_rad = convertdecimaldegreestoradians(lat1);
   let lat2_rad = convertdecimaldegreestoradians(lat2);
   let lon_diff_rad = convertdecimaldegreestoradians(lon2 - lon1);
   let y = Math.sin(lon_diff_rad) * Math.cos(lat2_rad);
   let x =
      Math.cos(lat1_rad) * Math.sin(lat2_rad) -
      Math.sin(lat1_rad) * Math.cos(lat2_rad) * Math.cos(lon_diff_rad);
   return (convertradianstodecimaldegrees(Math.atan2(y, x)) + 360) % 360;
}

app.get("/location/:deviceID/:containerName/direction", (req, res) => {
   if (
      req.params.deviceID &&
      req.params.containerName &&
      req.query.from &&
      req.query.to
   ) {
      let { deviceID, containerName } = req.params;
      var startdatetime = moment(req.query.from).format("YYYY-MM-DD HH:mm:ss");
      var enddatetime = moment(req.query.to).format("YYYY-MM-DD HH:mm:ss");
      sql =
         "select * from (select * from spatio where ae='" +
         deviceID +
         "' and container='" +
         containerName +
         "' ) as aevalue where time  between '" +
         startdatetime +
         "' and '" +
         enddatetime +
         "' order by time asc";

      console.log(sql);
      client
         .query(sql)
         .then((response) => {
            var rescount = response.rowCount;
            if (rescount) {
               var directionlist = [];
               for (i = 0; i < rescount - 1; i++) {
                  let startpoint = response.rows[i];
                  let endpoint = response.rows[i + 1];
                  let direction = getbearing(
                     response.rows[i].latitude,
                     response.rows[i].longitude,
                     response.rows[i + 1].latitude,
                     response.rows[i + 1].longitude
                  );
                  let speed = computespeed(startpoint, endpoint);
                  let time = moment(response.rows[i].time).format(
                     "YYYYMMDDTHHmmss"
                  );
                  directionlist.push({ direction, speed, time });
               }

               var returnValues = {};
               // returnValues["points"] = rescount;
               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["values"] = directionlist;
               res.send(returnValues);
               console.log(">>> 200 OK  (direction)");
            } else {
               //if no response
               res.send("{}");
               console.log("{}");
               console.log(">>> 200 OK  (direction)");
            }
         })
         .catch((e) => {
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error");
            console.log(e.stack);
         }); //client.query
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

/* GET Retrieve Types
 * 7. 기간별 이동 경로 조회
 * 설명 : 디바이스의 아이디를 통해 기간 내 디바이스의 이동 경로 조회
 * localhost:7979/location/:deviceID/:containerName/trajectory?from={startDateTime}&to={endDateTime}
 */
app.get("/location/:deviceID/:containerName/trajectory", (req, res) => {
   if (
      req.params.deviceID &&
      req.params.containerName &&
      req.query.from &&
      req.query.to
   ) {
      let { deviceID, containerName } = req.params;
      var startdatetime = moment(req.query.from).format("YYYY-MM-DD HH:mm:ss");
      var enddatetime = moment(req.query.to).format("YYYY-MM-DD HH:mm:ss");
      sql =
         "select * from (select * from spatio where ae='" +
         deviceID +
         "' and container='" +
         containerName +
         "' ) as aevalue where time  between '" +
         startdatetime +
         "' and '" +
         enddatetime +
         "' order by time asc";
      console.log(sql);
      client
         .query(sql)
         .then((response) => {
            if (response.rowCount) {
               var returnValues = {};
               var trajectory = [];

               for (var index in response.rows) {
                  let latitude = response.rows[index].latitude;
                  let longitude = response.rows[index].longitude;
                  let altitude = response.rows[index].altitude;
                  var time = moment(response.rows[index].time).format(
                     "YYYYMMDDTHHmmss"
                  );
                  trajectory.push({
                     location: { latitude, longitude, altitude },
                     time,
                  });
               } //for
               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["trajectory"] = trajectory;
               res.send(returnValues);
               console.log(">>> 200 OK  (trajectory)");
            } else {
               //if no response
               res.send("{}");
               console.log("{}");
               console.log(">>> 200 OK  (trajectory)");
            }
         })
         .catch((e) => {
            console.log(e.stack);
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error");
         }); //client.query
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

/* GET Retrieve Types
 * 1. 최신 센서 데이터 조회
 * 설명 : 특정 디바이스의 아이디를 통해 최신 센서 데이터 조회
 * localhost:7979/timeseries/:deviceID/:containerName/latest
 */
app.get("/timeseries/:deviceID/:containerName/latest", (req, res) => {
   if (req.params.deviceID && req.params.containerName) {
      let { deviceID, containerName } = req.params;
      sql =
         `select * from ` +
         deviceID +
         ` where container = '` +
         containerName +
         `' order by desc limit 1`;
      console.log(sql);
      influx
         .query(sql)
         .then((result) => {
            if (result[0]) {
               var returnValues = {};

               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["time"] = moment(result[0].time).format(
                  "YYYYMMDDTHHmmss"
               );
               delete result[0].time;
               delete result[0].container;
               returnValues["values"] = result[0];
               res.send(returnValues);
               console.log(">>> 200 OK  (latest - Timeseries)");
            } else {
               //if no response
               res.send("{}");
               console.log("{}");
               console.log(">>> 200 OK  (latest - Timeseries)");
            }
         })
         .catch((err) => {
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error", err);
         });
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

/* GET Retrieve Types
 * 2. 기간별 센서 데이터 조회
 * 설명 : 특정 디바이스가 일정 기간 내 생성한 센서 데이터 조회
 * localhost:7979/timeseries/:deviceID/:containerName/period?from={startDateTime}&to={endDateTime}
 */
app.get("/timeseries/:deviceID/:containerName/period", (req, res) => {
   res.set({ "access-control-allow-origin": "*" });
   if (
      req.params.deviceID &&
      req.params.containerName &&
      req.query.from &&
      req.query.to
   ) {
      let { deviceID, containerName } = req.params;
      var startdatetime = moment(req.query.from) / 0.000001;
      var enddatetime = moment(req.query.to) / 0.000001;
      sql =
         `select * from ` +
         deviceID +
         ` where time >= ` +
         startdatetime +
         ` and time <= ` +
         enddatetime +
         ` and container = '` +
         containerName +
         `'`;

      console.log(sql);
      influx
         .query(sql)
         .then((result) => {
            if (result[0]) {
               var returnValues = {};
               var value = {};
               var values = [];
               for (var index = 0; index < result.length; index++) {
                  var time = moment(result[index].time).format(
                     "YYYYMMDDTHHmmss"
                  );
                  delete result[index].time;
                  delete result[index].container;
                  value = result[index];
                  values.push({ time, value });
               }

               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["values"] = values;
               res.send(returnValues);
               console.log(">>> 200 OK  (period)");
            } else {
               //if no response
               res.send("{}");
               console.log("{}");
               console.log(">>> 200 OK (period)");
            }
         })
         .catch((err) => {
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error", err);
         });
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

/* GET Retrieve Types
 * 3. 일간 평균값 조회
 * 설명 : 특정 디바이스가 생성한 일간 센서 데이터의 평균값 조회
 * localhost:7979/timeseries/:deviceID/:containerName/average?date={Date}
 */
app.get("/timeseries/:deviceID/:containerName/average", (req, res) => {
   if (req.params.deviceID && req.params.containerName && req.query.date) {
      let { deviceID, containerName } = req.params;
      var startdatetime = moment(req.query.date) / 0.000001;
      var enddatetime = startdatetime + 86399999999000;

      sql =
         `select mean(*) from ` +
         deviceID +
         ` where container = '` +
         containerName +
         `' and time >= ` +
         startdatetime +
         ` and time <= ` +
         enddatetime +
         ``;
      console.log(sql);

      var values = [];
      influx
         .query(sql)
         .then((result) => {
            if (result[0]) {
               var returnValues = {};

               delete result[0].time;
               values.push(result[0]);

               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["values"] = values;
               res.send(returnValues);
               console.log(">>> 200 OK  (average)");
            } else {
               //if no response
               res.send("{}");
               console.log("{}");
               console.log(">>> 200 OK  (average)");
            }
         })
         .catch((err) => {
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error", err);
         });
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

/* GET Retrieve Types
 * 4. 일간 최소값 조회
 * 설명 : 특정 디바이스가 생성한 일간 센서 데이터의 최소값 조회
 * localhost:7979/timeseries/:deviceID/:containerName/min?date={Date}
 */
app.get("/timeseries/:deviceID/:containerName/min", (req, res) => {
   if (req.params.deviceID && req.params.containerName && req.query.date) {
      let { deviceID, containerName } = req.params;
      var startdatetime = moment(req.query.date) / 0.000001;
      var enddatetime = startdatetime + 86399999999000;

      sql =
         `select min(*) from ` +
         deviceID +
         ` where container = '` +
         containerName +
         `' and time >= ` +
         startdatetime +
         ` and time <= ` +
         enddatetime +
         ``;
      console.log(sql);

      var values = [];
      influx
         .query(sql)
         .then((result) => {
            if (result[0]) {
               var returnValues = {};

               delete result[0].time;
               values.push(result[0]);

               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["values"] = values;
               res.send(returnValues);
               console.log(">>> 200 OK  (min)");
            } else {
               //if no response
               res.send("{}");
               console.log("{}");
               console.log(">>> 200 OK  (min)");
            }
         })
         .catch((err) => {
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error", err);
         });
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

/* GET Retrieve Types
 * 5. 일간 최대값 조회
 * 설명 : 특정 디바이스가 생성한 일간 센서 데이터의 최대값 조회
 * localhost:7979/timeseries/:deviceID/:containerName/max?date={Date}
 */
app.get("/timeseries/:deviceID/:containerName/max", (req, res) => {
   if (req.params.deviceID && req.params.containerName && req.query.date) {
      let { deviceID, containerName } = req.params;
      var startdatetime = moment(req.query.date) / 0.000001;
      var enddatetime = startdatetime + 86399999999000;

      sql =
         `select max(*) from ` +
         deviceID +
         ` where container = '` +
         containerName +
         `' and time >= ` +
         startdatetime +
         ` and time <= ` +
         enddatetime +
         ``;
      console.log(sql);

      var values = [];
      influx
         .query(sql)
         .then((result) => {
            if (result[0]) {
               var returnValues = {};

               delete result[0].time;
               values.push(result[0]);

               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["values"] = values;
               res.send(returnValues);
               console.log(">>> 200 OK  (max)");
            } else {
               //if no response
               console.log("{}");
               res.send("{}");
               console.log(">>> 200 OK  (max)");
            }
         })
         .catch((err) => {
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error", err);
         });
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

//누적값을 sum으로
/* GET Retrieve Types
 * 6. 일간 누적합 조회
 * 설명 : 특정 디바이스가 생성한 일간 센서 데이터의 누적합 조회
 * localhost:7979/timeseries/:deviceID/:containerName/cumsum?date={Date}
 */
app.get("/timeseries/:deviceID/:containerName/cumsum", (req, res) => {
   if (req.params.deviceID && req.params.containerName && req.query.date) {
      let { deviceID, containerName } = req.params;
      var startdatetime = moment(req.query.date) / 0.000001;
      var enddatetime = startdatetime + 86399999999000;
      //console.log(`deviceID = ${deviceID}, containerName = ${containerName}, from = ${startdatetime}, to = ${enddatetime}`);

      sql =
         `select sum(*) from ` +
         deviceID +
         ` where container = '` +
         containerName +
         `' and time >= ` +
         startdatetime +
         ` and time <= ` +
         enddatetime +
         ``;
      console.log(sql);

      var values = [];
      influx
         .query(sql)
         .then((result) => {
            if (result[0]) {
               var returnValues = {};

               delete result[0].time;
               values.push(result[0]);

               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["values"] = values;
               res.send(returnValues);
               console.log(">>> 200 OK  (cumsum)");
            } else {
               //if no response
               console.log("{}");
               res.send("{}");
               console.log(">>> 200 OK  (cumsum)");
            }
         })
         .catch((err) => {
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error", err);
         });
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});

app.post("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});
//}

app.all("/*", function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header(
      "Access-Control-Allow-Headers",
      "X-Requested-With, Authorization, Content-Type, X-Platform, X-Version"
   );
   res.header(
      "Access-Control-Allow-Methods",
      "POST, GET, PUT, PATCH, DELETE, OPTIONS"
   );
   res.header("Access-Control-Expose-Headeras", "Content-Disposition");
   if (req.method == "OPTIONS") {
      return res.status(200).end();
   }
   next();
});

app.use(cors());
