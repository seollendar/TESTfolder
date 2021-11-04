app.post("/noti_for_fastdata", (req, res)=>{
  	var fullBody = '';
 	req.on('data', function(chunk) {
    	fullBody += chunk; 
	});
	
  	req.on('end', function() {
    	console.log(fullBody);
		var jsonbody = JSON.parse(fullBody)


		if(jsonbody['m2m:sgn'].nev.rep['m2m:cin'] && req.headers['content-location']){
			let cinContents = jsonbody['m2m:sgn'].nev.rep['m2m:cin'].con;
			let resources =  req.headers['content-location'].split('/');
			console.log (resources);
			let ae  = resources [4];
			let container  = resources [5];
		
			if(container = 'location'){
				sendToPostgresql({cinContents}, ae, container);
				
			}else if(container = 'temperature'){
				sendToInfluxdb({cinContents}, ae, container);		
			}


		}else{
			console.log("Receive other notification message (Not exists content-location)")
			res.status(400).send("Bad Request");
			return;
		}   
    
	});
	
	
	function sendToPostgresql(cinContents, ae, container){
	// param으로 cinContents를 받아서 postgresql에 저장할 데이터 형식을 맞춰서 저장 요청
		if(cinContents.lat && cinContents.lng && cinContents.alt){
			let wtimeUTC;

			if(cinContents.wtime){
				let wtime = cinContents.wtime; //epochtime
				let utcTime = moment.utc(wtime); //epochtime To UTCzero
				wtimeUTC = utcTime.format('YYYY-MM-DD HH:mm:ss');
			}else{
				let ct = jsonbody['m2m:sgn'].nev.rep['m2m:cin'].ct;
				wtimeUTC = moment(ct).format('YYYY-MM-DD HH:mm:ss');
			}
			
			let cinContentsData = {
			"ae": ae,
			"container": container,
			"lat": cinContents.lat,
			"lng": cinContents.lng,
			"alt": cinContents.alt,
			"time": wtimeUTC
			}
		
			let saveDataQuery = 'INSERT INTO cincontentsdb (ae, container, latitude, longitude, altitude, creationtime, gps)' +
								' values (\''+ ae + '\',\''+ container + '\', \'' + cinContentsData.lat + '\', \'' + cinContentsData.lng + '\', \'' + cinContentsData.alt + '\', \'' + cinContentsData.time + '\', ST_SetSRID(ST_MakePoint('+parseFloat(cinContentsData.lng)+','+parseFloat(cinContentsData.lat)+'),4326))';
		
			console.log (saveDataQuery);
			client.query (saveDataQuery)
			.then (result =>{
				res.status (200 ).send ('Received Location Data');
				console.log (">>> Send Response, 200");
			}).catch (e =>{
				res.status (500 ).send ('Internal Error');
				console .log (e .stack );
			})
		 
		}else{
			console.log("Receive other notification message (NOT EXIST location data)")
			res.status(400).send("Bad Request");
			return;
		}
	}
	
	function sendToInfluxdb(cinContents, ae, container){
		
      if(cinContents.lat && cinContents.lng && cinContents.alt && cinContents.wtime && cinContents.temperature){
         
         let wtime = cinContents.wtime; //epochtime 
         let cinContentsData = {
           "lat": cinContents.lat,
           "lng": cinContents.lng,
           "alt": cinContents.alt,
           "temperature" : cinContents.temperature
         }
     
         influx.writePoints([
            { measurement: ae,
            tags: { cnt: container },
            fields: cinContentsData, 
            timestamp: wtime }
         ], {
            precision: 'ms',
            //database: 'test',
         }).then (result =>{
             res.status (200).send ('Received Location Data');
             console.log (">>> Send Response, 200");
           }).catch (e =>{
             res.status (500).send ('Internal Error');
             console .log (e .stack );
           }) 

      }else{
      console.log("Receive other notification message (NOT CIN)")
      return;
      }	  
	}
	
})




api receive (request){   
   var {deviceID, container, latitude, longitude, altitude, time} = request.body;
   
   // 유효성 검사 - 1. key-value 페어가 있는지 확인
   if(latitude && longitude && altitude){
      // 2. GPS 데이터가 유효한지 확인
      if(checkGPS){
         // GPS 데이터가 유효할 경우
         // send to influxdb & postgresql
         await Promise.all([sendToInfluxdb({...request.body}),
                        sendToPostgresql({...request.body}).catch(err => {console.warn('postgresql error'); return 0;})]).then(results => {
            
            if(results[0]){
               // influxdb 저장 성공
            }
            
            if(results[1]){
               // postgresql 저장 성공
            }
         }).catch(err => {
            console.warn(`Fail! something wrong !! err: ${err}`);
         });
         
      } else {
         // 유효하지 않을 경우
         // return error 메세지
      }
      
   }
   
   function checkGPS(lat, lng, alt){
      if(124 <= lat && lat <= 132 && 33 <= lng && lng <= 43)
         return true;
      else
         return false;
   }
   
   function sendToInfluxdb(data){
      // param으로 data를 받아서 influxdb에 저장할 데이터 형식을 맞춰서 저장 요청
      var requestBodyToInflux = `insert ${data.deviceID}, ...`;
      
      return Promise(/* influxdb 데이터 저장 요청 */).catch(err => {
         console.warn('influx error');
         return 0;
      });
   }
   
   function sendToPostgresql(data){
      // param으로 data르 받아서 postgresql에 저장할 데이터 형식을 맞춰서 저장 요청
   }
}