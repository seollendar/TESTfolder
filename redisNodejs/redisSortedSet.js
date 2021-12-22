const express = require('express')
const app = express()
//const moment = require('moment')
const port = 3003
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

var redis = require('redis');
client = redis.createClient(6379,'127.0.0.1');

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
  
      req.on('end', function() {
            
            var jsonbody = JSON.parse(fullBody)
            let cinContents = jsonbody['m2m:sgn'].nev.rep['m2m:cin'].con

            var key = cinContents.ae;
			var score = cinContents.wtime;
            var value = JSON.stringify(cinContents);
            //var value = cinContents;

            client.zadd(key,score,value,function(err,data){

                  if(err){
                        console.log(err);
                        res.send("error "+err);
                        return;
                  }

                  //client.expire(key,10);
                  res.json(value);
                  console.log(value);
            });

      });
})

app.get('/profile/:ae',function(req,res,next){

	var key = req.params.ae;
	
	//client.zrangebyscore(key,"-inf", "inf","withscores",  function(err,data){ 
	client.zrangebyscore(key,1600742150004, 1600742150005,"withscores",  function(err,data){ 


		if(err){
			console.log(err);
			res.send("ERROR "+err);
			return;
		}

		//var value = JSON.parse(data);
		res.json(data);
		console.log(data)
	  });

});

 

//https://sabarada.tistory.com/104 Redis 기본명령어
//https://happyhourguide.blogspot.com/2015/06/redis-command-1.html Redis command 분석 
