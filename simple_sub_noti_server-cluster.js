const express = require("express");
const app = express();
var cluster = require("cluster");
var numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
   // console.log("number of cpu = " + numCPUs + "\n");

   for (var i = 0; i < numCPUs / 2; i++) {
      cluster.fork();
   }

   cluster.on("exit", function (worker, code, signal) {
      console.log("worker " + worker.process.pid + " died");
   });
} else {
   const port = 7890;
   app.listen(port, () =>
      console.log(`Example app listening at http://203.254.173.175:${port}`)
   );

   app.post("*", (req, res) => {
      var fullBody = "";
      req.on("data", function (chunk) {
         fullBody += chunk;
      });

      req.on("end", function () {
         res.status(200).send("post /end test ok");
         var receivedData = JSON.parse(fullBody);
         console.log("> receivedData: ", receivedData);
         console.log("> rep: ", rep);
      });
   });
}
