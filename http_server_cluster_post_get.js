const express = require('express');
const app = express();
var cluster = require("cluster"); // 클러스터 모듈 로드
var numCPUs = require("os").cpus().length; 


if (cluster.isMaster) {
   // 마스터 처리
   console.log("number of cpu = " + numCPUs + "\n");

   for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
   }
   // 워커 종료시 다잉 메시지 출력
   cluster.on("exit", function (worker, code, signal) {
      console.log("worker " + worker.process.pid + " died");
   });
   
} else {

	const port = 5678;
	app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
	
   app.get("/", function(req, res){
      res.status(200).send("Get Request");
   });

	app.post("/", function(req, res){
		var fullBody = '';
      res.status(200).send('post /end test ok');
      
      req.on('data', function(chunk) {
         fullBody += chunk; 
      });
   
      req.on('end', function() {
         console.log (fullBody);  

	   });
   	
	});

}
