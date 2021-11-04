

  /* GET Retrieve Types    
  * 4. 디바이스 누적 이동 거리 조회
  * 설명 : 디바이스의 아이디를 통해 특정 디바이스의 누적 이동 거리 조회
  * localhost:7979/location/:deviceID/:containerName/distance?from={startDateTime}&to={endDateTime}
  */
  app.get("/location/:deviceID/:containerName/distance", (req, res) => {
    let {deviceID, containerName} = req.params;

    if(!req.params.deviceID && !req.query.from && !req.query.to) {
      res.status(400).send("Bad Request");
      console.log("input value error")
    }

    var startdatetime = moment(req.query.from).format('YYYY-MM-DD HH:mm:ss');
    var enddatetime = moment(req.query.to).format('YYYY-MM-DD HH:mm:ss');
    console.log(`deviceID = ${deviceID}, containerName = ${containerName}, from = ${startdatetime}, to = ${enddatetime}`);
    sql = "SELECT st_Length(ST_TRANSFORM(ST_MakeLine(geom.gps),5179)) as dvalue FROM ( select * from (select * from spatio where ae='"+ deviceID +"') as aevalue "
          + "where creationtime  between '"+ startdatetime +"' and '"+ enddatetime +"' order by creationtime) As geom"
    console.log(sql)
  
    // 등록된 Object가 없을 경우 
    client.query("SELECT * FROM spatio WHERE ae= '" + deviceID + "'")
    .then(response => {
      if(!response.rowCount) {
      res.status(400).send("No Object"); //Why 204 doesn't message pop up
      console.log("No Object")
      }else{
        client.query(sql).then(response => {
          if(response.rows[0].dvalue != null){
          console.log(response.rows[0].dvalue)
          var returnValues = {}
          returnValues['deviceID'] = deviceID;
          returnValues['container'] = containerName;
          returnValues['value'] = response.rows[0].dvalue;
          console.log(returnValues)
          res.send(returnValues);
          }else{
            console.log("{}");
            res.send("{}");  
            console.log(">>> 기간 내 이동거리 없음.");   
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
