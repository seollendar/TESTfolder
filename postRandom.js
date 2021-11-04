const axios = require('axios');
const moment = require('moment');

const header = {
  'Content-Type': 'application/json',
};

const port = 5005;
const baseURL = `http://localhost:${port}/`;

const HttpClient = axios.create({
  baseURL,
  headers: header,
});


console.log("now :", moment().valueOf());

function postRandomData() {

	for(var i=0; i<100; i++){

	   let params = {
                    "m2m:sgn": {
                     "nev": {
                       "rep": {
                        "m2m:cin": {
                          "ty": 4,
                          "ri": "cin00S02f9ecfd6-35ef-451e-8672-09ab3ec09a141603350091457",
                          "rn": "cin-S02f9ecfd6-35ef-451e-8672-09ab3ec09a141603350091457",
                          "pi": "cnt00000000000001951",
                          "ct": "20201022T160131",
                          "lt": "20201022T160131",
                          "et": "20201121T160131",
                          "st": 903335,
                          "cr": "SS01228427453",
                          "cnf": "application/json",
                          "cs": 155,
                          "con": {
                           "latitude": 37.411360 + (i*0.0001),
						   "longitude": 127.129459 + (i*0.0001),
						   // "latitude": 37.411360,
                           // "longitude": 127.129459,
                           "altitude": 12.934,
                           "velocity": 0,
                           "direction": 0,
                           "time": moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                           "position_fix": 1,
                           "satelites": 0,
                           "state": "ON"
                          }
                        }
                       },
                       "om": {
                        "op": 1,
                        "org": "SS01228427453"
                       }
                     },
                     "vrq": false,
                     "sud": false,
                     "sur": `/~/CB00061/smartharbor/es${i}/scnt-location/sub-S01228427453_user`,
                     "cr": "SS01228427453"
                    }
                  };
	   HttpClient.post(`noti_for_fastdata`, params).then(function (response) {
		//console.log(response.status)		 
	   })
	}

}
   
postRandomData();
