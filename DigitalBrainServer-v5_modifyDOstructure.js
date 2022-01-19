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
            //
            const flag = await checkDOnameExist(DOWholeData.name).then(
               function (flag) {
                  return flag;
               }
            );
            if (flag) {
               res.status(500).send("DO is already exist");
            } else {
               const DOName = DOWholeData.name;
               Rclient.rpush("DOname", DOName);
               const DOobject = CheckKeyExistAndAddCount(DOWholeData);
               Rclient.set(DOName, JSON.stringify(DOobject));

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

function getDOnameList() {
   return new Promise((resolve) => {
      Rclient.lrange("DOname", 0, -1, function (err, keys) {
         if (err) throw err;
         resolve(keys);
      });
   });
}
async function checkDOnameExist(DOname) {
   let DOnameList = await getDOnameList().then((List) => {
      return List;
   });
   let flag = false;
   return new Promise((resolve, reject) => {
      for (i in DOnameList) {
         if (DOnameList[i] == DOname) {
            flag = true;
         }
      }
      resolve(flag);
   });
}
function CheckKeyExistAndAddCount(DOWholeData) {
   if (Object.keys(DOWholeData).some((v) => v == "sensor")) {
      DOWholeData.sensorCount = DOWholeData.sensor.length;
      //DigitalConnectorAlarm(DOWholeData);
   }
   if (Object.keys(DOWholeData).some((v) => v == "control")) {
      DOWholeData.controlCount = DOWholeData.control.length;
   }
   DOWholeData.creationTime = new Date().getTime();
   return DOWholeData;
}

function DigitalConnectorAlarm(DOWholeData) {
   var req = unirest("POST", "localhost:1203/DigitalConnector/DO")
      .headers({
         "Content-Type": "application/json",
      })
      .send(JSON.stringify(DOWholeData))
      .end(function (res) {
         if (res.error) throw new Error(res.error);
         console.log(res.raw_body);
      });
}

/*
 * DO Retrieve
 */
app.get("/DigitalTwin/:DOName", async (req, res) => {
   if (req.params.DOName) {
      let DOName = req.params.DOName;
      const flag = await checkDOnameExist(DOName).then(function (flag) {
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
      const flag = await checkDOnameExist(DOName).then(function (flag) {
         return flag;
      });
      if (flag) {
         Rclient.DEL(DOName);
         Rclient.LREM("DOname", -1, DOName);
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
         if (DOWholeData?.name && DOWholeData?.sensor) {
            const flag = await checkDOnameExist(DOWholeData.name).then(
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

/*
 * sensor Creation
 */
app.post("/DigitalTwin/:DOName/sensor", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let DOName = req.params.DOName;
      var sensorNameObject;
      sensorNameObject = JSON.parse(fullBody);

      if (DONameList.includes(DOName)) {
         DOWholeDataList.forEach((element, index) => {
            if (element.name == DOName) {
               if (element.sensor) {
                  var filtered = where(element.sensor, {
                     name: sensorNameObject.name,
                  });
                  if (filtered[0]) {
                     res.status(400).send("Sensor is already exist");
                     console.log("same name exist: ", filtered[0]);
                     console.log("element: ", element);
                  } else {
                     res.status(200).send("Received Sensor Data");
                     element.sensor.push(sensorNameObject);
                     element.sensorCount++;
                     console.log("push: ", element);
                  }
               } else {
                  res.status(200).send("Received Sensor Data");
                  console.log("sensor does not exist");
                  element.sensor = [sensorNameObject];
                  element.sensorCount = 1;
                  console.log(
                     "sensor push: ",
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
 * simulation Creation
 * localhost:1005/DigitalTwin/:DOName/simulation?mqtt=enable
 */
app.post("/DigitalTwin/:DOName/simulation", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let DOName = req.params.DOName;
      var simulationNameObject;
      simulationNameObject = JSON.parse(fullBody);
      if (req.query?.mqtt) {
         PushsimulationMQTTpubList(
            DOSIMmqttPubObjList,
            DOName,
            simulationNameObject.name
         );
      }

      if (DONameList.includes(DOName)) {
         console.log("body: ", simulationNameObject, "DOName: ", DOName);
         DOWholeDataList.forEach((element, index) => {
            if (element.name == DOName) {
               if (element.simulation) {
                  var filtered = where(element.simulation, {
                     name: simulationNameObject.name,
                  });
                  if (filtered[0]) {
                     res.status(400).send("simulation is already exist");
                     console.log("same name exist: ", filtered[0]);
                     console.log("element: ", element);
                  } else {
                     res.status(200).send("Received simulation Data");
                     element.simulation.push(simulationNameObject);
                     element.simulationCount++;
                     console.log("push: ", element);
                  }
               } else {
                  res.status(200).send("Received simulation Data");
                  element.simulation = [simulationNameObject];
                  element.simulationCount = 1;
                  console.log(
                     "simulation push: ",
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

function PushsimulationMQTTpubList(DOSIMmqttPubObjList, DOName, simName) {
   //console.log("DOSIMmqttPubObjList: ", DOSIMmqttPubObjList);
   //console.log("DOName: ", DOName, "simName: ",simName);
   DOSIMmqttPubObjList?.[DOName]?.push(simName);
   //console.log("DOSIMmqttPubObjList: ", DOSIMmqttPubObjList);
}

/*
 * sensor delete
 */
app.delete("/DigitalTwin/:DOName/sensor/:sensorName", (req, res) => {
   let DOName = req.params.DOName;
   let sensorName = req.params.sensorName;
   //console.log(DOName, sensorName);
   if (DONameList.includes(DOName)) {
      DOWholeDataList.forEach((element, index) => {
         if (element.name == DOName) {
            if (element.sensor) {
               var filtered = where(element.sensor, { name: sensorName });
               if (filtered[0]) {
                  var sensorIndex = element.sensor.findIndex(
                     (i) => i.name == sensorName
                  );
                  element.sensor.splice(sensorIndex, 1);
                  element.sensorCount--;
                  //console.log("element: ", util.inspect(element, false, null, true));
                  res.status(200).send(`sensor ${sensorName} delete`);
               } else {
                  res.status(200).send("sensor does not exist");
                  //console.log("element: ", util.inspect(element, false, null, true));
               }
            } else {
               res.status(404).send("sensor object does not exist");
               console.log("sensor does not exist");
               //console.log("element: ", util.inspect(element, false, null, true));
            }
         }
      });
   } else {
      res.status(404).send("DO does not exist");
   }
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

/*
 * simulation delete
 */
app.delete("/DigitalTwin/:DOName/simulation/:simulationName", (req, res) => {
   let DOName = req.params.DOName;
   let simulationName = req.params.simulationName;
   console.log(DOName, simulationName);
   if (DONameList.includes(DOName)) {
      DOWholeDataList.forEach((element, index) => {
         if (element.name == DOName) {
            if (element.simulation) {
               var filtered = where(element.simulation, {
                  name: simulationName,
               });
               if (filtered[0]) {
                  var simulationIndex = element.simulation.findIndex(
                     (i) => i.name == simulationName
                  );
                  element.simulation.splice(simulationIndex, 1);
                  element.simulationCount--;
                  console.log(
                     "element: ",
                     util.inspect(element, false, null, true)
                  );
                  res.status(200).send(`simulation ${simulationName} delete`);
               } else {
                  console.log(
                     "element: ",
                     util.inspect(element, false, null, true)
                  );
                  res.status(200).send("simulation does not exist");
               }
            } else {
               res.status(404).send("simulation object does not exist");
               console.log("simulation does not exist");
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

/*
 * Simulation Trigger
 */
app.post("/DigitalTwin/:DOName/simulationTrigger", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let DOName = req.params.DOName;
      var simulationDataObject;
      simulationDataObject = JSON.parse(fullBody);
      if (simulationDataObject.simargs) {
         // console.log("simulationDataObject: ", util.inspect(simulationDataObject, false, null, true));

         if (DONameList.includes(DOName)) {
            //console.log("body: ", simulationDataObject, "DOName: ", DOName);
            DOWholeDataList.forEach((element, index) => {
               if (element.name == DOName) {
                  if (element.simulation) {
                     var filtered = where(element.simulation, {
                        name: simulationDataObject.name,
                     });
                     if (filtered[0]) {
                        //data로 받은 simulation name과 같은 객체
                        res.status(200).send("Received simulation Data");
                        //console.log("element: ", util.inspect(filtered[0], false, null, true));

                        var simargsObject = {};
                        simargsObject.simargs = simulationDataObject.simargs;
                        simargsObject.result = null;
                        simargsObject.ts = Date.now();
                        if (filtered[0].sim) {
                           //simulation[(element.name == DOName)].sim이 있으면
                           filtered[0].sim.push(simargsObject);
                           var fifoSimulationDataPushArray = new FifoArray(
                              5,
                              filtered[0].sim
                           );
                           filtered[0].sim = fifoSimulationDataPushArray;
                           //console.log("create sim tag & push data: \n", util.inspect(DOWholeDataList, false, null, true));

                           //MQTT PUB
                           var simulationDataSet = { ...simargsObject };
                           simulationDataSet.DO = DOName;
                           simulationDataSet.sim = simulationDataObject.name;
                           simulationDataSet.result = null;
                           var simulationDataSetToString =
                              JSON.stringify(simulationDataSet);
                           client.publish(
                              "sim_send",
                              simulationDataSetToString
                           );
                        } else {
                           //simulation[(element.name == DOName)].sim이 없으면
                           filtered[0].sim = [simargsObject];
                           //console.log("push data: \n", util.inspect(DOWholeDataList, false, null, true));

                           //MQTT PUB
                           var simulationDataSet = { ...simargsObject };
                           simulationDataSet.DO = DOName;
                           simulationDataSet.sim = simulationDataObject.name;
                           simulationDataSet.result = null;
                           var simulationDataSetToString =
                              JSON.stringify(simulationDataSet);
                           client.publish(
                              "sim_send",
                              simulationDataSetToString
                           );
                        }
                     } else {
                        //req로 받은  simulation name이 존재하지 않음
                        res.status(404).send(
                           "This simulation name does not exist"
                        );
                        console.log(
                           "This simulation name does not exist: ",
                           util.inspect(element, false, null, true)
                        );
                     }
                  } else {
                     //DO에 simulation이 생성돼있지 않음
                     console.log(
                        "simulation does not exist: ",
                        util.inspect(element, false, null, true)
                     );
                     res.status(404).send("simulation does not exist");
                  }
               }
            });
         } else {
            res.status(404).send("DO does not exist");
         }
      } else {
         res.status(404).send("simargs does not exist");
      }
   });
});

/*
 * Simulation Trigger result version
 */
app.post("/DigitalTwin/:DOName/simulationResult", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      let DOName = req.params.DOName;
      var simulationDataObject;
      simulationDataObject = JSON.parse(fullBody);
      if (simulationDataObject.simargs) {
         if (DONameList.includes(DOName)) {
            DOWholeDataList.forEach((element, index) => {
               if (element.name == DOName) {
                  if (element.simulation) {
                     var filtered = where(element.simulation, {
                        name: simulationDataObject.name,
                     });
                     if (filtered[0]) {
                        res.status(200).send("Received simulation Data");
                        //console.log("element: ", util.inspect(filtered[0], false, null, true));
                        var simargsObject = {};
                        if (simulationDataObject.ts) {
                           simargsObject = { ...simulationDataObject };
                           delete simargsObject.name;
                        } else {
                           simargsObject.simargs = simulationDataObject.simargs;
                           simargsObject.result = simulationDataObject.result;
                           simargsObject.ts = Date.now();
                        }

                        if (filtered[0].sim) {
                           //console.log("simargsObject: ", simargsObject);
                           filtered[0].sim.push(simargsObject);
                           var fifoSimulationDataPushArray = new FifoArray(
                              5,
                              filtered[0].sim
                           );
                           filtered[0].sim = fifoSimulationDataPushArray;
                           //console.log("create sim tag & push data: \n", util.inspect(DOWholeDataList, false, null, true));

                           //MQTT PUB (optional)
                           let enableOption = checkEnableOption(
                              DOSIMmqttPubObjList,
                              DOName,
                              simulationDataObject.name
                           );
                           if (enableOption) {
                              //console.log("MQTT push : \n", util.inspect(element, false, null, true));
                              var DOWholeDataListToString =
                                 JSON.stringify(element);
                              client.publish(
                                 "dp_do_data",
                                 DOWholeDataListToString
                              ); //send string text!
                              Rclient.set(key_DO, JSON.stringify(value));
                           }
                        } else {
                           filtered[0].sim = [simargsObject];
                           //console.log("push data: \n", util.inspect(DOWholeDataList, false, null, true));
                           //MQTT PUB (optional)
                           let enableOption = checkEnableOption(
                              DOSIMmqttPubObjList,
                              DOName,
                              simulationDataObject.name
                           );
                           if (enableOption) {
                              //console.log("MQTT push : \n", util.inspect(element, false, null, true));
                              var DOWholeDataListToString =
                                 JSON.stringify(element);
                              client.publish(
                                 "dp_do_data",
                                 DOWholeDataListToString
                              ); //send string text!
                              Rclient.set(key_DO, JSON.stringify(value));
                           }
                        }
                     } else {
                        //req로 받은  simulation name이 존재하지 않음
                        res.status(404).send(
                           "This simulation name does not exist"
                        );
                        console.log(
                           "This simulation name does not exist: ",
                           util.inspect(element, false, null, true)
                        );
                     }
                  } else {
                     //DO에 simulation이 생성돼있지 않음
                     console.log(
                        "simulation does not exist: ",
                        util.inspect(element, false, null, true)
                     );
                     res.status(404).send("simulation does not exist");
                  }
               }
            });
         } else {
            res.status(404).send("DO does not exist");
         }
      } else {
         res.status(404).send("simargs does not exist");
      }
   });
});

function checkEnableOption(DOSIMmqttPubObjList, DOName, simName) {
   //console.log("DOSIMmqttPubObjList: ", DOSIMmqttPubObjList);
   //console.log("DOName: ", DOName, "simName: ",simName);
   return DOSIMmqttPubObjList?.[DOName]?.includes(simName);
}

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

// var options = {
//    hostname: kafkaConnectServer.hostname,
//    port: kafkaConnectServer.port,
//    path: kafkaConnectServer.pathname,
//    headers: {
//       "Content-Type": "application/json",
//    },
//    maxRedirects: 20,
// };

/**
 * Create Sink Connector
 */
app.post("/sinkConnector/:DOName", (req, res) => {
   /**
    * get simulation list
    */
   let simName = "";
   let simURL = "";
   DOWholeDataList.forEach((element, index) => {
      if (element.name == DOName) {
         console.log(element.simulation);
         element.simulation.forEach((simulation, index) => {
            simName = simulation.name;
            simURL = simulation.simURL;
         });
      }
   });
   let DOName = req.params.DOName;
   let connectorName = `${DOName}_${simName}`;

   requestBody.name = connectorName;
   requestBody.config["http.api.url"] = simURL;
   requestBody.config["request.method"] = "POST";
   requestBody.config["topics"] = DOName;

   //options.method = POST;

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
         res.status(201).json(req.body);
      });

      response.on("error", function (error) {
         console.error(error);
         res.status(400).send("Create Sink Connector Error", error);
      });
   });
   request.write(JSON.stringify(sinkConnectorBody));
   request.end();
});

/**
 * Delete Sink Connector
 */
app.delete("/sinkConnector/:connectorName", (req, res) => {
   console.log("delete sink connector");
});

/**
 * Retrieve Sink Connector List
 */

app.get("/sinkConnector/list", (req, res) => {
   console.log("retrieve sink connector list");
});

/**
 * Retrieve Sink Connector Status
 */
app.get("/sinkConnector/status/:connectorName", (req, res) => {
   console.log("retrieve sink connector status");
});

//The 404 Route (ALWAYS Keep this as the last route)
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
