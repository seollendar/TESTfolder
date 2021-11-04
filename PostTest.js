const axios = require('axios');
const moment = require('moment');
const header = {
  'Content-Type': 'application/json',
};

const baseURL = `http://localhost:3005/`;

const HttpClient = axios.create({
  baseURL,
  headers: header,
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var st, pt, data_count=0;
function demo() {

  // Sleep in loop
	for(var i=0; i<100; i++){
		let params = {
		 "m2m:sgn": {
		  "nev": {
			"rep": {
			 "m2m:cin": {
			   "cnf": "application/json",
			   "con": {
				"ae": `yb${Math.round(Math.random())}`,
				"container": "location",
				"wtime": 1596473600000 + (i*1000),
				"lat": 37.459644+(i*0.00001),
				"lng": 127.561136
			   }
			 }
			}
		  }
		 }
		}
		HttpClient.post(`profile`, params).then(async function (response) {
			
			if(st == null)
			{
				st = moment(new Date());
				data_count++;
			}
			else
			{
				pt = moment(new Date());
				et = pt - st; 
				data_count++;
				console.log("===================================================",st, pt, et, data_count);
			}	
			await sleep(5000);
		});
	}
   
   // for(var i=0; i<15; i++){
   // let params = {
     // "m2m:sgn": {
      // "nev": {
        // "rep": {
         // "m2m:cin": {
           // "cnf": "application/json",
           // "con": {
            // "ae": "yt2",
            // "container": "location",
            // "wtime": 1596473600000 + (i*1000),
            // "lat": 37.459644+(i*0.00001),
            // "lng": 127.561136
           // }
         // }
        // }
      // }
     // }
   // }
   // HttpClient.post(`PRE`, params);
   // await sleep(1500);
   // }

}

demo();


// var st, pt, data_count=0;
// function nonSleepdemo() {

//   for(var i=0; i<100; i++){

//    let params = {
//      "m2m:sgn": {
//       "nev": {
//         "rep": {
//          "m2m:cin": {
//            "cnf": "application/json",
//            "con": {
//             //"ae": `yt${Math.round(Math.random())}`,
//             //"ae": `yt${i}`,
// 			      "ae": `ytk06`,
//             "container": "location",
//             "wtime": 1706474700000 + (i*1000),
//             "lat": 37.459644+(i*0.0002),
//             "lng": 127.561136
//            }
//          }
//         }
//       }
//      }
//    }
//    HttpClient.post(`profile`, params).then(function (response) {
     
//      if(st == null)
//      {
//        st = moment(new Date());
//        data_count++;
//      }
//      else
//      {
//        pt = moment(new Date());
//        et = pt - st; 
//        data_count++;
//        console.log("===================================================",st, pt, et, data_count);
//      }
//      if(data_count>4999){
//       console.log(st, pt, et, data_count);
//       //console.log(response.status)
//     }
//    })
//   }
// }
   
// nonSleepdemo();