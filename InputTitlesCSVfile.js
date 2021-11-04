const fs = require("fs");

// function jsonToCSV(titles) {
//    let csv_string = "";

//    titles.forEach((title, index) => {
//       csv_string += index !== titles.length - 1 ? `${title},` : `${title}\r\n`;
//    });

//    return csv_string;
// }

// const titles = [
//    "Date",
//    "receiver",
//    "kafka",
//    "classifier",
//    "preprocessor",
//    "influx",
//    "postGIS",
//    "APIserver",
//    "Error",
// ];
// const csv_string = jsonToCSV(titles);
// console.log(csv_string);

// fs.writeFileSync("makeTitleFile.csv", csv_string);

fs.exists("./makeTitleFile.csv", (e) => {
   console.log("e", e);
   console.log(e ? "it exists" : "no passwd!");
});
