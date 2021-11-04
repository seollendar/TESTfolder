var HashMap = require("hashmap");
const redis = require("redis");
const client = redis.createClient();
const { promisify } = require("util");
const getAsync = promisify(client.get).bind(client);
// getAsync.then(console.log).catch(console.error);

client.on("error", function (error) {
   console.error(error);
});

const { time } = require("console");
const crypto = require("crypto");
var input = 10;
var arr = [0, 0, 0, 0, 0];
var arr2 = [0, 0, 0, 0, 0];
function forT() {
   console.log("T1 start");
   console.time("T");
   for (i = 1; i < input; i++) {
      var id = getHashCode(`S${i}`);
      //console.log(id);
      arr[id]++;
   }
   console.timeEnd("T");
   console.log(arr[0]);
   console.log(arr[1]);
   console.log(arr[2]);
   console.log(arr[3]);
   console.log(arr[4]);
}

//tid = i%5
//hashmap map.put ("i", tid)

function for2() {
   console.log("T2 start");
   console.time("T2");

   for (i = 1; i < input; i++) {
      var id = i % 5;
      arr2[id]++;
   }
   console.timeEnd("T2");
   console.log(arr2[0]);
   console.log(arr2[1]);
   console.log(arr2[2]);
   console.log(arr2[3]);
   console.log(arr2[4]);
}

function for3() {
   //test
   console.log("T3 start");
   console.time("T3");
   var map = new HashMap();
   for (i = 1; i < input; i++) {
      var id = i % 5;
      map.set(i, id);
   }
   console.timeEnd("T3");
}

function for4() {
   //test
   console.log("T4 start");
   console.time("T4");
   var map = new HashMap();
   for (i = 1; i < input; i++) {
      if (map.get(i) == undefined) {
         console.log(map.get(i));
      } else {
         console.log(hey);
      }
   }
   console.timeEnd("T4");
}

async function for5() {
   client.set("key", "hehehehe", function (err, reply) {
      // reply is null when the key is missing
      console.log(reply);
   });
   // var hey = client.get("key");
   // console.log(hey);
   // for (i = 1; i < input; i++) {
   //    if (!client.get("key")) {
   //       console.log(client.get("key"));
   //    } else {
   //       console.log("hey");
   //    }
   // }
   setTimeout(() => client.get("key", redis.print), 3000);
   // client.get("hey", function (err, reply) {
   //    // reply is null when the key is missing
   //    console.log("he", reply);
   // });
}

async function for6() {
   // set이 완료 될 때까지 기다림
   // await client.set("key", "hehehehe", function (err, reply) {
   //    console.log(reply);
   // });

   // // get완료 기다림
   // const hey = await client.get("key");
   // console.log(hey);
   Promise.all[(client.set("key", "hehehehe"), client.get("key", redis.print))];
}

// client.set("key", "value", redis.print);
// client.get("key", redis.print);

function getHashCode(DeviceName) {
   //console.log(DeviceName);

   const secret = "partitionHash";
   const hashed = crypto
      .createHmac("sha256", secret)
      .update(DeviceName)
      .digest("hex");

   let partitionNumber = parseInt(hashed, 16) % 5;
   return partitionNumber;
}

//forT();
//for2();
//for3();
// for4();
//for6();
// Promise.all[(for2(), for3(), for4())];

function getData() {
   return new Promise(function (resolve, reject) {
      client.get("key", function (response) {
         if (response) {
            resolve(response);
         }
         reject(new Error("Request is failed"));
      });
   });
}

getData()
   .then(function (data) {
      console.log(data); // response 값 출력
   })
   .catch(function (err) {
      console.error(err); // Error 출력
   });
