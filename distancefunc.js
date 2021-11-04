//https://aljjabaegi.tistory.com/431
//const moment = require('moment');

const sp = {
  ae: 'S01228423177',
  container: 'scnt-location',
  latitude: '35.1017952',
  longitude: '129.0957489',
  altitude: '11.324',
  velocity: '10',
  direction: '178',
  time: 1630195200020000000,
  gps: '0101000020E610000071BE22090C236040FD5BB862358C4140'
}  
const ep = {
  ae: 'S01228423177',
  container: 'scnt-location',
  latitude: '35.1017952',
  longitude: '129.0957489',
  altitude: '11.345',
  velocity: '9',
  direction: '177',
  time: 1630195200040000000,//2021-04-01 02:00:17
  gps: '0101000020E61000000CB1FA230C23604027C7F88B348C4140'
} 

function getDistanceFromLatLonInKm(array1, array2) {
    var lat1 = array1[0]
    var lng1 = array1[1]
    var lat2 = array2[0]
    var lng2 = array2[1]
	
    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }
    var r = 6371; //지구의 반지름(km)
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lng2-lng1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = r * c; // Distance in km
	
	//console.log(Math.round(d*1000));
    return Math.round(d*1000);
	
}

//getDistanceFromLatLonInKm(['37.416300', '127.131569'], ['37.415770', '127.132516']);
//console.log(getDistanceFromLatLonInKm())



//단위: m
function distance(lat1, lon1, lat2, lon2) { 
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  console.log(12742 * Math.asin(Math.sqrt(a))*1000)// 2 * R; R = 6371 km
  return (12742 * Math.asin(Math.sqrt(a))*1000)
}  
//d3 = distance(35.102817, 129.097101, 35.102817, 129.097103);
//d1 = distance(35.106679, 129.096754, 35.107679, 129.096754);
//d2 = distance(35.102817, 129.097102, 35.102817, 129.097103);
//console.log("d1: ", d1);

function acomputespeed() {
 
  let timediff = 1; //s

  let distancediff = 110.927116518254; //m

  if (distancediff == 0) {
	 tspeed = 0;
  } else {
         tspeed = distancediff / timediff;
  }
  console.log(tspeed, " ts*3.6 ", tspeed*3.6);
}
//acomputespeed();

//단위: m
function distanceM(start_point, end_point) {
  var lat1 = start_point.latitude;
  var lng1 = start_point.longitude;
  var lat2 = end_point.latitude;
  var lng2 = end_point.longitude;

  var p = 0.017453292519943295; // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lng2 - lng1) * p))) / 2;
  return 12742 * Math.asin(Math.sqrt(a)) * 1000;
}


//단위: second
function gettimediff(startpoint, endpoint) {
  let starttime = moment(startpoint.time).format("YYYY-MM-DD HH:mm:ss.SSS"); 
  let endtime = moment(endpoint.time).format("YYYY-MM-DD HH:mm:ss.SSS");
  let timediffvalue = moment(endtime).diff(moment(starttime)) / 1000;
  console.log("st: ", starttime," et: ", endtime," td: ", timediffvalue);
  return timediffvalue;
}
/*
//단위: minute
function gettimediff(startpoint, endpoint) {
  let starttime = moment(startpoint.time).format("YYYY-MM-DD HH:mm:ss.SSS"); 
  let endtime = moment(endpoint.time).format("YYYY-MM-DD HH:mm:ss.SSS");
  let timediffvalue = moment(endtime).diff(moment(starttime)) * 3.6;
  console.log("st: ", starttime," et: ", endtime," td: ", timediffvalue);
  return timediffvalue;
}


//단위: km
function distance(start_point, end_point) {
  var lat1 = start_point.latitude;
  var lng1 = start_point.longitude;
  var lat2 = end_point.latitude;
  var lng2 = end_point.longitude;

  var p = 0.017453292519943295; // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lng2 - lng1) * p))) / 2;
  return 12742 * Math.asin(Math.sqrt(a));
}
*/

// (m/s)
function computespeed(startpoint, endpoint) {
 
  //let timediff = gettimediff(startpoint, endpoint); //s
  let timediff = endpoint.time - startpoint.time;
  let distancediff = distance(startpoint.latitude, startpoint.longitude, endpoint.latitude, endpoint.longitude); //m  distance(lat1, lon1, lat2, lon2)

  if (distancediff == 0) {
	 tspeed = 0;
  } else {
         tspeed = distancediff / timediff;
  }
  console.log(" sp ", startpoint," ep ", endpoint," td ", timediff," dd ", distancediff," ts ", tspeed, " ts*3.6 ", tspeed*3.6);
  return tspeed;
}
computespeed(sp, ep);
//console.log(moment(sp.time).format("YYYYMMDDTHHmmss.SSS"));

/* 
td  1  
dd  3.0757060649730277  
ts  0.325128597751349
*/
/*30min = 1600072234000-1600070434000=1800000
//code에 넣은 함수.
function distance(start_point, end_point) {
	var lat1 = start_point.latitude
	var lng1 = start_point.longitude
	var lat2 = end_point.latitude
	var lng2 = end_point.longitude
		
	var p = 0.017453292519943295;    // Math.PI / 180
	var c = Math.cos;
	var a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lng2 - lng1) * p))/2;

	//console.log(Math.round(12742 * Math.asin(Math.sqrt(a))*1000))// 2 * R; R = 6371 km
	return Math.round(12742 * Math.asin(Math.sqrt(a))*1000)
}  */