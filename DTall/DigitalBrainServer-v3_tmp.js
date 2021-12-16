const express = require("express");
const app = express();
var unirest = require("unirest");
const util = require("util");
const where = require("lodash.where");
const FifoArray = require("fifo-array");
var moment = require("moment-timezone");
moment.tz.setDefault("UTC");
const mqtt = require("mqtt");
app.listen(1005, () => {
   console.log("Server Start on port 1005");
});
const client = mqtt.connect("mqtt://192.168.0.100:1883");
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
 * MQTT-subscribe
 */
client.subscribe("dp_sensor_data", function (err) {
   if (err) {
      console.log("dp_sensor subscribe err!", err);
   }
});
client.subscribe("dp_sim_data", function (err) {
   if (err) {
      console.log("dp_simulation subscribe err!", err);
   }
});
client.subscribe("sim_recv", function (err) {
   if (err) {
      console.log("dp_simulation subscribe err!", err);
   }
});

client.on("message", (topic, message, packet) => {
   //console.log("topic: " + topic + ", message: " + message);

   /*
    * sensor data create
    */
   if (topic == "dp_sensor_data") {
      // read sensor data
      sensorDataCreation(message);
   }

   /*
    * simulation get simulation & data update
    */
   if (topic == "dp_sim_data") {
      // read simulation result
      simargsResultUpdate(message);
   }

   /*
    * simulation get trigger result update
    */
   if (topic == "sim_recv") {
      // read simulation result
      simulationResultUpdate(message);
   }
});

function simargsResultUpdate(message) {
   let simargsResultObject = JSON.parse(message);
   //console.log("simargsResultObject: ", util.inspect(simargsResultObject, false, null, true));
   let DOName = simargsResultObject.DO;

   if (simargsResultObject.simargs) {
      if (DONameList.includes(DOName)) {
         DOWholeDataList.forEach((element, index) => {
            if (element.name == DOName) {
               if (element.simulation) {
                  var filtered = where(element.simulation, {
                     name: simargsResultObject.name,
                  });
                  if (filtered[0]) {
                     var simargsObject = {};
                     if (simargsResultObject.ts) {
                        simargsObject = { ...simargsResultObject };
                        delete simargsObject.name;
                        delete simargsObject.DO;
                     } else {
                        simargsObject.simargs = simargsResultObject.simargs;
                        simargsObject.result = simargsResultObject.result;
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
                           simargsResultObject.name
                        );
                        if (enableOption) {
                           //console.log("MQTT push : \n", util.inspect(element, false, null, true));
                           var DOWholeDataListToString =
                              JSON.stringify(element);
                           client.publish(
                              "dp_do_data",
                              DOWholeDataListToString
                           ); //send string text!
                        }
                     } else {
                        filtered[0].sim = [simargsObject];
                        //console.log("push data: \n", util.inspect(DOWholeDataList, false, null, true));
                        //MQTT PUB (optional)
                        let enableOption = checkEnableOption(
                           DOSIMmqttPubObjList,
                           DOName,
                           simargsResultObject.name
                        );
                        if (enableOption) {
                           //console.log("MQTT push : \n", util.inspect(element, false, null, true));
                           var DOWholeDataListToString =
                              JSON.stringify(element);
                           client.publish(
                              "dp_do_data",
                              DOWholeDataListToString
                           ); //send string text!
                        }
                     }
                  } else {
                     //req로 받은  simulation name이 존재하지 않음
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
               }
            }
         });
      } else {
         console.log("DO does not exist");
      }
   } else {
      console.log("simargs does not exist");
   }
}

