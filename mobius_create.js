var axios = require("axios");

function postAE() {
   var data_ae =
      '{\n\t"m2m:ae" : {\n\t\t"rn": "SSUL",\n\t    "api": "0.2.481.2.0001.001.000111",\n\t    "lbl": ["key1", "key2"],\n\t    "rr": true\n    }\n}';

   var config_ae = {
      method: "post",
      url: "localhost:7579/Mobius",
      headers: {
         Accept: "application/json",
         "X-M2M-RI": "123aaghjhk45",
         "X-M2M-Origin": "S",
         "Content-Type": "application/json;ty=2",
      },
      data: data_ae,
   };

   axios(config_ae)
      .then(function (response) {
         console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
         console.log(error);
      });
}

function postCONTAINER() {
   var data_container =
      '{\n  "m2m:cnt" : {\n    "rn": "young",\n      "lbl": ["API"]\n    }\n}\n';

   var config_container = {
      method: "post",
      url: "localhost:7579/Mobius/SSUL",
      headers: {
         Accept: "application/json",
         "X-M2M-RI": "12aadftret345",
         "X-M2M-Origin": "S20170717074825768bp2l",
         "Content-Type": "application/json; ty=3",
      },
      data: data_container,
   };

   axios(config_container)
      .then(function (response) {
         console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
         console.log(error);
      });
}

function postCIN() {
   var data_cin = '{\n  "m2m:cin": {\n    "con": "zero"\n  }\n}';

   var config_cin = {
      method: "post",
      url: "localhost:7579/Mobius/SSUL/young",
      headers: {
         Accept: "application/json",
         "X-M2M-RI": "123sdfgd45",
         "X-M2M-Origin": "S20170717074825768bp2l",
         "Content-Type": "application/json; ty=4",
      },
      data: data_cin,
   };

   axios(config_cin)
      .then(function (response) {
         console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
         console.log(error);
      });
}

function postSUB() {
   var data =
      '\n{\n\t"m2m:sub" : {\n\t\t"rn": "sub_name",\n\t\t"enc":{\n\t\t   "net":[3]\n\t\t},\n\t    "nu": [\n\t\t\t"http://203.254.173.175:7890/noti"\n\t\t]\n    }\n}\n\n\n';

   var config = {
      method: "post",
      url: "localhost:7579/Mobius/ae/location",
      headers: {
         Accept: "application/json",
         "X-M2M-RI": "123dfsaf45",
         "X-M2M-Origin": "S20170717074825768bp2l",
         "Content-Type": "application/json;ty=23",
      },
      data: data,
   };

   axios(config)
      .then(function (response) {
         console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
         console.log(error);
      });
}
