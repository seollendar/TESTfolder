const express = require('express');
const app = express();
const bodyParser = require('body-parser');



var cluster = require("cluster"); // 클러스터 모듈 로드
var numCPUs = require("os").cpus().length; 


if (cluster.isMaster) {
   // 마스터 처리
   console.log("number of cpu = " + numCPUs + "\n");

   for (var i = 0; i < numCPUs; i++) {
      cluster.fork(); // CPU 개수만큼 fork
   }
   // 워커 종료시 다잉 메시지 출력
   cluster.on("exit", function (worker, code, signal) {
      console.log("worker " + worker.process.pid + " died");
   });
} else {


	const port = 7890;
	app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
	app.use(bodyParser.json());
	app.post('/noti', function(req, res){
		console.log(req.body['m2m:sgn'].sur);
		console.log(req.body['m2m:sgn'].nev.rep);	
		res.status(200).send;		
		

	});

}

