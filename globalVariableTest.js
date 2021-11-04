const express = require('express');
const app = express();


var index = 0;

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
	index++;
    console.log(`Worker id: ${cluster.worker.id}`, index);

}

//clustering은 각자 worker를 생성하는 것으로 worker끼리 공유할 수 없음
//global변수 사용 불가