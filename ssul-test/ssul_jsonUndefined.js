var response = 
	{rows: 
		[{
			deviceid: 'ae_notitest2',
			container: 'cnt_notitest',
			latitude: '37.41134992',
			longitude: '127.12919503',
			altitude: 'null',
			//time: '2020-06-17T05:11:59.000Z', // 주석처리 해서 실행해보고, 주석 제거해서 실행해봐
			ct: '2020-06-17T05:12:27'
		}]
	};
	
var {deviceid, container, latitude, longitude, altitude, time, ct} = response.rows[0];

// expected output: undefined
console.log({time});

if(time){
	console.log(`time is defined. the value = ${time}`);
} else {
	console.log({ct});
}
/*
if(!time){
	console.log(`time is undefined 2.`);
}
*/
