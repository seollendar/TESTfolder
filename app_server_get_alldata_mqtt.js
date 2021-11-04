
const express = require('express');
const app = express();
const mqtt = require('mqtt');

const port = 7579;
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))



const options = {
  host: '127.0.0.1',
  port: 1883,
  protocol: 'mqtts'
};

const client = mqtt.connect(options);

client.on("connect", () => {	
  console.log("connected"+ client.connected);
}

client.on("error", (error) => {
  console.log("Can't connect" + error);
}
process.exit(1)});


var topic, con;
const topicList = ['/oneM2M/req/+/Crane/+', '/oneM2M/req/+/controlButton_sub/+'];
app.post("*", (req, res)=>{
	
	var fullBody = '';
	req.on('data', function(chunk) {
		fullBody += chunk; 
	});

	req.on('end', function() {
		res.status(200).send('post /end test ok');
		var receivedData = JSON.parse(fullBody);
		console.log(receivedData);
		
		
		con = receivedData['m2m:sgn'].nev.rep['m2m:cin'];
		console.log("con: ", con);
		
		var path = parse.split('/');
		var ae = path[0];
		var container = path[1];

		if(container == 'distance' || container == 'heading' || container == 'angle'){
			topic = topicList[0];
		}else if(container == 'controlButton'){
			topic = topicList[1];
		}

		// client.publish("testtopic", "test message", options);
		client.publish(topic, con, (error) => { 
			console.log("pub error" + error);
		};
	
	});

})

