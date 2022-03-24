const config = require("./configs.json");
const express = require("express");
const app = express();
var unirest = require("unirest");
const util = require("util");
const where = require("lodash.where");
const { DateTime } = require("luxon");
const mqtt = require("mqtt");
app.listen(1005, () => {
   console.log("Server Start on port 1005");
});
const { tryJSONparse } = require("./lib");
let Options = config.ksqlOptions;
const redis = require("redis");
const Rclient = redis.createClient({
   port: config.redis.port,
   host: config.redis.ip,
});

Rclient.on("error", function (error) {
   console.error(error);
});

const client = mqtt.connect(`mqtt://${config.mqtt.ip}:${config.mqtt.port}`);
// var options = { retain:true, qos:1 }; //client.publish(topic, dataToString, options);
let DONameList = [];
let DOWholeDataList = [];
let DOSIMmqttPubObjList = {}; //{'DO1':['sim1', 'sim2'], 'DO2': []}

client.on("connect", function () {
   console.log("connected!", client.connected);
});
client.on("error", (error) => {
   console.log("Can't connect" + error);
   process.exit(1);
});

/*
 * DO Creation
 */
app.post("/DigitalTwin/DO", async function (req, res) {
   let fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", async function () {
      if (tryJSONparse(fullBody)) {
         DOWholeData = tryJSONparse(fullBody);
         if (
            DOWholeData?.name &&
            DOWholeData?.sensor &&
            DOWholeData.sensor.length > 0
         ) {
            const flag = await checkNameExist(DOWholeData.name, "DO").then(
               function (flag) {
                  return flag;
               }
            );
            if (flag) {
               res.status(500).send("DO is already exist");
            } else {
               const DOName = DOWholeData.name;
               Rclient.rpush("DO", DOName);
               const DOobject = CheckKeyExistAndAddCount(DOWholeData);
               Rclient.set(DOName, JSON.stringify(DOobject));
               CreateDOksqlStream(DOobject);
               res.status(200).send(DOobject);
            }
         } else {
            res.status(500).send("please check mandatory field");
         }
      } else {
         res.status(500).send("is not a json structure");
      }
   });
});

function getNameList(key) {
   return new Promise((resolve) => {
      Rclient.lrange(key, 0, -1, function (err, keys) {
         if (err) throw err;
         resolve(keys);
      });
   });
}
async function checkNameExist(Name, key) {
   let NameList = await getNameList(key).then((List) => {
      return List;
   });
   let flag = false;
   return new Promise((resolve, reject) => {
      for (i in NameList) {
         if (NameList[i] == Name) {
            flag = true;
         }
      }
      resolve(flag);
   });
}
function CheckKeyExistAndAddCount(DOWholeData) {
   if (Object.keys(DOWholeData).some((v) => v == "sensor")) {
      DOWholeData.sensorCount = DOWholeData.sensor.length;
   }
   if (Object.keys(DOWholeData).some((v) => v == "control")) {
      DOWholeData.controlCount = DOWholeData.control.length;
   }
   DOWholeData.creationTime = new Date().getTime();
   return DOWholeData;
}

/*
 * DO Retrieve
 */
app.get("/DigitalTwin/:DOName", async (req, res) => {
   if (req.params.DOName) {
      let DOName = req.params.DOName;
      const flag = await checkNameExist(DOName, "DO").then(function (flag) {
         return flag;
      });
      if (flag) {
         Rclient.get(DOName, function (err, value) {
            if (err) throw err;
            res.status(200).send(JSON.parse(value));
         });
      } else {
         res.status(200).send("Unregistered DO");
      }
   } else {
      res.status(404).send("Bad Request");
      console.log("input value error");
   }
});

/*
 * DO DELETE
 */
app.delete("/DigitalTwin/:DOName", async (req, res) => {
   if (req.params.DOName) {
      let DOName = req.params.DOName;
      const flag = await checkNameExist(DOName, "DO").then(function (flag) {
         return flag;
      });
      if (flag) {
         Rclient.DEL(DOName);
         Rclient.LREM("DO", -1, DOName);
         res.send({ success: 1 });
      } else {
         res.status(200).send("Unregistered DO");
      }
   } else {
      res.status(404).send("Bad Request");
      console.log("input value error");
   }
});

