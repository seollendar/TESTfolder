const Rget = require("./redis");
var redis = require("redis");
var client = redis.createClient();
client.on("error", function (err) {
   console.log("Error " + err);
});

async function main() {
   //client.set("String Key", "String Value", redis.print); // redis.print : 수행결과 출력 혹은 오류 출력. redis.print는 없어도 상관없음. 없으면 결과 출력은 되지 않고 값만 저장
   const getData = await Rget("String Key");
   console.log("get : ", getData);
}
main();

/*
function test(sensorNameObj) {
   console.log(sensorNameObj);
   if (!sensorNameObj?.name || !sensorNameObj?.mq) {
      console.log("not ");
   } else {
      console.log("ok");
   }
}

//test(JSON.parse(sensorNameObj));

function isObject(obj) {
   console.log(
      obj?.constructor === {}.constructor ||
         obj?.constructor.toString().includes("TextRow")
   );
}

//isObject(JSON.parse(sensorNameObj));

//console.log(JSON.parse(sensorNameObj));

function tryc(sensorNameObj) {
   try {
      messageObject = JSON.parse(sensorNameObj);
      return messageObject;
   } catch (e) {
      return false;
   }
}

//console.log(tryc(sensorNameObj));

*/
