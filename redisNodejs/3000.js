
// var cluster = require('cluster'); // 클러스터 모듈 로드
// var numCPUs = require('os').cpus().length; // CPU 개수 가져오기
// var st, pt;
// global.data_count=0;


// if (cluster.isMaster) { // 마스터 처리
// console.log('number of cpu = ' + numCPUs + '\n');

// for (var i = 0; i < (numCPUs/2); i++) {
// cluster.fork(); // CPU 개수만큼 fork
// }
// // 워커 종료시 다잉 메시지 출력
// cluster.on('exit', function(worker, code, signal) {
// console.log('worker ' + worker.process.pid + ' died');
// });
// }

// else { // 워커 처리
  

  const express = require('express')
  const app = express()
  const moment = require('moment')

  const port = 3000
  app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
  

  // console.time('post');
  // console.timeEnd('post');
  //var d = new Date();
  //var now = moment(d).format('YYYY-MM-DD HH:mm:ss');

  var st, pt, data_count=0;
  var prevData = {}, lastActive = {}, lastNonActive = {};
  app.post("/PRE", (req, res)=>{

    if(st == null)
    {
      st = moment(new Date());
      data_count++;
    }
    else
    {
      pt = moment(new Date());
      et = pt - st; 
      data_count++;
      console.log(st, pt, et, data_count, 'execute worker pid is ' + process.pid);
    }
    //console.log( 'execute worker pid is ' + process.pid );

    // if(data_count>2500){
    //   console.log(st, pt, et, data_count);
    // }


    var fullBody = '';
    req.on('data', function(chunk) {
      fullBody += chunk; 
    });

    req.on('end', function() {
      res.status(200).send('post /end test ok');
      var jsonbody = JSON.parse(fullBody)
      
      let cinContents = jsonbody['m2m:sgn'].nev.rep['m2m:cin'].con
      // 해당 deviceID가 없을 경우

      //모듈화 중요!
      //prevData = getPreviousData();
      //if(prevData == NULL)
      
      if(prevData[cinContents.ae] === undefined){
        prevData[cinContents.ae] = {...cinContents};
        lastActive[cinContents.ae] = {...cinContents};
        lastNonActive[cinContents.ae] = {...cinContents};
        //console.log("insert first Data:", prevData);          
      }
      // 있을 경우
      else {
        findNotMoveDevices(lastActive, cinContents)
        findContinueMoveDevices(lastNonActive, cinContents)
        Abnormal(prevData, cinContents);          
        
        //saveCurrentData(cinContents);
      }

  
      

      // console.log("===============================================");
      //console.log("scen1: lastActive:", lastActive);
      // console.log("===============================================scen1");
      //console.log("scen2: lastNonActive:", lastNonActive);
      // console.log("===============================================scen2");
      //console.log("scen3: prevData:", prevData);
      // console.log("===============================================scen3");
      //console.log("=========================================================");

    
    });

  })


  /*scen1: 지정시간동안 움직이지 않은 디바이스 알림*/
  function findNotMoveDevices(lastActive, cinContents){
    
    // 기준점 데이터와 이번 noti의 거리 측정
    var distancePerM = distance(lastActive[cinContents.ae].lat, lastActive[cinContents.ae].lng, cinContents.lat, cinContents.lng)
    //console.log("timediff",cinContents.wtime - lastActive[cinContents.ae].wtime);
    //console.log(`디바이스(${cinContents.ae})가 움직인 거리:" ${distancePerM}`);

    if(distancePerM > 5){           
      lastActive[cinContents.ae] = {...cinContents};
      //console.log("[Update] scen1_lastActive:", lastActive);   
      //console.log(`[scen1_findNotMoveDevices Alert] 디바이스(${cinContents.ae})가 ${distancePerM}M 움직였습니다.`);
    }
    else {
      if(cinContents.wtime - lastActive[cinContents.ae].wtime > 3000){
        // 움직이지 않은 채로 3초가 지남.
        //console.log("timediff",cinContents.wtime - lastActive[cinContents.ae].wtime);
        //console.log(`[Alert] scen1_findNotMoveDevices: 디바이스(${cinContents.ae})가 지정시간 이상 움직이지 않았습니다.`);
      }else{
        //console.log(cinContents.wtime)
        //console.log(lastActive[cinContents.ae].wtime)
        //console.log("timediff",cinContents.wtime - lastActive[cinContents.ae].wtime);
      }
    }
    
  }

  /*scen2: 지정시간이상 움직임이 감지된 디바이스 알림*/
  function findContinueMoveDevices(lastNonActive, cinContents){
    
    // 기준점 데이터와 이번 noti의 거리 측정
    var distancePerM = distance(lastNonActive[cinContents.ae].lat, lastNonActive[cinContents.ae].lng, cinContents.lat, cinContents.lng)
    //console.log("2_distancePerM: ",distancePerM, cinContents.ae)
    if(distancePerM < 30){           
      lastNonActive[cinContents.ae] = {...cinContents};
      //console.log("[Update] scen2_lastNonActive:", lastNonActive);
      //console.log(`[findContinueMoveDevices Alert] 디바이스(${cinContents.ae})가 움직이지 않았습니다.`);
    }
    else {
      var timeDiff = cinContents.wtime - lastNonActive[cinContents.ae].wtime;
      //console.log(timeDiff)
      //console.log(`디바이스(${cinContents.ae})가 움직임이 감지됐습니다.${cinContents.wtime} ${lastNonActive[cinContents.ae].wtime} ${timeDiff}`);

      // if(timeDiff > 3000){
      //   // 움직인 채로 3초가 지남.
      //   //console.log(`[Alert] scen2_findContinueMoveDevices: 디바이스(${cinContents.ae})가 ${timeDiff}시간동안 움직임이 감지됐습니다.`);
      //   console.log(`[Alert] (${cinContents.ae})가 ${timeDiff}시간동안 움직임이 감지됐습니다. ${cinContents.wtime} ${lastNonActive[cinContents.ae].wtime}`);
      // }else{
      //   console.log("else>else>timediff",cinContents.wtime - lastNonActive[cinContents.ae].wtime, cinContents.ae);
      // }
      if(timeDiff < 3000){
        // 움직인 채로 3초가 지남.
        //console.log(`[Alert] scen2_findContinueMoveDevices: 디바이스(${cinContents.ae})가 ${timeDiff}시간동안 움직임이 감지됐습니다.`);
        //console.log("움직였으나 3초 안지남>>timediff",cinContents.wtime - lastNonActive[cinContents.ae].wtime, cinContents.ae);        
      }else{
        //console.log(`움직인채로 3초 지남>>[Alert] (${cinContents.ae})가 ${timeDiff}시간동안 움직임이 감지됐습니다. ${cinContents.wtime} ${lastNonActive[cinContents.ae].wtime}`);
      }
    }
    
  }

  /*scen3: 지정 속도 이상의 비정상적인 데이터 감지*/
  function Abnormal(prevData, cinContents){
    
    var distancePerM = distance(prevData[cinContents.ae].lat, prevData[cinContents.ae].lng, cinContents.lat, cinContents.lng)
    var getTimeDiff = cinContents.wtime - prevData[cinContents.ae].wtime;
    var returnComputeSpeed = computespeed(getTimeDiff, distancePerM)

    if(returnComputeSpeed > 30){
      //console.log(`[Alert] scen3_AbNormal: 디바이스(${cinContents.ae})의 데이터가 정상범주를 벗어났습니다.`);
    }

    prevData[cinContents.ae] = {...cinContents};
    //console.log("[Update] scen3_prevData Update:", prevData);
    
  }



  function distance(lat1, lon1, lat2, lon2){ 
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;

    //console.log(12742 * Math.asin(Math.sqrt(a))*1000)// 2 * R; R = 6371 km
    return (12742 * Math.asin(Math.sqrt(a))*1000);
  }


  function computespeed (timediff, distancediff){
    if(distancediff == 0){
      tspeed = 0;  
    }else{
      tspeed = distancediff / timediff;
    }
    //console.log(`speed: ${tspeed} timediff ${timediff} distancediff ${distancediff}`);
    return tspeed;
  } 


// }