 
const express = require('express')
const app = express()
//const moment = require('moment')
const port = 3004
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
  
      req.on('end', function() {
            
            var jsonbody = JSON.parse(fullBody)
            let cinContents = jsonbody['m2m:sgn'].nev.rep['m2m:cin'].con

            var key = cinContents.ae;
			var score = cinContents.wtime
            var value = JSON.stringify(cinContents);
            //var value = cinContents;

			have3list(key, score, value);
			
			res.status(200);
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

/*
function have3list(key, score, value){
	client.zadd(key, score, value, this.MULTI());
	client.zremrangebyrank(key, -4, -4, this.MULTI());
	client.zrange(key, 0, -1, "withscores",this.MULTI());
	
}
*/



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

/*
client.set('mykey', 'Hello World');
client.get('mykey', function(err,res){
    console.log(res);
});
*/

