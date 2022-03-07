const mqtt = require("mqtt");
var client = mqtt.connect("mqtt://203.254.173.175:1883");

client.on("connect", function () {
   console.log("connected!", client.connected);
});
client.on("error", (error) => {
   console.log("Can't connect" + error);
   process.exit(1);
});

/*
 * MQTT-subscribe
 */
client.subscribe("mqt", function (err) {
   if (!err) {
      console.log("sub connected!");
   }
});
/*
 * MQTT-Message ON
 */
client.on("message", (topic, message, packet) => {
   console.log("topic: " + topic + ", message: " + message);
});
