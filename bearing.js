//https://jsfiddle.net/efwjames/NVhg6/
/*
//stop location - the radii end point
var x1 = 44.9631;
var y1 = -93.2492;

//bus location from the southeast - the circle center
var x2 = 44.95517;
var y2 = -93.2427;

var radians = getAtan2((y1 - y2), (x1 - x2));

function getAtan2(y, x) {
    return Math.atan2(y, x);
}

$("#output").text(radians);
var newdeg = radians * (180 / Math.PI);

$("#deg").append(newdeg);

var coordNames = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
var directionid = Math.round(newdeg / 45);
if (directionid < 0) {
    directionid = directionid + 8;
}

$("#dir").append("The vehicle is moving " + coordNames[directionid]);
*/

//https://tttsss77.tistory.com/177
/*decimal degree -> radian*/
function convertdecimaldegreestoradians(deg){
	return (deg * Math.PI / 180)
}
/*decimal radian -> degree*/
function convertradianstodecimaldegrees(rad){
	return (rad * 180 / Math.PI)
}

/*bearing*/
function getbearingbetweenpoints(lat1, lon1, lat2, lon2){
	let lat1_rad = convertdecimaldegreestoradians(lat1)
	let lat2_rad = convertdecimaldegreestoradians(lat2)
	let lon_diff_rad = convertdecimaldegreestoradians(lon2-lon1)
	let y = Math.sin(lon_diff_rad) * Math.cos(lat2_rad)
	let x = Math.cos(lat1_rad) * Math.sin(lat2_rad) - Math.sin(lat1_rad) * Math.cos(lat2_rad) * Math.cos(lon_diff_rad)

	return (convertradianstodecimaldegrees(Math.atan2(y,x)) + 360) % 360
	
}

//console.log(getbearingbetweenpoints(35.106, 129.096, 35.107, 129.097));



// Converts from degrees to radians.
function toRadians(degrees) {
	return degrees * Math.PI / 180;
  };
   
  // Converts from radians to degrees.
  function toDegrees(radians) {
	return radians * 180 / Math.PI;
  }
  
  
  function bearing(startLat, startLng, destLat, destLng){
	startLat = toRadians(startLat);
	startLng = toRadians(startLng);
	destLat = toRadians(destLat);
	destLng = toRadians(destLng);
  
	y = Math.sin(destLng - startLng) * Math.cos(destLat);
	x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
	brng = Math.atan2(y, x);
	brng = toDegrees(brng);
	return (brng + 360) % 360;
  }



console.log(Math.atan2(-3, 4))

/* 수식화 */
(
    (
        (Math.atan2(
            Math.sin((currentLongitude-previousLongitude) * Math.PI / 180) * Math.cos(currentLatitude * Math.PI / 180), Math.cos(previousLatitude * Math.PI / 180) * Math.sin(currentLatitude * Math.PI / 180) - Math.sin(previousLatitude * Math.PI / 180) * Math.cos(currentLatitude * Math.PI / 180) * Math.cos((currentLongitude-previousLongitude) * Math.PI / 180)
            )        
        ) * 180/ Math.PI
    )+ 360
) % 360

/* EXCEL */
=IF(OR(OR(L4=" null",M4=" null"),N4=" null"),"null",MOD(
        (
            ATAN2(
                COS(previousLatitude*PI()/180)*SIN(currentLatitude*PI()/180)-SIN(previousLatitude*PI()/180)*COS(currentLatitude*PI()/180)*COS((currentLongitude-previousLongitude)*PI()/180),
                SIN((currentLongitude-previousLongitude)*PI()/180)*COS(currentLatitude*PI()/180)
            )*180/PI()
        )+360
,360))
