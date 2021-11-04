const Config = require('./HostAddressConfig.json');
const express = require('express');
const app = express();
const util = require("util");
var cluster = require("cluster");
var numCPUs = require("os").cpus().length;
const kafka = require('kafka-node');

if (cluster.isMaster) {
        // console.log("number of cpu = " + numCPUs + "\n");

        for (var i = 0; i < numCPUs / 2; i++) {
           cluster.fork();
        }

        cluster.on("exit", function (worker, code, signal) {
           console.log("worker " + worker.process.pid + " died");
        });

 } else {

        /*
        * config setting
        */
        const topic = 'SmartPortData';
        const partitionSet = 5;
        const kafkaHostAddress = Config.kafkaHostAddress;

        const port = 7980;
        app.listen(port, () => console.log(`server listening at port:${port}`));

       
        // ================================================================

        app.post('/noti_for_fastdata', function(req, res){

                var fullBody='', jsonbody, resources, ae, partitionNum, payloads;
                req.on('data', function(chunk) {
                        fullBody += chunk;
                });

                req.on('end', function(){

                        try {
                                jsonbody = JSON.parse(fullBody);    
                                //console.log(util.inspect(fullBody, false, null, true));
                        } catch (e) {
                                console.error(e);
                                res.status(200).send('Error : Not valid Json format');
                                return;
                        }
						


                        if(jsonbody['m2m:sgn'] && jsonbody['m2m:sgn'].sur && jsonbody['m2m:sgn'].nev && jsonbody['m2m:sgn'].nev.rep && jsonbody['m2m:sgn'].nev.rep['m2m:cin']){
                                resources = jsonbody['m2m:sgn'].sur.split('/');                                
				if(!resources[4]){
                                        res.status(200).send('Error : resources does not exist');                                    
                                        return;    
                                }
                        //      console.log("resources: ", resources);

                                ae = resources[4];
                                partitionNum = ae.hashCode()%partitionSet;  
                                payloads = [{ topic: topic, messages: fullBody, partition: partitionNum }];

                                const Producer = kafka.Producer,
                                client = new kafka.KafkaClient({ kafkaHost: kafkaHostAddress }),
                                producer = new Producer(client);
                 
                                producer.on('ready', function () {
                                        console.log('Producer is on ready');
                                        producer.send(payloads, function (err, data) {
                                                if (err) console.log(err); 
                                                //else console.log(data);
                                        });
                                });

                                res.status(200).send('Received Data');

                                producer.on('error', function (err) {
                                        console.log('error', err);
                                });

                        }else{
                                console.log('sur does not exist. check DataBody: ', jsonbody);
                                res.status(200).send('Received Data (sur does not exist)');
                        }
                });

        });


        String.prototype.hashCode = function() {
                var hash = 0, i = 0, len = this.length;
                while ( i < len ) {
                        hash  = ((hash << 5) - hash + this.charCodeAt(i++)) << 0;
                }
                return (hash + 2147483647) + 1;
        };

}