function sensorDataCreation(message) {
   let sensorData = JSON.parse(message);
   console.log("sensorData: ", util.inspect(sensorData, false, null, true));
   DOWholeDataList.forEach((element, index) => {
      if (element.sensor) {
         var filtered = where(element.sensor, { name: sensorData.name });

         if (filtered[0]) {
            if (filtered[0].data) {
               filtered[0].data.push(sensorData.data); //check please!!
               var fifoPushArray = new FifoArray(5, filtered[0].data);
               filtered[0].data = fifoPushArray;
               var elementToString = JSON.stringify(element);
               client.publish("dp_do_data", elementToString); //send string text!
            } else {
               filtered[0].data = [sensorData.data];
               //console.log("push data");
               var elementToString = JSON.stringify(element);
               client.publish("dp_do_data", elementToString); //send string text!
            }
         } else {
            console.log(
               "sensor does not exist: ",
               util.inspect(element, false, null, true)
            );
         }
      } else {
         console.log("There are no sensor object in this DO");
      }
   });
}

function simulationResultUpdate(message) {
   let simulationResult = JSON.parse(message);
   if (
      simulationResult.DO &&
      simulationResult.sim &&
      simulationResult.simargs &&
      simulationResult.ts &&
      simulationResult.result
   ) {
      let DOName = simulationResult.DO;
      let simulationName = simulationResult.sim;
      if (DONameList.includes(DOName)) {
         DOWholeDataList.forEach((element, index) => {
            if (element.name == DOName) {
               if (element.simulation) {
                  element.simulation.forEach((index, i) => {
                     if (index.name == simulationName) {
                        if (element.simulation[i].sim) {
                           index.sim.forEach((simargI) => {
                              const DOValue = simargI.simargs.toString();
                              const resultPUBValue =
                                 simulationResult.simargs.toString();
                              if (
                                 DOValue == resultPUBValue &&
                                 simargI.ts == simulationResult.ts
                              ) {
                                 console.log("here");
                                 console.log({ DOValue, resultPUBValue });
                                 simargI.result = simulationResult.result;
                                 console.log(
                                    "MQTT push : \n",
                                    util.inspect(element, false, null, true)
                                 );
                                 var DOWholeDataListToString =
                                    JSON.stringify(element);
                                 client.publish(
                                    "dp_do_data",
                                    DOWholeDataListToString
                                 ); //send string text!
                              }
                           });
                        }
                     }
                  });
               }
            }
         });
      }
   }
}

/*
 * DO Creation
 */
app.post("/DigitalTwin/DO", function (req, res) {
   var fullBody = "";
   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      var DOWholeData;
      DOWholeData = JSON.parse(fullBody);
      DOName = DOWholeData.name;
      if (DONameList.includes(DOName)) {
         res.status(500).send("DO is already exist");
      } else {
         res.status(200).send("Received DO Data");
         DONameList.push(DOName);
         CheckKeyExistAndAddCount(DOWholeData);
         DOWholeDataList.push(DOWholeData);
         DOSIMmqttPubObjList[DOName] = [];
         console.log(
            "DO List: ",
            util.inspect(DOWholeDataList, false, null, true)
         );
      }
   });
});

function CheckKeyExistAndAddCount(DOWholeData) {
   if (Object.keys(DOWholeData).some((v) => v == "sensor")) {
      DOWholeData.sensorCount = DOWholeData.sensor.length;
      DigitalConnectorAlarm(DOWholeData);
   }
   if (Object.keys(DOWholeData).some((v) => v == "control")) {
      DOWholeData.controlCount = DOWholeData.control.length;
   }
   if (Object.keys(DOWholeData).some((v) => v == "simulation")) {
      DOWholeData.simulationCount = DOWholeData.simulation.length;
   }
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
app.get("/DigitalTwin/:DOName", (req, res) => {
   if (req.params.DOName) {
      let DOName = req.params.DOName;
      if (DONameList.includes(DOName)) {
         DOWholeDataList.forEach((index, i) => {
            if (index.name == DOName) {
               res.send(DOWholeDataList[i]);
               console.log(
                  "DOWholeDataList: ",
                  util.inspect(DOWholeDataList, false, null, true)
               );
            }
         });
      } else {
         res.status(200).send("DO does not exist");
      }
   } else {
      res.status(404).send("Bad Request");
      console.log("input value error");
   }
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
