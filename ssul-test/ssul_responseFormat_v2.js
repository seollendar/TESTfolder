function responseFormat(){
	// var deviceid = "ae_notitest2",
		// container = "cnt_notitest",
		// latitude = "37.41134992",
		// longitude = "127.12919503",
		// altitude = "null",
		// time = "2020-06-17T05:11:59.000Z";

	var response = 
		{rows: 
			[{
				deviceid: 'ae_notitest2',
				container: 'cnt_notitest',
				latitude: '37.41134992',
				longitude: '127.12919503',
				altitude: 'null',
				time: '2020-06-17T05:11:59.000Z'
			}]
		};
		
	// console.log(response.rows[0]);
	
	var {deviceid, container, latitude, longitude, altitude, time} = response.rows[0];
	
	return {deviceid, container, location: {latitude, longitude, altitude}, creationTime: time};
}

var response = responseFormat();
console.log(response);