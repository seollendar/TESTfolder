const express = require("express");
const app = express();

const mqtt = require("mqtt");
app.listen(1005, () => {
    console.log("Server Start on port 1005");
});

var client = mqtt.connect("mqtt://127.0.0.1:1883");

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
client.subscribe("dp_sensor_data", function (err) {
    if (err) {
        console.log("dp_sensor subscribe err!", err);
    }
});


/*
 * MQTT-Message ON
 */
client.on("message", (topic, message, packet) => {

    console.log("topic: " + topic + ", message: " + message);

});