/*
 * DO UPDATE
 */
app.put("/DigitalTwin/DO", async (req, res) => {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", async function () {
      if (tryJSONparse(fullBody)) {
         DOWholeData = tryJSONparse(fullBody);
         if (
            DOWholeData?.name &&
            DOWholeData?.sensor &&
            DOWholeData.sensor.length > 0
         ) {
            const flag = await checkNameExist(DOWholeData.name, "DO").then(
               function (flag) {
                  return flag;
               }
            );
            if (!flag) {
               res.status(500).send("Unregistered DO");
            } else {
               const DOName = DOWholeData.name;
               const DOobject = CheckKeyExistAndAddCount(DOWholeData);
               console.log("DO: ", DOobject);
               Rclient.set(DOName, JSON.stringify(DOobject));
               postDOobjectToKSQL(DOobject); //post DOobject
               res.status(200).send("update DO");
            }
         } else {
            res.status(500).send("please check mandatory field");
         }
      } else {
         res.status(500).send("is not a json structure");
      }
   });
});

//========================================================================>> SERVICE
/*
 * service Creation
 */
app.post("/DigitalTwin/service", function (req, res) {
   let fullBody = "",
      DataObject = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", async function () {
      if (tryJSONparse(fullBody)) {
         DataObject = tryJSONparse(fullBody);
         if (DataObject?.name && DataObject?.arg && DataObject?.url) {
            const flag = await checkNameExist(DataObject.name, "service").then(
               function (flag) {
                  return flag;
               }
            );
            if (flag) {
               res.status(500).send("is already exist");
            } else {
               const service = DataObject.name;
               Rclient.rpush("service", service);
               const sensorFields = Object.keys(DataObject);
               for (var i = 0; i < sensorFields.length; i++) {
                  const field = sensorFields[i];
                  Rclient.hset(
                     `service_${DataObject.name}`,
                     sensorFields[i],
                     JSON.stringify(DataObject[field])
                  );
               }
               res.status(200).send("successfully registered");
            }
         } else {
            res.status(500).send("please check mandatory field");
         }
      } else {
         res.status(500).send("is not a json structure");
      }
   });
});

/*
 * service Update
 */
app.put("/DigitalTwin/service", function (req, res) {
   let fullBody = "",
      DataObject = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", async function () {
      if (tryJSONparse(fullBody)) {
         DataObject = tryJSONparse(fullBody);
         if (
            DataObject?.name &&
            DataObject?.arg &&
            DataObject.arg.length > 0 &&
            DataObject?.url
         ) {
            const flag = await checkNameExist(DataObject.name, "service").then(
               function (flag) {
                  return flag;
               }
            );
            if (!flag) {
               res.status(500).send("Unregistered service");
            } else {
               const service = DataObject.name;
               const sensorFields = Object.keys(DataObject);
               for (var i = 0; i < sensorFields.length; i++) {
                  const field = sensorFields[i];
                  Rclient.hset(
                     `service_${DataObject.name}`,
                     sensorFields[i],
                     JSON.stringify(DataObject[field])
                  );
               }
               res.status(200).send("successfully update");
            }
         } else {
            res.status(500).send("please check mandatory field");
         }
      } else {
         res.status(500).send("is not a json structure");
      }
   });
});
//get hash table
function getKeys(Name) {
   return new Promise((resolve) => {
      Rclient.hkeys(Name, function (err, keys) {
         resolve(keys);
      });
   });
}
//get hash table fliel value
function getValue(Name, key) {
   return new Promise((resolve, reject) => {
      Rclient.hget(Name, key, function (err, value) {
         if (err) reject(err);
         resolve(JSON.parse(value));
      });
   });
}
/*
 * service Retrieve
 */
