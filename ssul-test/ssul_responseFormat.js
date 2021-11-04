function responseFormat(){
	var deviceid = "ae_notitest2",
		container = "cnt_notitest",
		latitude = "37.41134992",
		logitude = "127.12919503",
		altitude = "null",
		time = "2020-06-17T05:11:59.000Z";
		
	return {deviceid, container, location: {latitude, logitude, altitude}, creationTime: time};
}

var response = responseFormat();
console.log(response);