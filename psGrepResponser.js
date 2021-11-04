const unirest = require("unirest");
const express = require("express");
const util = require("util");

const exec = util.promisify(require("child_process").exec);
const app = express();
app.listen(1203, () => {
   console.log("API-Server Start on port 1203");
});

app.post("/ps", (req, res) => {
   var fullBody = "";

   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      // let DeviceName = req.params.DeviceName;

      console.log("req: ", fullBody);

      var cmd = `ps -ef | grep `;

      exec(cmd, function (err, stdout) {
         if (err) {
            console.log("err: ", err);

            return;
         }

         console.log("stdout:", stdout);
      });

      res.end();
   });
});

//The 404 Route (ALWAYS Keep this as the last route)

app.get("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});

app.post("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});