app.get("/DigitalTwin/service/:serviceName", async (req, res) => {
   if (req.params.serviceName) {
      let serviceName = req.params.serviceName;
      const flag = await checkNameExist(serviceName, "service").then(function (
         flag
      ) {
         return flag;
      });
      if (flag) {
         const keys = await getKeys(`service_${req.params.serviceName}`).then(
            function (keys) {
               return keys;
            }
         );

         let resObject = {};
         for (let key of keys) {
            const value = await getValue(
               `service_${req.params.serviceName}`,
               key
            );
            resObject[key] = value;
         }
         res.status(200).send(resObject);
      } else {
         res.status(200).send("Unregistered service");
      }
   } else {
      res.status(404).send("Bad Request");
      console.log("input value error");
   }
});

/*
 * service delete
 */
app.delete("/DigitalTwin/service/:serviceName", async (req, res) => {
   if (req.params.serviceName) {
      let serviceName = req.params.serviceName;
      const flag = await checkNameExist(serviceName, "service").then(function (
         flag
      ) {
         return flag;
      });
      if (flag) {
         Rclient.DEL(`service_${req.params.serviceName}`);
         Rclient.LREM("service", -1, req.params.serviceName);
         deleteSink(req.params.serviceName);
         res.send({ success: 1 });
      } else {
         res.status(200).send("Unregistered service");
      }
   } else {
      res.status(404).send("Bad Request");
      console.log("input value error");
   }
});

/*
 * service Trigger
 */
app.post("/DigitalTwin/service/trigger", function (req, res) {
   let fullBody = "",
      DataObject = "",
      resObject = {};
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", async function () {
      if (tryJSONparse(fullBody)) {
         DataObject = tryJSONparse(fullBody);
         if (DataObject?.name) {
            const flag = await checkNameExist(DataObject.name, "service").then(
               function (flag) {
                  return flag;
               }
            );
            if (flag) {
               const keys = await getKeys(`service_${DataObject.name}`).then(
                  function (keys) {
                     return keys;
                  }
               );
               for (let key of keys) {
                  const value = await getValue(
                     `service_${DataObject.name}`,
                     key
                  );
                  resObject[key] = value;
               }
               CreateSinkConnector(resObject);
               res.status(200).send(resObject);
            } else {
               res.status(200).send("Unregistered service");
            }
         } else {
            res.status(500).send("please check mandatory field");
         }
      } else {
         res.status(500).send("is not a json structure");
      }
   });
});

//=======================================================================================>> simulation

/*
 * simulation Creation
 */
app.post("/DigitalTwin/simulationGroup", function (req, res) {
   let fullBody = "",
      DataObject = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", async function () {
      if (tryJSONparse(fullBody)) {
         DataObject = tryJSONparse(fullBody);
         if (DataObject?.name && DataObject?.arg && DataObject?.url) {
            const flag = await checkNameExist(
               DataObject.name,
               "simulation"
            ).then(function (flag) {
               return flag;
            });
            if (flag) {
               res.status(500).send("is already exist");
            } else {
               const simulation = DataObject.name;
               Rclient.rpush("simulation", simulation);
               const sensorFields = Object.keys(DataObject);
               for (var i = 0; i < sensorFields.length; i++) {
                  const field = sensorFields[i];
                  Rclient.hset(
                     `simulation_${DataObject.name}`,
                     field,
                     JSON.stringify(DataObject[field])
                  );
               }
               res.status(200).send(DataObject);
            }
         } else {
            res.status(500).send("please check mandatory field");
         }
      } else {
         res.status(500).send("is not a json structure");
      }
   });
});

/*
 * simulation Update
 */
app.put("/DigitalTwin/simulationGroup", function (req, res) {
   let fullBody = "",
      DataObject = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", async function () {
      if (tryJSONparse(fullBody)) {
         DataObject = tryJSONparse(fullBody);
         if (DataObject?.name && DataObject?.arg && DataObject?.url) {
            const flag = await checkNameExist(
               DataObject.name,
               "simulation"
            ).then(function (flag) {
               return flag;
            });
            if (!flag) {
               res.status(500).send("Unregistered simulation");
            } else {
               const simulation = DataObject.name;
               const sensorFields = Object.keys(DataObject);
               for (var i = 0; i < sensorFields.length; i++) {
                  const field = sensorFields[i];
                  Rclient.hset(
                     `simulation_${DataObject.name}`,
                     sensorFields[i],
                     JSON.stringify(DataObject[field])
                  );
               }
               res.status(200).send("successfully update");
            }
         } else {
            res.status(500).send("please check mandatory field");
         }
      } else {
         res.status(500).send("is not a json structure");
      }
   });
});

