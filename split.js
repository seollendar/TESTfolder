// const string = "t1t2";
// console.log(string.split(","));

// const arr = ["a"];
// let j = "";
// for (i in arr) {
//    j += arr[i];
//    if (i != arr.length - 1) {
//       j += ",";
//    }
// }
// console.log(j);

const service = `{  
   "name": "temperature_prediction",  
   "DO_arg" :   {    "DO1": {      "sensor1": {        "dim": [          28,          28        ]      },     
                       "sensor2": {        "dim": 	[          1        ]      }    },    
                               "DO2": {      "sensor3": {        "dim": [          1        ]      }    }  }, 
   "SIM_arg":  {    "sim1": "",    "sim2": ""  }, 
   "url": "http:192.168.172.73:1883"
 }
 `;
/*
const service1 = `{
  "name": "temperature_prediction",
  "DO_arg": {
    "DO1": ""
  },
  "SIM_arg": {
    "sim1": ""
  },
  "service url": "host:port"
}`;
const jsonService = JSON.parse(service);
const DOs = Object.keys(jsonService.DO_arg); //[ 'DO1', 'DO2' ]
const SIMs = Object.keys(jsonService.SIM_arg); //[ 'sim1', 'sim2']
let DO_DOs = DOs.map((d) => "DO_" + d);
let SIM_SIMs = SIMs.map((s) => "SIM_" + s);
let DO_SIM_arr = DO_DOs.concat(SIM_SIMs);
console.log(DO_SIM_arr);

// let j = "";
// for (i in DO_SIM_arr) {
//    j += DO_SIM_arr[i];
//    if (i != DO_SIM_arr.length - 1) {
//       j += ",";
//    }
// }
// console.log(j);

let SQL = "";
for (i in DO_DOs) {
   SQL += `INSERT INTO /mqtt/data SELECT * FROM ${DO_DOs[i]};`;
}

for (i in SIM_SIMs) {
   SQL += `INSERT INTO /mqtt/simulation SELECT * FROM ${SIM_SIMs[i]};`;
}

console.log(SQL);
*/
//CreateServiceSinkConnector(JSON.parse(service));
async function CreateServiceSinkConnector(resObject) {
   let sinkConnectorBody;
   const { name, url, DO_arg, SIM_arg } = { ...resObject };
   console.log("resObject", resObject, "\n", url);
   let splitURLsink = url.split(":");
   switch (splitURLsink[0]) {
      case "http":
         sinkConnectorBody = await ServiceHttpSinkConnector(resObject);
         console.log("http sink");
         break;
      case "mqtt":
         sinkConnectorBody = await ServiceMQTTSinkConnector(
            resObject,
            splitURLsink
         );
         console.log("mqtt sink");
         break;
      default:
         console.log(`out of ${splitURLsink[0]}`);
   }

   console.log("sinkConnectorBody\n", sinkConnectorBody);
   /**
    * Send Request to Kafka Connect Server
    
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
   */
}

function ServiceHttpSinkConnector(resObject) {
   const DOs = Object.keys(resObject.DO_arg); //[ 'DO1', 'DO2' ]
   const SIMs = Object.keys(resObject.SIM_arg);
   let DO_DOs = DOs.map((d) => "DO_" + d);
   let SIM_SIMs = SIMs.map((s) => "SIM_" + s);
   let DO_SIM_arr = DO_DOs.concat(SIM_SIMs);
   console.log(DO_SIM_arr);

   let topics = "";
   for (i in DO_SIM_arr) {
      topics += DO_SIM_arr[i];
      if (i != DO_SIM_arr.length - 1) {
         topics += ",";
      }
   }
   console.log(topics);

   let sinkConnectorBody = {
      name: resObject.name,
      config: {
         "connector.class": "uk.co.threefi.connect.http.HttpSinkConnector",
         "tasks.max": "1",
         "request.method": "",
         headers: "Content-Type:application/json|Accept:application/json",
         "key.converter": "org.apache.kafka.connect.storage.StringConverter",
         "value.converter": "org.apache.kafka.connect.storage.StringConverter",
         "response.topic": "",
         "http.api.url": resObject.url,
         "request.method": "POST",
         topics: topics,
         "response.topic": `Service_${resObject.name}`,
      },
   };

   return sinkConnectorBody;
}

