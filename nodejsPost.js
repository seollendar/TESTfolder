const axios = require('axios');

const header = {
  'Content-Type': 'application/json',
};

const baseURL = `http://localhost:3000/`;

const HttpClient = axios.create({
  baseURL,
  headers: header,
});
/*
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {

  // Sleep in loop
  for(var i=0; i<15; i++){
   let params = {
     "m2m:sgn": {
      "nev": {
        "rep": {
         "m2m:cin": {
           "cnf": "application/json",
           "con": {
            "ae": "yt2",
            "container": "location",
            "wtime": 1596473600000 + (i*1000),
            "lat": 37.459644+ (i*0.0001),
            "lng": 127.561136
           }
         }
        }
      }
     }
   }
   HttpClient.post(`PRE`, params);
   await sleep(1000);
   }
   /*
   for(var i=0; i<15; i++){
   let params = {
     "m2m:sgn": {
      "nev": {
        "rep": {
         "m2m:cin": {
           "cnf": "application/json",
           "con": {
            "ae": "yt2",
            "container": "location",
            "wtime": 1596473600000 + (i*1000),
            "lat": 37.459644+(i*0.0001),
            "lng": 127.561136
           }
         }
        }
      }
     }
   }
   HttpClient.post(`PRE`, params);
   await sleep(1500);
   }

}

demo();



//`yt${i}`


for(var i=0; i<100; i++){
	
   let params = {
     "m2m:sgn": {
      "nev": {
        "rep": {
         "m2m:cin": {
           "cnf": "application/json",
           "con": {
            "ae": `yt${i}`,
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

   HttpClient.post(`PRE`, params);
}

*/
console.time('post');

for(var i=0; i<2500; i++){
   let params = {
     "m2m:sgn": {
      "nev": {
        "rep": {
         "m2m:cin": {
           "cnf": "application/json",
           "con": {
            "ae": "yt2",
            "container": "location",
            "wtime": 1596473600000 + (i*4000),
            "lat": 37.459644+i,
            "lng": 127.561136
           }
         }
        }
      }
     }
   }

   HttpClient.post(`PRE`, params);
}

for(var i=0; i<2500; i++){
   let params = {
     "m2m:sgn": {
      "nev": {
        "rep": {
         "m2m:cin": {
           "cnf": "application/json",
           "con": {
            "ae": "yt3",
            "container": "location",
            "wtime": 1596473600000 + (i*4000),
            "lat": 37.459644+(i*0.00001),
            "lng": 127.561136
           }
         }
        }
      }
     }
   }

   HttpClient.post(`PRE`, params);
}

console.timeEnd('post');