/*
 * simulation Retrieve
 */
app.get("/DigitalTwin/simulationGroup/:simulationName", async (req, res) => {
   if (req.params.simulationName) {
      let simulationName = req.params.simulationName;
      const flag = await checkNameExist(simulationName, "simulation").then(
         function (flag) {
            return flag;
         }
      );
      if (flag) {
         const keys = await getKeys(
            `simulation_${req.params.simulationName}`
         ).then(function (keys) {
            return keys;
         });

         let resObject = {};
         for (let key of keys) {
            const value = await getValue(
               `simulation_${req.params.simulationName}`,
               key
            );
            resObject[key] = value;
         }
         res.status(200).send(resObject);
      } else {
         res.status(200).send("Unregistered simulation");
      }
   } else {
      res.status(404).send("Bad Request");
      console.log("input value error");
   }
});

/*
 * simulation delete
 */
app.delete("/DigitalTwin/simulationGroup/:simulationName", async (req, res) => {
   if (req.params.simulationName) {
      let simulationName = req.params.simulationName;
      const flag = await checkNameExist(simulationName, "simulation").then(
         function (flag) {
            return flag;
         }
      );
      if (flag) {
         Rclient.DEL(`simulation_${req.params.simulationName}`);
         Rclient.LREM("simulation", -1, req.params.simulationName);
         deleteSink(req.params.simulationName);
         res.send({ success: 1 });
      } else {
         res.status(200).send("Unregistered simulation");
      }
   } else {
      res.status(404).send("Bad Request");
      console.log("input value error");
   }
});

function deleteSink(connectorName) {
   console.log("Delete Sink Connector");
   options.method = DELETE;
   options.path = `/connectors/${connectorName}`;
   /**
    * Send Request to Kafka Connect Server
    */
   var request = http.request(options, function (response) {
      let fullBody = "";

      response.on("data", function (chunk) {
         fullBody += chunk;
      });

      response.on("end", function () {
         console.log(fullBody);
      });

      response.on("error", function (error) {
         console.error(error);
      });
   });
   request.end();
}

/*
 * simulation Trigger
 * RT: RealTime
 */
app.post("/DigitalTwin/simulationRTtrigger/:simName", function (req, res) {
   let fullBody = "",
      simName = "",
      resObject = {};
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", async function () {
      if (req.params.simName) {
         simName = req.params.simName;
      } else {
         res.status(500).send("please check simName parameter");
      }
      if (req.params.simName) {
         let simName = req.params.simName;
         const flag = await checkNameExist(simName, "simulation").then(
            function (flag) {
               return flag;
            }
         );
         if (flag) {
            const keys = await getKeys(`simulation_${simName}`).then(function (
               keys
            ) {
               return keys;
            });
            for (let key of keys) {
               const value = await getValue(`simulation_${simName}`, key);
               resObject[key] = value;
            }
            console.log(
               `createRTSink: `,
               util.inspect(resObject, false, null, true)
            );
            //CreateSinkConnector(resObject);
            res.status(200).send(resObject);
         } else {
            res.status(200).send("Unregistered simulation");
         }
      } else {
         res.status(500).send("please check simName parameter");
      }
   });
});

/*
 * simulation Trigger
 * ST: Static Time
 */
