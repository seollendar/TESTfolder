var cluster = require('cluster'); // 클러스터 모듈 로드
var numCPUs = require('os').cpus().length; // CPU 개수 가져오기
var st, pt;
global.data_count=0;


if (cluster.isMaster) { // 마스터 처리
console.log('number of cpu = ' + numCPUs + '\n');

for (var i = 0; i < (numCPUs/2); i++) {
cluster.fork(); // CPU 개수만큼 fork
}
// 워커 종료시 다잉 메시지 출력
cluster.on('exit', function(worker, code, signal) {
console.log('worker ' + worker.process.pid + ' died');
});
}

else { // 워커 처리

      const express = require('express');
      const app = express();
      const moment = require('moment');
      const port = 3001;
      app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

      var redis = require('redis');
      var client = redis.createClient(6379, '127.0.0.1');


      var st, pt, data_count=0;
      app.post('/profile', function (req, res) {
			/* GET RUN TIME
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
					  //console.log(st, pt, "elapseTime:", et, " count:", data_count);
				}

				if(data_count>2550){
					  console.log(st, pt, "elapseTime:", et, " count:", data_count);
				}
			*/

            var fullBody = '';
            req.on('data', function (chunk) {
                  fullBody += chunk;
            });

            req.on('end', async function () {
				var jsonbody = JSON.parse(fullBody);
				let cinContents = jsonbody['m2m:sgn'].nev.rep['m2m:cin'].con;
				var ae = cinContents.ae;
				var score = cinContents.wtime;

				var prevData = await getDataFromRedis(ae);
				var currentData = cinContents;

				if (await isMove(prevData, currentData, 500)) {
					setDataToRedis(ae + "_lastActive", score, JSON.stringify(currentData));// 움직임이 발생하지 않은 디바이스 알림 scen
				} 
				else {
					setDataToRedis(ae + "_lastNonActive", score, JSON.stringify(currentData));//움직임이 지속적으로 발생한 디바이스 알림 scen
				}
				setDataToRedis(ae, score, JSON.stringify(currentData)); //튄 데이터 알림 scen
            });
            res.status(200).send('post /end test ok');
      })


		app.get('/profile/:ae', function (req, res, next) {
			var key = req.params.ae;

			client.get(key, function (err, data) {
				  if (err) {
						//console.log(err);
						res.send("error " + err);
						return;
				  }
				  var value = JSON.parse(data);
				  res.json(value);
				  //console.log(value);
			});

		});

		app.get('/profileZ/:ae',function(req,res,next){
			var key = req.params.ae;    
			client.zrangebyscore(key, "-inf", "inf",  function(err,data){
			//client.zrangebyscore(key, "-inf", "inf", "withscores", "limit", 0, 1,  function(err,data){				
			//client.zrangebyscore(key,1600742150004, 1600742150005,"withscores",  function(err,data){ 
				if(err){
					console.log(err);
					res.send("ERROR "+err);
					return;
				}
				res.json(data);
				console.log(data)
			  });
		});	

		function getDataFromRedis(key) {
			return new Promise((resolve, reject) => {
				  client.get(key, function (err, data) {
						if (err) {
						//console.log(err);
						reject(err);
						} else
						resolve(data);
				  });
			}).then(result => {
				  return JSON.parse(result);
			});
		}

		function setDataToRedis(key, score, value) {
		//console.log({key, value});  
			client.zadd(key, score, value, function(err, data) {
				  if (err) {
						//console.log(err);
						return;
				  }
			});
		}

		/*scen3: 지정 속도 이상의 비정상적인 데이터 감지*/
		function Abnormal(prevData, cinContents) {

			var distancePerM = distance(prevData[cinContents.ae].lat, prevData[cinContents.ae].lng, cinContents.lat, cinContents.lng)
				  var getTimeDiff = cinContents.wtime - prevData[cinContents.ae].wtime;
			var returnComputeSpeed = computespeed(getTimeDiff, distancePerM)

				  if (returnComputeSpeed > 30) {
						//console.log(`[Alert] scen3_AbNormal: 디바이스(${cinContents.ae})의 데이터가 정상범주를 벗어났습니다.`);
				  }

				  prevData[cinContents.ae] = {
				  ...cinContents
			};
			 //console.log("[Update] scen3_prevData Update:", prevData);

		}

		async function isMove(pre, cur, meter) {
			// 이전 데이터가 없으므로, 처음 들어온 ae이며 lastNonActive를 등록
			if(pre === null){
				return false;
			}else{
				var moveDistance = distance(pre.lat, pre.lng, cur.lat, cur.lng);
				console.log(`moveDistance: ${moveDistance}, ${pre.lat}, ${cur.lat}`);
				
				if (moveDistance > meter) {
					  return true;
				}
				else{
						var lastActivePoint = await getDataFromRedis(`${cur.ae}_lastActive`); //=>Active
						if(lastActivePoint === null){
							return true;
						}else{
							moveDistance = distance(lastActivePoint.lat, lastActivePoint.lng, cur.lat, cur.lng);
							if (moveDistance > meter){
								return true;
							}
							return false;
						}
				}
			}
			
		}

		function distance(lat1, lon1, lat2, lon2) {
		var p = 0.017453292519943295;
		var c = Math.cos;
		var a = 0.5 - c((lat2 - lat1) * p) / 2 +
			c(lat1 * p) * c(lat2 * p) *
			(1 - c((lon2 - lon1) * p)) / 2;

		return (12742 * Math.asin(Math.sqrt(a)) * 1000);
		}

		function computespeed(timediff, distancediff) {
		if (distancediff == 0) {
			tspeed = 0;
		} else {
			tspeed = distancediff / timediff;
		}
		//console.log(`speed: ${tspeed} timediff ${timediff} distancediff ${distancediff}`);
		return tspeed;
		}

}