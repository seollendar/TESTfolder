const express = require("express");
const app = express();
const port = 3002;
app.listen(port, () =>
   console.log(`Example app listening at http://localhost:${port}`)
);

var redis = require("redis");
var client = redis.createClient(6379, "127.0.0.1");

app.post("*", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      var jsonbody = JSON.parse(fullBody);
      var key = jsonbody.a;
      var value = jsonbody.b;

      setDataToRedis(key, value);
      var prevData = await getDataFromRedis(key);
      console.log(prevData);
   });
});

function getDataFromRedis(key) {
   return new Promise((resolve, reject) => {
      client.get(key, function (err, data) {
         if (err) {
            //console.log(err);
            reject(err);
         } else resolve(data);
      });
   }).then((result) => {
      return JSON.parse(result);
   });
}

function setDataToRedis(key, value) {
   //console.log({key, value});

   client.set(key, value, function (err, data) {
      if (err) {
         //console.log(err);
         return;
      }
   });
}
