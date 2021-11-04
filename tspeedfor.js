const moment = require('moment');

var devices = [
  {
    ae: 'yt1',
    container: 'location',
    latitude: '37.411881',
    longitude: '127.128729',
    altitude: '277.3',
    time: "2020-07-15 13:00:01"
  },
  {
    ae: 'yt1',
    container: 'location',
    latitude: '37.412327',
    longitude: '127.128741',
    altitude: '277.3',
    time: "2020-07-15 13:00:02"
  },
  {
    ae: 'yt1',
    container: 'location',
    latitude: '37.412836',
    longitude: '127.128724',
    altitude: '277.3',
    time: "2020-07-15 13:00:03"
  }
]
//console.log(devices.length)

//소수점 15자리 수까지 계산한 거리
function distance(array1, array2){ 
  var lat1 = array1.latitude
  //console.log(lat1)
  var lng1 = array1.longitude
  //console.log(lng1)
  var lat2 = array2.latitude
  //console.log(lat2)
  var lng2 = array2.longitude
  //console.log(lng2)
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lng2 - lng1) * p))/2;

  console.log("function distance: ", 12742 * Math.asin(Math.sqrt(a))*1000)// 2 * R; R = 6371 km
  return (12742 * Math.asin(Math.sqrt(a))*1000);
}

//소수점을 반올림한 거리
function getDistanceFromLatLonInKm(array1, array2) {
  var lat1 = array1.latitude
  //console.log(lat1)
  var lng1 = array1.longitude
  //console.log(lng1)
  var lat2 = array2.latitude
  //console.log(lat2)
  var lng2 = array2.longitude
  //console.log(lng2)

  function deg2rad(deg) {
      return deg * (Math.PI/180)
  }
  var r = 6371; //지구의 반지름(km)
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lng2-lng1);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = r * c; // Distance in km
  console.log("d: ",d, "math: ",Math.round(d*1000)); //단위: m
  return Math.round(d*1000);
  
}

let result = 0
for(var i=0; i<devices.length-1; i++){
	let timediff = (moment(devices[i+1].time).diff(moment(devices[i].time)))/1000
	console.log("timediff:", timediff)
	let distancediff = distance(devices[i], devices[i+1])
	console.log("distancediff:", distancediff)
	let tspeed = distancediff / timediff;
	
	console.log("tspeed: ", tspeed) // m/s
	result += tspeed;   
	
}
console.log("result", result)	