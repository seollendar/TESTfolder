var amqp = require("amqplib/callback_api");

//amqp://admin:admin@localhost admin:admin = rabbitmq 계정:암호
amqp.connect("amqp://localhost", function (error0, connection) {
   if (error0) {
      console.log("err0: ", error0);
      throw error0;
   }

   connection.createChannel(function (error1, channel) {
      if (error1) {
         console.log("err1: ", error1);
         throw error1;
      }

      //queue name
      var queue = "test";

      /*
       * queue가 없으면 만들어줌
       * durable : true -> queue 데이터를  rabbitmq가 재시작해도 가지고 있음(소비하기전까지)
       */
      channel.assertQueue(queue, {
         durable: true,
      });
      setInterval(sendToQueue, 1000, channel, queue);
   });

   // setTimeout(function() {
   //     connection.close();
   //     process.exit(0);
   // }, 50000);
});

function sendToQueue(channel, queue) {
   // var msg = {testVal1:1111, testVal2:2222, testVal3:3333}
   // channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
   var msg = "Hello World! transDate:" + new Date();
   channel.sendToQueue(queue, Buffer.from(msg));
   console.log(" [x] Sent %s", msg);
}
