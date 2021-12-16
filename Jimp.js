// var Jimp = require("jimp");

// // open a file called "lenna.png"
// Jimp.read("angry.png", (err, lenna) => {
//    if (err) throw err;
//    lenna
//       .resize(28, 28) // resize
//       .quality(60) // set JPEG quality
//       .greyscale() // set greyscale
//       .write("mae-small.jpg"); // save
// });

var fs = require("fs");
var jpeg = require("jpeg-js");
var jpegData = fs.readFileSync("test_image7.jpg");
var rawImageData = jpeg.decode(jpegData, { useTArray: true }); // return as Uint8Array
//console.log(rawImageData.data);
// var temp = rawImageData.data.toString().split(",");

// console.log(temp);
// var newArr = [];
// temp.map((data) => {
//    newArr.push(data / 255.0);
// });
// console.log(newArr);

// connectPython_print.js 파일
const spawn = require("child_process").spawn;

const result = spawn("python", ["clientT-ImageSend.py", jpegData]);

result.stdout.on("data", function (data) {
   console.log(data.toString());
});
result.stderr.on("data", function (data) {
   console.log(data.toString());
});
