var cluster = require('cluster'); // 클러스터 모듈 로드
var express = require('express'); // express 프레임워크 로드
var numCPUs = require('os').cpus().length; // CPU 개수 가져오기
//var SERVER_PORT = 8000; // 애플리케이션 포트 지정

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

console.log( 'current worker pid is ' + process.pid );
var app = express();
app.get('/', function(req, res){
console.log( 'execute worker pid is ' + process.pid );
for (let i=0; i<500000; i++){
;
}
res.send('execute wokrer pid is ' + process.pid );
// process.kill(process.pid);
});

//var server = app.listen(SERVER_PORT, function () {

var host = server.address().address;
var port = server.address().port;

console.log('app listening at http://%s:%s', host, port);

});
}