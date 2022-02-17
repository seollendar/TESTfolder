app.get("/timeseries/:deviceID/:containerName/period", (req, res) => {
   res.set({ "access-control-allow-origin": "*" });
   if (
      req.params.deviceID &&
      req.params.containerName &&
      req.query.from &&
      req.query.to
   ) {
      let { deviceID, containerName } = req.params;
      var startdatetime = moment(req.query.from) / 0.000001;
      var enddatetime = moment(req.query.to) / 0.000001;
      getCountSQL =
         `select count(*) from ` +
         deviceID +
         ` where time >= ` +
         startdatetime +
         ` and time <= ` +
         enddatetime +
         ` and container = '` +
         containerName +
         `'`;

      influx
         .query(getCountSQL)
         .then((result) => {
            if (result[0]) {
               var returnValues = {};
               var value = {};
               var values = [];
               for (var index = 0; index < result.length; index++) {
                  var time = moment(result[index].time).format(
                     "YYYYMMDDTHHmmss"
                  );
                  delete result[index].time;
                  delete result[index].container;
                  value = result[index];
                  values.push({ time, value });
               }

               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["values"] = values;
               res.send(returnValues);
               console.log(">>> 200 OK  (period)");
            } else {
               //if no response
               res.send("{}");
               console.log("{}");
               console.log(">>> 200 OK (period)");
            }
         })
         .catch((err) => {
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error", err);
         });
      sql =
         `select * from ` +
         deviceID +
         ` where time >= ` +
         startdatetime +
         ` and time <= ` +
         enddatetime +
         ` and container = '` +
         containerName +
         `'`;

      influx
         .query(sql)
         .then((result) => {
            if (result[0]) {
               var returnValues = {};
               var value = {};
               var values = [];
               for (var index = 0; index < result.length; index++) {
                  var time = moment(result[index].time).format(
                     "YYYYMMDDTHHmmss"
                  );
                  delete result[index].time;
                  delete result[index].container;
                  value = result[index];
                  values.push({ time, value });
               }

               returnValues["deviceID"] = deviceID;
               returnValues["container"] = containerName;
               returnValues["values"] = values;
               res.send(returnValues);
               console.log(">>> 200 OK  (period)");
            } else {
               //if no response
               res.send("{}");
               console.log("{}");
               console.log(">>> 200 OK (period)");
            }
         })
         .catch((err) => {
            res.status(500).send("Internal Server Error");
            console.log(">>> 500 Internal Server Error", err);
         });
   } else {
      res.status(400).send("Bad Request");
      console.log("input value error");
   }
});