app.post("/DigitalTwin/simulationSTtrigger/:simName", function (req, res) {
   let fullBody = "",
      DataObject = "",
      simName = "",
      resObject = {};
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", async function () {
      if (req.params.simName) {
         simName = req.params.simName;
      } else {
         res.status(500).send("please check simName parameter");
      }
      if (tryJSONparse(fullBody)) {
         DataObject = tryJSONparse(fullBody);
         if (DataObject?.data) {
            const flag = await checkNameExist(simName, "simulation").then(
               function (flag) {
                  return flag;
               }
            );
            if (flag) {
               const keys = await getKeys(`simulation_${simName}`).then(
                  function (keys) {
                     return keys;
                  }
               );
               for (let key of keys) {
                  const value = await getValue(`simulation_${simName}`, key);
                  resObject[key] = value;
               }
               //resObject.url로 DataObject전송
               console.log(
                  `createSTSink:  url => ${
                     resObject.url
                  } , data => ${util.inspect(DataObject.data)}`
               );
               //CreateSinkConnector(resObject);
               res.status(200).send(
                  `createSTSink:  url => ${
                     resObject.url
                  } , data => ${util.inspect(DataObject.data)}`
               );
            } else {
               res.status(200).send("Unregistered simulation");
            }
         } else {
            res.status(500).send("please check mandatory field");
         }
      } else {
         res.status(500).send("is not a json structure");
      }
   });
});
//=======================================================================>> control

/*
 * control Creation
 */
app.post("/DigitalTwin/:DOName/control", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let DOName = req.params.DOName;
      var controlNameObject;
      controlNameObject = JSON.parse(fullBody);

      if (DONameList.includes(DOName)) {
         console.log("body: ", controlNameObject, "DOName: ", DOName);
         DOWholeDataList.forEach((element, index) => {
            if (element.name == DOName) {
               if (element.control) {
                  var filtered = where(element.control, {
                     name: controlNameObject.name,
                  });
                  if (filtered[0]) {
                     res.status(400).send("control is already exist");
                     console.log("same name exist: ", filtered[0]);
                     console.log("element: ", element);
                  } else {
                     res.status(200).send("Received control Data");
                     element.control.push(controlNameObject);
                     element.controlCount++;
                     console.log("push: ", element);
                  }
               } else {
                  res.status(200).send("Received control Data");
                  element.control = [controlNameObject];
                  element.controlCount = 1;
                  console.log(
                     "control push: ",
                     util.inspect(element, false, null, true)
                  );
               }
            }
         });
      } else {
         res.status(404).send("DO does not exist");
      }
   });
});

/*
 * control data Creation
 */
app.post("/DigitalTwin/:DOName/controlData", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let DOName = req.params.DOName;
      var controlDataObject;
      controlDataObject = JSON.parse(fullBody);

      if (DONameList.includes(DOName)) {
         console.log("body: ", controlDataObject, "DOName: ", DOName);
         DOWholeDataList.forEach((element, index) => {
            if (element.name == DOName) {
               if (element.control) {
                  var filtered = where(element.control, {
                     name: controlDataObject.name,
                  });
                  if (filtered[0]) {
                     res.status(200).send("Received control Data");
                     // console.log("control is exist: ", filtered[0]);
                     // console.log("element: ", util.inspect(element, false, null, true));
                     if (filtered[0].data) {
                        filtered[0].data.push(controlDataObject.data); //check please!!
                        var fifoControlDataPushArray = new FifoArray(
                           5,
                           filtered[0].data
                        );
                        filtered[0].data = fifoControlDataPushArray;
                        console.log(
                           "create data arr & push data: ",
                           util.inspect(element, false, null, true)
                        );
                        var controlDataElementToString =
                           JSON.stringify(element);
                        client.publish(
                           "dp_do_data",
                           controlDataElementToString
                        ); //send string text!
                        Rclient.set(key_DO, JSON.stringify(value));
                     } else {
                        filtered[0].data = [controlDataObject.data];
                        console.log(
                           "push data: ",
                           util.inspect(element, false, null, true)
                        );
                        var controlDataElementToString =
                           JSON.stringify(element);
                        client.publish(
                           "dp_do_data",
                           controlDataElementToString
                        ); //send string text!
                        Rclient.set(key_DO, JSON.stringify(value));
                     }
                  } else {
                     res.status(404).send("The control name does not exist");
                  }
               } else {
                  // control create tag does not exist
                  res.status(404).send("A DO with no control created");
               }
            }
         });
      } else {
         res.status(404).send("DO does not exist");
      }
   });
});

