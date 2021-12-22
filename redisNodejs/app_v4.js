const express = require('express')
const app = express()
//const moment = require('moment')
const port = 3003
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
var redis = require('redis');
client = redis.createClient(6379,'127.0.0.1');

app.post('/profile',function(req,res){
      //req.accepts('application/json');

      var fullBody = '';
      req.on('data', function(chunk) {
        fullBody += chunk; 
      });

      req.on('end', function() {         
            var jsonbody = JSON.parse(fullBody)
            let cinContents = jsonbody['m2m:sgn'].nev.rep['m2m:cin'].con

            var key = cinContents.ae;
			var score = cinContents.wtime;
            var value = JSON.stringify(cinContents);
            //var value = cinContents;
			setDataToRedis(key, score, value);			
			getDataFromRedis(key);

			findNotMoveDevices(lastActive, cinContents)
			findContinueMoveDevices(lastNonActive, cinContents)
			Abnormal(prevData, cinContents);  
      });
	res.status(200).send('post /end test ok');
})

app.get('/profile/:ae',function(req,res,next){
    var key = req.params.ae;    
    client.zrangebyscore(key,"-inf", "inf","withscores",  function(err,data){ 
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


function setDataToRedis(key, score, value) {
	//var currentMs = score;
	//var maxScoreMs = currentMs - (5 * 1000);
    //client.zremrangebyscore(key, "-inf", maxScoreMs);
	client.zadd(key, score, value, function(err, data) {
		  if (err){
				console.log(err);
				return;
			}
	});
}

function getDataFromRedis(key) {
	return new Promise((resolve, reject) => {
			client.zrangebyscore(key,"-inf", "inf",  function(err,data){ 
				if (err) {
				//console.log(err);
				reject(err);
				} else {
				resolve(data);
				console.log("data", data);
				}
		  });
	}).then(result => {
		  return result;
	});
}

