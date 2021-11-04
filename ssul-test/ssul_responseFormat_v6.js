/*
 * push 시 한 개만 들어가는 문제
 */
 
const moment = require('moment');

function responseFormat(){
	var response = 
		{rows: 
			[
				{
					deviceid: 'ae_notitest1',
					container: 'cnt_notitest',
					latitude: '37.41134992',
					longitude: '127.12919503',
					altitude: 'null',
					// time: '2020-06-17T05:11:59.000Z', // 주석처리 해서 실행해보고, 주석 제거해서 실행해봐
					ct: '2020-06-17T05:12:27'
				},
				{
					deviceid: 'ae_notitest2',
					container: 'cnt_notitest',
					latitude: '37.41134992',
					longitude: '127.12919503',
					altitude: 'null',
					// time: '2020-06-17T05:11:59.000Z',
					ct: '2020-06-17T05:12:27'
				},
				{
					deviceid: 'ae_notitest3',
					container: 'cnt_notitest',
					latitude: '37.41134992',
					longitude: '127.12919503',
					altitude: 'null',
					// time: '2020-06-17T05:11:59.000Z',
					ct: '2020-06-17T05:12:27'
				}
			],
			rowCount: 3
		};
	
	if (response.rowCount) {
	//	var devices = [];    //배열 모두 출력
		
        for (var index in response.rows) {
			var {deviceid, container, latitude, longitude, altitude, time, ct} = response.rows[index];
			
			if (!time) {
				time = ct;
			}
			var Time = moment(time).format('YYYY-MM-DDTHH:mm:ss');
	//		var devices = [];	//배열의 마지막값만 출력
			var parseresponse = {
				deviceid,
				container,
				location: {
					latitude,
					longitude,
					altitude
				},
				Time
			};
			devices.push(parseresponse);
		}
		console.log(devices);
	}
}

var response = responseFormat();