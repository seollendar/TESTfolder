const Influx = require("influx");
const influx = new Influx.InfluxDB(
   `http://admin:password@localhost:8086/SmartPortData`
);
const util = require("util");

sql = `select * from ${device} group by container order by desc limit 1`;

function getInfluxTime(dateCount) {
   //sql = `select * from ${Device} where "container" = '${container}' order by desc limit ${dateCount}`;
   sql = `select * from ${Device} where "container" = '${container}' order by desc limit 20`;
   console.log(sql);
   influx
      .query(sql)
      .then((result) => {
         if (result[0]) {
            for (var index = 0; index < result.length; index++) {
               var savedTime = result[index].time._nanoISO;
               console.log(savedTime.split("Z")[0]);
            }
         } else {
            //if no response
            console.log("{ no response }");
         }
      })
      .catch((err) => {
         console.log("Error", err);
      });
}

/**
async function DeviceCRUL() {

   var { stdout, stderr } = await exec(command_device);
   var resData = JSON.parse(stdout);
   //console.log(resData);
   var checkArr = resData.list;
   console.log("length: ", checkArr.length);
   let CheckList = await checkArr.map((v) => {
      let contents = v.deviceID;
     // console.log(v.deviceID);
      return contents;
   });
   console.log(CheckList);
}
DeviceCRUL();

async function inquireCRUL() {
   const { stdout, stderr } = await exec(command);
   const resData = JSON.parse(stdout);
   const checkArr = resData.list;
   var dateCount = checkArr.length;
   console.log(checkArr.length);
   let CheckList = await checkArr.map((v) => {
      let contents = JSON.parse(v.content);
      console.log(contents.time);
      //var date = new Date(contents.time);
     // var milliseconds = date.getTime();
      return contents.time;
   });
   //console.log(CheckList);
   getInfluxTime(dateCount);
}
//inquireCRUL();


 */
