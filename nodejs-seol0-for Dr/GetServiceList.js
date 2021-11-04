var axios = require('axios');

var GetServiceListConfig = {
  method: 'get',
  url: 'http://119.65.194.28:8000/bpt/api/service/list'
};


/* Get serviceId */
axios(GetServiceListConfig)
.then(function (serviceResponse) {
    console.log(">> Get Service List");

    for(var index in serviceResponse.data['data']){
        var serviceID = serviceResponse.data['data'][index].serviceId

        var GetMatchListConfig = {
            method: 'get',
            url: `http://119.65.194.28:8000/bpt/api/service/${serviceID}/list`
        };

        /* Get deviceId(AE) sensorId(container) */
        axios(GetMatchListConfig)
        .then(function (MatchResponse) {

            for(var dataIndex in MatchResponse.data['data']){     
                for(var deviceIndex in MatchResponse.data['data'][dataIndex].deviceList){
                    var deviceId = MatchResponse.data['data'][dataIndex].deviceList[deviceIndex].deviceId;                
                    var deviceSensors = MatchResponse.data['data'][dataIndex].deviceList[deviceIndex].sensors;
                    
                    for(sensorIndex in deviceSensors){
                        var sensorId = deviceSensors[sensorIndex].sensorId;
                        subscribe(deviceId, sensorId);
                    }
                }
            }

        })
        .catch(function (error) {
            console.log(error);
        });
        
    }

})
.catch(function (error) {
  console.log(error);
});


function subscribe(deviceId, sensorId){

    var data = '\n{\n\t"m2m:sub" : {\n\t\t"rn": "sub_name",\n\t\t"enc":{\n\t\t   "net":[3]\n\t\t},\n\t    "nu": [\n\t\t\t"http://203.254.173.175:7890/noti"\n\t\t]\n    }\n}\n\n\n';

    var config = {
    method: 'post',
    url: `http://203.254.173.175:7579/Mobius/${deviceId}/${sensorId}`,
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
        // console.log(error);
        console.log(`already exists: ${deviceId}-${sensorId}`);
    });
}