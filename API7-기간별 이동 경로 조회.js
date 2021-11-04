
  /* GET Retrieve Types    
  * 7. 기간별 이동 경로 조회
  * 설명 : 디바이스의 아이디를 통해 기간 내 디바이스의 이동 경로 조회
  * localhost:7979/location/:deviceID/:containerName/trajectory?from={startDateTime}&to={endDateTime}
  */
  app.get("/location/:deviceID/:containerName/trajectory", (req, res) => {
    let {deviceID, containerName} = req.params;

    if(!req.params.deviceID && !req.query.from && !req.query.to) {
      res.status(400).send("Bad Request");
      console.log("input value error")
    }

    var startdatetime = moment(req.query.from).format('YYYY-MM-DD HH:mm:ss');
    var enddatetime = moment(req.query.to).format('YYYY-MM-DD HH:mm:ss');
    console.log(`deviceID = ${deviceID}, containerName = ${containerName}, from = ${startdatetime}, to = ${enddatetime}`);
    sql = "select * from (select * from spatio where ae='" + deviceID + "') as aevalue where creationtime  between '"+ startdatetime +"' and '"+ enddatetime +"' order by creationtime asc"
    
  
    // 등록된 Object가 없을 경우 
    client.query("SELECT * FROM spatio WHERE ae= '" + deviceID + "'")
    .then(response => {
      if(!response.rowCount) {
      res.status(400).send("No Object"); //Why 204 doesn't message pop up
      console.log("No Object")
      }else{
        client.query(sql)
        //console.log(sql)
        .then(response => {
          if(response.rowCount){	
            var returnValues = {};
            var trajectory = [];

            for(var index in response.rows){
              let latitude = response.rows[index].latitude
              let longitude = response.rows[index].longitude
              let altitude = 0
              //response.rows[index].altitude
              var time = moment.utc(response.rows[index].creationtime).format('YYYYMMDDTHHmmss');
              trajectory.push({location: {latitude, longitude, altitude}, time});
            }//for
            returnValues['points'] = response.rowCount;
            returnValues['deviceID'] = deviceID;
            returnValues['container'] = containerName;
            returnValues['trajectory'] = trajectory;
            res.send(returnValues);
            console.log(returnValues);

            console.log(">>> 200 OK");	
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
        }
    }).catch(e=>{
        res.status(204).send(e.message);
      }) 
  })