/*
 * control result update
 */
app.put("/DigitalTwin/:DOName/:controlName", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let DOName = req.params.DOName;
      let controlName = req.params.controlName;
      var controlUpdateDataObject;
      controlUpdateDataObject = JSON.parse(fullBody);
      if (DONameList.includes(DOName)) {
         res.status(200).send("Received control Data");
         DOWholeDataList.forEach((element, index) => {
            if (element.name == DOName) {
               if (element.control) {
                  var filtered = where(element.control, { name: controlName });
                  if (filtered[0]) {
                     if (filtered[0].data) {
                        filtered[0].data.forEach((data, index) => {
                           const controlData = data.toString();
                           let controlDataStringArr = controlData.split(", ");
                           const updateControlData =
                              controlUpdateDataObject.data.toString();
                           let updateControlDataStringArr =
                              updateControlData.split(", ");

                           if (
                              controlDataStringArr[0] ==
                                 updateControlDataStringArr[0] &&
                              controlDataStringArr[1] ==
                                 updateControlDataStringArr[1]
                           ) {
                              if (controlUpdateDataObject.controlDone) {
                                 let dataString =
                                    controlUpdateDataObject.data +
                                    ", " +
                                    controlUpdateDataObject.controlReceived +
                                    ", " +
                                    controlUpdateDataObject.controlDone;
                                 filtered[0].data.splice(index, 1, dataString);
                                 let controlDataSetToString =
                                    JSON.stringify(element);
                                 client.publish(
                                    "dp_do_data",
                                    controlDataSetToString
                                 );
                                 Rclient.set(key_DO, JSON.stringify(value));
                                 console.log(
                                    "Update controlReceived, controlDone: ",
                                    util.inspect(element, false, null, true)
                                 );
                              } else {
                                 let dataString =
                                    controlUpdateDataObject.data +
                                    ", " +
                                    controlUpdateDataObject.controlReceived;
                                 filtered[0].data.splice(index, 1, dataString);
                                 let controlDataSetToString =
                                    JSON.stringify(element);
                                 client.publish(
                                    "dp_do_data",
                                    controlDataSetToString
                                 );
                                 Rclient.set(key_DO, JSON.stringify(value));
                                 console.log(
                                    "Update controlReceived: ",
                                    util.inspect(element, false, null, true)
                                 );
                              }
                           }
                        });
                     }
                  }
               }
            }
         });
      } else {
         res.status(404).send("DO does not exist");
      }
   });
});

/*
 * control delete
 */
app.delete("/DigitalTwin/:DOName/control/:controlName", (req, res) => {
   let DOName = req.params.DOName;
   let controlName = req.params.controlName;
   console.log(DOName, controlName);
   if (DONameList.includes(DOName)) {
      DOWholeDataList.forEach((element, index) => {
         if (element.name == DOName) {
            if (element.control) {
               var filtered = where(element.control, { name: controlName });
               if (filtered[0]) {
                  var controlIndex = element.control.findIndex(
                     (i) => i.name == controlName
                  );
                  element.control.splice(controlIndex, 1);
                  element.controlCount--;
                  console.log(
                     "element: ",
                     util.inspect(element, false, null, true)
                  );

                  res.status(200).send(`control ${controlName} delete`);
               } else {
                  res.status(200).send("control does not exist");
                  console.log(
                     "element: ",
                     util.inspect(element, false, null, true)
                  );
               }
            } else {
               res.status(404).send("control object does not exist");
               console.log("control does not exist");
               console.log(
                  "element: ",
                  util.inspect(element, false, null, true)
               );
            }
         }
      });
   } else {
      res.status(404).send("DO does not exist");
   }
});

//=============================================================================> KAFKA SINK
const url = require("url");
const http = require("http");
const POST = "post";
const GET = "get";
const DELETE = "delete";
const PUT = "put";

let kafkaConnectServer = "http://10.252.73.37:8083/connectors";
kafkaConnectServer = url.parse(kafkaConnectServer, true);