function ServiceMQTTSinkConnector(resObject, splitURLsink) {
   const DOs = Object.keys(resObject.DO_arg); //[ 'DO1', 'DO2' ]
   const SIMs = Object.keys(resObject.SIM_arg);
   let DO_DOs = DOs.map((d) => "DO_" + d);
   let SIM_SIMs = SIMs.map((s) => "SIM_" + s);
   let DO_SIM_arr = DO_DOs.concat(SIM_SIMs);
   console.log(DO_SIM_arr);

   let topics = "";
   for (i in DO_SIM_arr) {
      topics += DO_SIM_arr[i];
      if (i != DO_SIM_arr.length - 1) {
         topics += ",";
      }
   }
   console.log(topics);

   let SQL = "";
   for (i in DO_DOs) {
      SQL += `INSERT INTO /mqtt/data SELECT * FROM ${DO_DOs[i]};`;
   }

   for (i in SIM_SIMs) {
      SQL += `INSERT INTO /mqtt/simulation SELECT * FROM ${SIM_SIMs[i]};`;
   }

   let sinkConnectorBody = {
      name: resObject.name,
      config: {
         "connector.class":
            "com.datamountaineer.streamreactor.connect.mqtt.sink.MqttSinkConnector",
         "tasks.max": "1",
         topics: topics,
         "connect.mqtt.hosts": `tcp:${splitURLsink[1]}:${splitURLsink[2]}`,
         "connect.mqtt.clean": "true",
         "connect.mqtt.timeout": "1000",
         "connect.mqtt.keep.alive": "1000",
         "connect.mqtt.service.quality": "1",
         "key.converter": "org.apache.kafka.connect.json.JsonConverter",
         "key.converter.schemas.enable": "false",
         "value.converter": "org.apache.kafka.connect.json.JsonConverter",
         "value.converter.schemas.enable": "false",
         "connect.mqtt.kcql": SQL,
      },
   };

   //console.log("sinkConnectorBody\n", sinkConnectorBody);
   return sinkConnectorBody;
}

const simulation = `{  
  "name": "temperature_prediction",  
  "arg" :   {    "DO1": {      "sensor1": {        "dim": [          28,          28        ]      },     
                      "sensor2": {        "dim": 	[          1        ]      }    },    
                              "DO2": {      "sensor3": {        "dim": [          1        ]      }    }  }, 
  "url": "mqtt:192.168.172.73:1883"
}
`;
CreateSimulationSinkConnector(JSON.parse(simulation));
async function CreateSimulationSinkConnector(resObject) {
   let sinkConnectorBody;
   const { name, url, arg } = { ...resObject };
   console.log("resObject", resObject);
   let splitURLsink = url.split(":");
   switch (splitURLsink[0]) {
      case "http":
         sinkConnectorBody = await SimulationHttpSinkConnector(resObject);
         console.log("http sink");
         break;
      case "mqtt":
         sinkConnectorBody = await SimulationMQTTSinkConnector(
            resObject,
            splitURLsink
         );
         console.log("mqtt sink");
         break;
      default:
         console.log(`out of ${splitURLsink[0]}`);
   }

   console.log("sinkConnectorBody\n", sinkConnectorBody);
   /**
   * Send Request to Kafka Connect Server
   
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
  */
}

function SimulationHttpSinkConnector(resObject) {
   const DOs = Object.keys(resObject.arg); //[ 'DO1', 'DO2' ]
   let DO_DOs = DOs.map((d) => "DO_" + d);

   let topics = "";
   for (i in DO_DOs) {
      topics += DO_DOs[i];
      if (i != DO_DOs.length - 1) {
         topics += ",";
      }
   }
   console.log(topics);

   let sinkConnectorBody = {
      name: resObject.name,
      config: {
         "connector.class": "uk.co.threefi.connect.http.HttpSinkConnector",
         "tasks.max": "1",
         "request.method": "",
         headers: "Content-Type:application/json|Accept:application/json",
         "key.converter": "org.apache.kafka.connect.storage.StringConverter",
         "value.converter": "org.apache.kafka.connect.storage.StringConverter",
         "response.topic": "",
         "http.api.url": resObject.url,
         "request.method": "POST",
         topics: topics,
         "response.topic": `RES_SIM_${resObject.name}`,
      },
   };

   return sinkConnectorBody;
}

function SimulationMQTTSinkConnector(resObject, splitURLsink) {
   const DOs = Object.keys(resObject.arg); //[ 'DO1', 'DO2' ]
   let DO_DOs = DOs.map((d) => "DO_" + d);

   let topics = "";
   for (i in DO_DOs) {
      topics += DO_DOs[i];
      if (i != DO_DOs.length - 1) {
         topics += ",";
      }
   }
   console.log(topics);
   let SQL = "";
   for (i in DO_DOs) {
      SQL += `INSERT INTO /mqtt/data SELECT * FROM ${DO_DOs[i]};`;
   }
   let sinkConnectorBody = {
      name: resObject.name,
      config: {
         "connector.class":
            "com.datamountaineer.streamreactor.connect.mqtt.sink.MqttSinkConnector",
         "tasks.max": "1",
         topics: topics,
         "connect.mqtt.hosts": `tcp:${splitURLsink[1]}:${splitURLsink[2]}`,
         "connect.mqtt.clean": "true",
         "connect.mqtt.timeout": "1000",
         "connect.mqtt.keep.alive": "1000",
         "connect.mqtt.service.quality": "1",
         "key.converter": "org.apache.kafka.connect.json.JsonConverter",
         "key.converter.schemas.enable": "false",
         "value.converter": "org.apache.kafka.connect.json.JsonConverter",
         "value.converter.schemas.enable": "false",
         "connect.mqtt.kcql": SQL,
      },
   };

   return sinkConnectorBody;
}
