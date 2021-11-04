
  function getDistanceFromLatLonInKm(array1, array2)
  {
    var lat1 = array1.latitude
    var lng1 = array1.longitude
    var lat2 = array2.latitude
    var lng2 = array2.longitude

    function deg2rad(deg)
    {
        return deg * (Math.PI/180);
    }
    var r = 6371; //지구의 반지름(km)
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lng2-lng1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = r * c; // Distance in km
    return Math.round(d*1000);
  }

  function gettimediff(startpoint, endpoint)
  {
    let starttime = moment(startpoint.creationtime).format("YYYY-MM-DD HH:mm:ss");
    let endtime = moment(endpoint.creationtime).format("YYYY-MM-DD HH:mm:ss");
    let timediffvalue = (moment(endtime).diff(moment(starttime)))/1000
    return timediffvalue;
  }

  function computespeed (startpoint, endpoint)
  {
    let timediff = gettimediff(startpoint, endpoint)
    let distancediff = getDistanceFromLatLonInKm(startpoint, endpoint)
    if(distancediff == 0){
      tspeed = 0;
    }else{
      tspeed = timediff / distancediff;
    }
    return tspeed;
  } 

  /* GET Retrieve Types    
  * 5. 디바이스 누적 평균 이동 속도 조회
  * 설명 : 디바이스의 아이디를 통해 기간 내 디바이스의 이동 속력 평균값 조회
  * localhost:7979/location/:deviceID/:containerName/speed?from={startDateTime}&to={endDateTime}
  */
  app.get("/location/:deviceID/:containerName/speed", (req, res) => {
    let {deviceID, containerName} = req.params;

    if(!req.params.deviceID && !req.query.from && !req.query.to) {
      res.status(400).send("Bad Request");
      console.log("input value error")
    }

    var startdatetime = moment(req.query.from).format('YYYY-MM-DD HH:mm:ss');
    var enddatetime = moment(req.query.to).format('YYYY-MM-DD HH:mm:ss');
    console.log(`deviceID = ${deviceID}, containerName = ${containerName}, from = ${startdatetime}, to = ${enddatetime}`);
    sql = "select * from (select * from spatio where ae='"+ deviceID +"') as aevalue where creationtime  between '"+ startdatetime +"' and '"+ enddatetime +"' order by creationtime"
    
    // 등록된 Object가 없을 경우 
    client.query("SELECT * FROM spatio WHERE ae= '" + deviceID + "'")
    .then(response => {
      //console.log(response.rows)
      if(!response.rowCount) 
      {
        res.status(400).send("No Object"); //Why 204 doesn't message pop up
        console.log("No Object")
      }
      else
      { 
        client.query(sql).then(response =>{
          console.log(sql)
          //console.log(response.rows)
          var rescount = response.rowCount
          if(rescount)
          {	
            let speedsum = 0
            for(i=0; i<rescount-1; i++)
            {
              let startpoint = response.rows[i];
              let endpoint = response.rows[i+1];
              //console.log("startpoint:", response.rows[i])
              //console.log("endpoint:", response.rows[i+1])
              
              speedsum += computespeed(startpoint, endpoint)
      
            }
            
            let speedaverage = speedsum / (rescount-1);
            
            var returnValues = {};
            returnValues['deviceID'] = deviceID;
            returnValues['container'] = containerName;
            returnValues['speed'] = speedaverage;
            //returnValues['points'] = rescount; 
            res.send(returnValues);
            //console.log(returnValues);
            console.log(">>> 200 OK");	   
          }else
          {
            console.log("이동거리 없음");
            res.send("{}");  
            console.log(">>> 200 OK ");   
          }
        })
      }

    }).catch(e => {
      console.log(e.stack)
      res.status(500).send("Internal Server Error");
      console.log(">>> 500 Internal Server Error");
    })
  })

