const express = require("express");
//const cors = require("cors")
const app = express();
var axios = require("axios");
const fs = require("fs");
const spawn = require("child_process").spawn;
const util = require("util");
const exec = util.promisify(require("child_process").exec);
//var options={
//  timeout:500000
//};
const AdmZip = require("adm-zip");
const multer = require("multer");

const kafka = require("kafka-node");
var HighLevelProducer = kafka.HighLevelProducer,
   client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" }),
   producer = new HighLevelProducer(client, {
      partitionerType: 3,
   });
producer.on("ready", function () {
   console.log("Producer is on ready");
});

producer.on("error", function (err) {
   console.log("error", err);
});

//파일을 저장할 디렉토리 설정 (현재 위치에 uploads라는 폴더가 생성되고 하위에 파일이 생성된다.)
const upload = multer({
   dest: __dirname + "/uploads/", // 이미지 업로드 경로
});

const fileUpload = multer({
   dest: __dirname + "/fileUploads/", // 이미지 업로드 경로
});

//app.use(cors())// Test를 하기 위해서 세팅 "실제 서버에 배포할 때는 아이피를 설정 해야된다."

app.listen(1209, () => console.log("Waiter Start 1209"));
// const mqtt = require("mqtt");
// const client = mqtt.connect("mqtt://localhost:1883");
// // var options = { retain:true, qos:1 }; //client.publish(topic, dataToString, options);
// client.on("connect", function () {
//    console.log("connected!", client.connected);
// });
// client.on("error", (error) => {
//    console.log("Can't connect" + error);
//    process.exit(1);
// });
// /*
//  * MQTT-subscribe
//  */
// client.subscribe("data", function (err) {
//    if (err) {
//       console.log("subscribe err!", err);
//    }
// });

// client.on("message", (topic, message, packet) => {
//    //console.log("topic: " + topic + ", message: " + message);
// });

function unzip(fileName, model, destination) {
   // const fileName = "./file.zip";
   console.log(fileName);
   const zip = new AdmZip(fileName); // file위치로 AdmZip 오브젝트를 생성합니다.
   const target = `./uploads/${model}/1`; // 압축이 해제될 위치를 지정합니다.
   zip.extractAllTo(target, /* 압축결과가 기존 파일을 overwrite 할지 */ true);

   makeDockerServingContainer(model, destination); ////test gogo
}

var dockerPort = 8501;
var ALLdockerPort = [8501];
var dockerModelPort = { mnist: 8501 }; //{ cam: 8501 }
function makeDockerServingContainer(model, destination) {
   dockerPort++;
   dockerModelPort[model] = dockerPort;
   console.log("ALLdockerPort: ", dockerModelPort);
   var cmd = `docker run -t -d -p ${dockerModelPort[model]}:8501 --name ${model} -v "${destination}${model}:/models/${model}" -e MODEL_NAME=${model} tensorflow/serving`;
   console.log("cmd: ", cmd);
   // exec(cmd, function (err, stdout) {
   //    if (err) {
   //       console.log("err: ", err);
   //       return;
   //    }
   //    console.log("stdout:", stdout);
   // });
}

function DockerFileServing(file, model, modelPort) {
   const result = spawn("python", [
      "clientT-ImageSend.py",
      file,
      model,
      modelPort,
   ]);
   result.stdout.on("data", function (data) {
      console.log("predict result: ", data.toString());
      client.publish("predict", data.toString()); //send string text!
   });
   result.stderr.on("data", function (data) {
      console.log(data.toString());
   });
}

/** exec docker Image => container **/
app.post("/model/:model", upload.single("file"), (req, res, next) => {
   const {
      fieldname,
      originalname,
      encoding,
      mimetype,
      destination,
      filename,
      path,
      size,
   } = req.file;
   const { name } = req.body;
   const { model } = req.params;

   console.log("body 데이터 : ", name);
   console.log("폼에 정의된 필드명 : ", fieldname);
   console.log("사용자가 업로드한 파일 명 : ", originalname);
   console.log("파일의 엔코딩 타입 : ", encoding);
   console.log("파일의 Mime 타입 : ", mimetype);
   console.log("파일이 저장된 폴더 : ", destination);
   console.log("destinatin에 저장된 파일 명 : ", filename);
   console.log("업로드된 파일의 전체 경로 ", path);
   console.log("파일의 바이트(byte 사이즈)", size);

   unzip(path, model, destination);

   res.json({ ok: true, data: "Upload Ok" });
});

/** POST kafka sync connector { key: 'value' } => waiter **/
app.post("/sensor", (req, res) => {
   var fullBody = "";

   req.on("data", function (chunk) {
      fullBody += chunk;
   });

   req.on("end", function () {
      var DataObj;

      console.log("fullBody : ", fullBody);
      DataObj = JSON.parse(fullBody);
      console.log("body : ", DataObj); // { key: 'value' }
      let key = Object.keys(DataObj);
      let sensor = key[0];
      let value = DataObj[key[0]];
      //send to docker serving
      var config = {
         method: "post",
         url: `http://localhost:8501/v1/models/mnist:predict`, //http://localhost:${dockerModelPort[model]}/v1/models/${model}:predict
         headers: {
            "Content-Type": "application/json",
         },
         data: value,
      };

      axios(config)
         .then(function (response) {
            console.log("!res: ", response.data.predictions[0]);
            console.log(getMax(response.data.predictions[0]));
         })
         .catch(function (error) {
            console.log(error);
         });
   });

   res.end();
});

function getMax(array) {
   var max = 0,
      index = 0;
   for (i in array) {
      if (max < array[i]) {
         max = array[i];
         index = i;
      }
   }
   return index;
}

arr = [
   8.40697538e-8, 0.932281375, 0.0553990379, 0.0121967886, 4.38627079e-10,
   0.000101739497, 5.39557595e-6, 2.25931922e-6, 1.27714065e-5, 6.35023127e-7,
];
console.log("getMax: ", getMax(arr));

//Error Handler
app.use((err, req, res, next) => {
   res.json({ ok: false, data: err.message });
});

function sendToKAFKA(body) {
   let payload = [
      {
         topic: topic,
         key: ae,
         value: body,
      },
   ];
   producer.send(payload, function (err, data) {
      if (err) console.log(err);
      //else console.log(data);
   });
}
