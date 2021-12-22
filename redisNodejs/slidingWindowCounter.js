 
const express = require('express')
const app = express()
const moment = require('moment')
const port = 3005
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

var redis = require('redis');
var client = redis.createClient(6379,'127.0.0.1');

 // app.use(function(req,res,next){
//       req.cache = client;
//       next();
// })

app.post('/profile',function(req,res){
      //req.accepts('application/json');

	var fullBody = '';
	req.on('data', function(chunk) {
	fullBody += chunk; 
	});

	req.on('end', function(){
		
		var jsonbody = JSON.parse(fullBody)
		let cinContents = jsonbody['m2m:sgn'].nev.rep['m2m:cin'].con

		var key = cinContents.ae;
		var score = cinContents.wtime
		var value = JSON.stringify(cinContents);
		//var value = cinContents;
		SlidingWindowCounter_SpeedAvg(key, score, value, 5);
		//SlidingWindowCounter(key, score, value, 5);
		//have3list(key, score, value);
		
		
		/*
		client.zadd(key,member,function(err,data){

			  if(err){
					console.log(err);
					res.send("error "+err);
					return;
			  }

			  //client.expire(key,10);
			  res.json(data);
			  console.log(data);
		});
		*/
            
    });
	res.status(200).send('post /end test ok');
})




app.get('/profile/:ae',function(req,res,next){

		var key = req.params.ae;

		client.smembers(key,function(err,data){ //
		  //client.exists(key,function(err,data){ // 키가 존재하는 지 확인. 있으면 1 없으면 0

			if(err){
				 console.log(err);
				 res.send("error "+err);
				  return;
			}
			//var value = JSON.parse(data);
			res.json(data);
			//console.log(value);
			console.log(data);
		
		});
});



function have3list(key, score, value){
	client.zadd(key, score, value, function(err, data){
		if(err){
			console.log("zrange err : ", err);
			return;
		}
	});	
	client.zremrangebyrank(key, -4, -4, function(err, data){
		if(err){
			console.log("zrange err : ", err);
			return;
		}
	});	
	client.zrange(key, 0, -1, "withscores", function(err, data){
		if(err){
			console.log("zrange err : ", err);
			return;
		}else{
			console.log(data);
		}
	});	
}


function SlidingWindowCounter(key, score, value, windowInSecond){

	var currentMs = score;
	var maxScoreMs = currentMs - (5 * 1000);
	
	return new Promise((resolve, reject) => {
		client.zremrangebyscore(key, "-inf", maxScoreMs);	
		client.zadd(key, currentMs, value);	
		client.zrange(key, 0, -1, "withscores", function(err, res){
			if(err){
				reject("zrange err : ", err);
			}else
				resolve(res);
				console.log("res:", res);
		});
	}).then(result => {
		console.log(JSON.parse(result[0]).ae);
		//console.log(JSON.parse(result[0]));
		return result;
		
	});
}	


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

/*
function SlidingWindowCounter_SpeedAvg(key, score, value, windowInSecond){
	
	var currentMs = score;
	var maxScoreMs = currentMs - (5 * 1000);
	
	return new Promise((resolve, reject) => {
		client.zremrangebyscore(key, "-inf", maxScoreMs);	
		client.zadd(key, currentMs, value);	
		client.zrange(key, 0, -1, "withscores", function(err, res){
			if(err){
				reject("zrange err : ", err);
			}else{
				resolve(res);
				console.log("res:", res);
			} 
		});
	}).then(result => {
		//var out = JSON.parse(result[0]).lat;
		//console.log("out:",out);
		//for(var i=0; i<5; i++){					
			client.geoadd(key, JSON.parse(result[0]).lat, JSON.parse(result[0]).lon, `window${0}`);
			client.geopos(key, `window${i}`, function(err, res){
			if(err){
				reject("geopos err : ", err);
			}else{
				resolve(res);
				console.log("res:", res);
			} 
		});
		//}
		
		return result;
		
	});
}
*/







