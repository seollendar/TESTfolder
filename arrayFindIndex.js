const hashDeviceList = ["😂", "❤️", "😍"];
const offsetDeviceList = { d1: 0, d2: 1 };

//console.log(array); // Array(3) [ "😂", "❤️", "😍" ]
const ae = "❤️"; //"d2";
//console.log("offsetDeviceList[ae]", offsetDeviceList[ae]);
// const index = array.indexOf(ae);
// if (index > -1) {
//    console.log(index);
// } else {
//    console.log("not");
// }
// // { array.splice(index, 1) }
// //console.log(array) // Array(2) [ "😂", "😍" ]
// array.push("💖");
// console.log(array);

if (hashDeviceList.indexOf(ae) > -1) {
   console.log("hashDeviceList.indexOf(ae) ", hashDeviceList.indexOf(ae));
} else if (offsetDeviceList[ae]) {
   console.log("offsetDeviceList[ae]", offsetDeviceList[ae]);
   // }
   // } else if (offsetDeviceList[ae]) {
   //    console.log("offsetDeviceList[ae]", offsetDeviceList[ae]);
} else {
   console.log("nini");
}

// if (hashDeviceList.indexOf(ae) > -1 || offsetDeviceList[ae]) {
//    //console.log("offsetDeviceList[ae]", offsetDeviceList[ae]);
//    if (hashDeviceList.indexOf(ae) > -1) {
//       console.log("hashDeviceList.indexOf(ae) ", hashDeviceList.indexOf(ae));
//    } else {
//       console.log("offsetDeviceList[ae]", offsetDeviceList[ae]);
//    }
// } else {
//    console.log("nini");
// }

if (DeviceCount % 10 != 0) {
   hashDeviceList.push(ae);
   partitionNum = getHashCode(ae, partitionSet);

   payloads = [
      {
         topic: topic,
         messages: JSON.stringify(jsonbody),
         partition: partitionNum,
      },
   ];

   producer.send(payloads, function (err, data) {
      if (err) console.log(err);
      //else console.log(data);
   });
} else {
   var config = {
      method: "post",
      url: `http://localhost:7989/offset/${ae}`,
      headers: {
         Accept: "application/json",
         "Content-Type": "application/json;ty=4",
         "X-M2M-RI": "1234",
      },
   };

   axios(config)
      .then(function (response) {
         let responsePN = response.data;
         offsetDeviceList[ae] = responsePN;
         console.log("offsetDeviceList: ", offsetDeviceList);
         payloads = [
            {
               topic: topic,
               messages: JSON.stringify(jsonbody),
               partition: responsePN,
            },
         ];

         producer.send(payloads, function (err, data) {
            if (err) console.log(err);
            //else console.log(data);
         });
      })
      .catch(function (error) {
         console.log(error);
      });
}
