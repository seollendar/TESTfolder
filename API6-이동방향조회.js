
  /* GET Retrieve Types    
  * 6. 기간별 이동 경로 조회
  * 설명 : 디바이스의 아이디를 통해 기간 내 디바이스의 이동 방향 조회
  * localhost:7979/location/:deviceID/:containerName/direction?from={startDateTime}&to={endDateTime}
  */
  function convertdecimaldegreestoradians(deg){
    return (deg * Math.PI / 180)
  }
  /*decimal radian -> degree*/
  function convertradianstodecimaldegrees(rad){
    return (rad * 180 / Math.PI)
  }

  /*bearing*/
  function getbearing(lat1, lon1, lat2, lon2){
    let lat1_rad = convertdecimaldegreestoradians(lat1)
    let lat2_rad = convertdecimaldegreestoradians(lat2)
    let lon_diff_rad = convertdecimaldegreestoradians(lon2-lon1)
    let y = Math.sin(lon_diff_rad) * Math.cos(lat2_rad)
    let x = Math.cos(lat1_rad) * Math.sin(lat2_rad) - Math.sin(lat1_rad) * Math.cos(lat2_rad) * Math.cos(lon_diff_rad)
    return (convertradianstodecimaldegrees(Math.atan2(y,x)) + 360) % 360
  }

  app.get("/location/:deviceID/:containerName/direction", (req, res) => {
    let {deviceID, containerName} = req.params;

    if(!req.params.deviceID && !req.query.from && !req.query.to) {
      res.status(400).send("Bad Request");
      console.log("input value error")
    }
    var startdatetime = moment(req.query.from).format('YYYY-MM-DD HH:mm:ss');
    var enddatetime = moment(req.query.to).format('YYYY-MM-DD HH:mm:ss');
    console.log(`deviceID = ${deviceID}, containerName = ${containerName}, from = ${startdatetime}, to = ${enddatetime}`);
    sql = "select * from (select * from spatio where ae='" + deviceID + "') as aevalue where creationtime  between '"+ startdatetime +"' and '"+ enddatetime +"' order by creationtime asc"
  
    //testRunTimer()

    client.query(sql)
    //console.log(sql)
    .then(response => {
      var rescount = response.rowCount
      if(rescount){	
        var directionlist = [];
        for(i=0; i<rescount-1; i++)
        {
          let startpoint = response.rows[i];
          let endpoint = response.rows[i+1];
          let direction = getbearing(response.rows[i].latitude, response.rows[i].longitude, response.rows[i+1].latitude, response.rows[i+1].longitude);
          let speed = computespeed (startpoint, endpoint);
          let time = moment.utc(response.rows[i].creationtime).format('YYYYMMDDTHHmmss');
          directionlist.push({direction, speed, time}) 
        }
        //console.log("directionlist", directionlist)	
        var returnValues = {};
        returnValues['points'] = rescount;
        returnValues['deviceID'] = deviceID;
        returnValues['container'] = containerName;
        returnValues['values'] = directionlist;
        res.send(returnValues);
        //console.log(returnValues);
        console.log(">>> 200 OK");	

        //testRunTimer()
          
      }else{//if no response
        console.log("{}");
        res.send("{}");  
        console.log(">>> 200 OK");   
      }
      }).catch(e => {
      console.log(e.stack)
      res.status(500).send("Internal Server Error");
      console.log(">>> 500 Internal Server Error");
      })//client.query
  })
