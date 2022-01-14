const Config = require("./HostAddressConfig.json");
const express = require("express");
const app = express();
const util = require("util");
var cluster = require("cluster");
var numCPUs = require("os").cpus().length;
const kafka = require("kafka-node");
/*
 * config setting
 */
const topic = "SmartPortData";
const partitionSet = 5;
const kafkaHostAddress = Config.kafkaHostAddress;

const port = 7980;
app.listen(port, () => console.log(`server listening at port:${port}`));

const Producer = kafka.Producer,
  client = new kafka.KafkaClient({ kafkaHost: kafkaHostAddress }),
  producer = new Producer(client);

producer.on("ready", function () {
  console.log("Producer is on ready");
});
producer.on("error", function (err) {
  console.log("error", err);
});
// ================================================================

app.post("/noti_for_fastdata", function (req, res) {
        var fullBody='', jsonbody, resources, ae, partitionNum, payloads;
        req.on('data', function(chunk) {
                fullBody += chunk;
        });
        req.on('end', async function(){
                jsonbody = JSON.parse(fullBody);
                //console.log(util.inspect(jsonbody, false, null, true));
                if (jsonbody['m2m:sgn'] && jsonbody['m2m:sgn'].sur && jsonbody['m2m:sgn'].nev && jsonbody['m2m:sgn'].nev.rep && jsonbody['m2m:sgn'].nev.rep['m2m:cin']) {
                        resources = jsonbody["m2m:sgn"].sur.split("/");
                        //console.log(resources);
                        if (!resources[4]) {
                                res.status(404).send("Error : resources does not exist");
                                return;
                        }

                        ae = resources[4];
                        container = resources[5];

                        if(ae == 'S01228451616' && resources[5] == 'location_power'){console.log(util.inspect(jsonbody, {showHidden: false, depth: null}))}
                        if(ae == 'S01228451410' && container == 'taco'){ console.log(util.inspect(jsonbody, false, null, true)) }

                        partitionNum = ae.hashCode() % partitionSet;
                        payloads = [
                                {
                                        topic: topic,
                                        messages: JSON.stringify(jsonbody),
                                        partition: partitionNum,
                                },
                        ];

                        await producer.send(payloads, function (err, data) {
                                if (err) console.error("err: ", err);
                                //else console.log(data);
                        });

                        res.status(200).send("Received Data");
                } else {
                        console.log("sur does not exist. check DataBody: ", util.inspect(jsonbody, false, null, true));
                        res.status(400).send("Received Data (sur does not exist)");
                }

                res.end();
                return;
        });
});

String.prototype.hashCode = function () {
  var hash = 0,
    i = 0,
    len = this.length;
  while (i < len) {
    hash = ((hash << 5) - hash + this.charCodeAt(i++)) << 0;
  }
  return hash + 2147483647 + 1;
};

