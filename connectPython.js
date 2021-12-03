// connectPython_print.js 파일
const spawn = require("child_process").spawn;

const result = spawn("python", ["clientT-ImageSend.py", "test_image7.jpg"]);
result.stdout.on("data", function (data) {
   console.log("to string result: ", data.toString());
});
result.stderr.on("data", function (data) {
   console.log(data.toString());
});
