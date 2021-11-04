var axios = require('axios');
var data = '\n{\n\t"m2m:sub" : {\n\t\t"rn": "sub_name",\n\t\t"enc":{\n\t\t   "net":[3]\n\t\t},\n\t    "nu": [\n\t\t\t"http://203.254.173.175:7890/"\n\t\t]\n    }\n}\n\n\n';

var config = {
  method: 'post',
  url: 'localhost:7579/Mobius/transporter/location',
  headers: { 
    'Accept': 'application/json', 
    'X-M2M-RI': '123dfsaf45', 
    'X-M2M-Origin': 'S20170717074825768bp2l', 
    'Content-Type': 'application/json;ty=23'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