let sinkConnectorBody = {
   name: "",
   config: {
      "connector.class": "uk.co.threefi.connect.http.HttpSinkConnector",
      "tasks.max": "1",
      "http.api.url": "",
      topics: "",
      "request.method": "",
      headers: "Content-Type:application/json|Accept:application/json",
      "key.converter": "org.apache.kafka.connect.storage.StringConverter",
      "value.converter": "org.apache.kafka.connect.storage.StringConverter",
   },
};

var options = {
   hostname: kafkaConnectServer.hostname,
   port: kafkaConnectServer.port,
   path: kafkaConnectServer.pathname,
   headers: {
      "Content-Type": "application/json",
   },
   maxRedirects: 20,
};

function CreateSinkConnector(resObject) {
   const { name, url, arg } = { ...resObject };
   let connectorName = name;

   sinkConnectorBody.name = `${connectorName}`;
   sinkConnectorBody.config["http.api.url"] = url;
   sinkConnectorBody.config["request.method"] = "POST";
   sinkConnectorBody.config["topics"] = arg.toString();

   options.method = POST;
   /**
    * Send Request to Kafka Connect Server
    */
   var request = http.request(options, function (response) {
      var chunks = [];

      response.on("data", function (chunk) {
         chunks.push(chunk);
      });

      response.on("end", function (chunk) {
         var body = Buffer.concat(chunks);
         console.log(body.toString());
      });

      response.on("error", function (error) {
         console.error(error);
      });
   });
   request.write(JSON.stringify(sinkConnectorBody));
   request.end();
}

/**
 * @method CreateDOStream
 * @param DOName
 * @description
 * Merge sensor streams to DO Stream
 * 3 partitions
 * auto offset reset :  earlist
 * get sensor list from DO Object and merge stream
 */
function CreateDOksqlStream(DOobject) {
   console.log("create DO Stream");
   let DOName = DOobject.name;
   Options.path = "/ksql";
   Options.method = POST;

   // Create DO Stream
   let createStreamSQL = {
      ksql: `create stream ${DOName} (sensorname varchar,value varchar) with (kafka_topic='${DOName}', value_format='json', partitions=3);`,
      streamsProperties: {
         "ksql.streams.auto.offset.reset": "earliest",
      },
   };

   // Get Sensor List from DO Object
   let sensorList = DOobject.sensor;
   console.log(sensorList);

   let insertStreamSQL = {
      ksql: ``,
      streamsProperties: {
         "ksql.streams.auto.offset.reset": "earliest",
      },
   };
   sensorList.forEach((sensor) => {
      insertStreamSQL.ksql += `INSERT INTO ${DOName} SELECT '${sensor}' AS sensorname, value FROM ${sensor}; `;
   });

   //Send Request to Ksqldb Server
   var request = http.request(Options, function (response) {
      let fullBody = "";

      response.on("data", function (chunk) {
         fullBody += chunk;
      });

      response.on("end", function () {
         console.log(fullBody);
         console.log("Insert Sensor Stream to DO");

         var insertRequest = http.request(Options, function (insertResponse) {
            let fullBody = "";

            insertResponse.on("data", function (chunk) {
               fullBody += chunk;
            });

            insertResponse.on("end", function () {
               console.log(fullBody);
            });

            insertResponse.on("error", function (error) {
               console.error(error);
            });
         });
         insertRequest.write(JSON.stringify(insertStreamSQL));
         insertRequest.end();
         // res.status(201).json(req.body);
      });

      response.on("error", function (error) {
         console.error(error);
      });
   });
   console.log(
      "JSON.stringify(createStreamSQL): ",
      JSON.stringify(createStreamSQL),
      "insertStreamSQL: ",
      JSON.stringify(insertStreamSQL)
   );
   request.write(JSON.stringify(createStreamSQL));
   request.end();
}

//====================================The 404 Route (ALWAYS Keep this as the last route)
app.get("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});

app.post("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});

app.delete("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});

app.put("*", function (req, res) {
   res.send("Bad Request (Wrong Url)", 404);
});