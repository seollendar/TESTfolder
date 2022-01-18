const express = require("express");
const app = express();
const util = require("util");
const { DateTime } = require("luxon"); //DateTime.now().toFormat("yyyy-MM-dd")
const port = 1203;
app.listen(port, () => {
   console.log(`Server Start on http://localhost:${port}`);
});

var redis = require("redis");
var client = redis.createClient({ port: 6379, host: "localhost" });
client.on("error", function (err) {
   console.log("Error " + err);
});
//*** 이미 key가 있으면 업데이트 됨
/*
client.set('String Key', 'String Value', redis.print);  // redis.print : 수행결과 출력 혹은 오류 출력. redis.print는 없어도 상관없음. 없으면 결과 출력은 되지 않고 값만 저장
client.get('String Key', function(err, value){
    if(err) throw err;
    console.log(value);
});
*/

/*
{
  "SensorGroup": {
    "temperature": ["kafka", "rabbitmq"],
    "power": ["kafka", "rabbitmq"]
  }
}
*/
// HASH
/*
client.hmset('codigm', {
    'goormIDE' : 'cloud service',
    'goormEDU' : 'edu service'
}, redis.print);      //Reply: OK      


client.hset("codigm", "goormIDE", "2", redis.print); //Reply: 1
//client.hset(['Hash Key', 'HashTest 2', '2'], redis.print); //Reply: 1            // 해시 테이블 추가 및 결과 출력

client.hget("codigm", "goormIDE", function (err, value) {
   // codigm의 해시테이블에서 goormIDE 값 가져오기
   if (err) throw err;
   console.log("goormIDE is : " + value); //goormIDE is : cloud service       // 해당 값 출력
});
/*
client.hkeys('codigm', function(err,keys) {            // codigm의 해시테이블 모든 키 데이터 가져오기
    if(err) throw err;
    keys.forEach(function(key, i) {
        console.log('codigm ' + i + ' : ' + key );
    });
	//codigm 0 : goormIDE
	//codigm 1 : goormEDU
});
*/

//LIST
//client.lpush("tasks", "Node.js", redis.print); // 리스트에 값 추가
//client.lpush("tasks", "Redis", redis.print);
//client.lrem("task", -1);
//client.DEL("tasks", redis.print);
client.LREM("tasks", -1, "Redis");
client.lrange("tasks", 0, -1, function (err, items) {
   // 시작, 종료인자 이용해 리스트 항목 가져오기
   // -1는 리스트의 마지막 항목 의미, 즉 다 가져오기
   if (err) throw err;
   items.forEach(function (item, i) {
      console.log("list " + i + " : " + item);
   });
});

/*
//DEL: 입력한 키를 삭제한다.
client.DEL("tasks", redis.print);

//HDEL: 입력한 해시 키 밑에 필드를 삭제한다.
client.HDEL("myhashkey1", "field1", redis.print);
*/
