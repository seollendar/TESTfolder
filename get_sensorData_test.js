const express = require("express");
const app = express();
const port = 1220;
app.listen(port, () => {
   console.log(`Server Start on http://localhost:${port}`);
});

app.post("/DigitalConnector/SensorGroup/:sensorName", function (req, res) {
   let fullBody = "";

   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", async function () {
      if (!req.params?.sensorName) {
         res.status(500).send("please check sensorName parameter");
      }

      let sensorNameObj = JSON.parse(fullBody);
      console.log("sensorObj ", sensorNameObj);
      res.status(200).send("ok");
   });
});
