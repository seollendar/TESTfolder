/*
 * progresql에서 조회한 데이터 response의 내용들 rows 중
 * 디바이스 별로 JSON 형식을 갖춰 반환한다.
 * 이때, 디바이스가 서버로 정보를 전송할 때의 시간인 time이 Mobius에 저장된 ct 보다 우선된다.
 * 디바이스(time) -> app.js API를 이용하여 위치 정보 전송 -> mobius 저장(ct생성) -> progresql에 해당 device의 위치 정보를 time과 ct 동시 저장.
 * time은 최초로 디바이스가 자신의 위치 정보를 전송할 때의 시간, ct는 mobius에 저장되었을 때의 시간
 */

var results = [];

for(var index in response.rows){
	var {deviceid, container, latitude, longitude, altitude, time, ct} = response.rows[index];
	
	/* time이 undefined라면 ct 값을 time에 넣음.
	 * ct는 무조건 있다는 조건 하에 짜여진 코드임. */
	if(!time)
		time = ct;
	
	var result = {deviceid, container, location: {latitude, longitude, altitude}, creationTime: time};
	results.push(result);
}

res.send(results);