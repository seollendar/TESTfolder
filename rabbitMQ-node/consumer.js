var amqp = require("amqplib/callback_api");

//amqp://admin:admin@localhost admin:admin = rabbitmq 계정:암호
amqp.connect("amqp://localhost", function (error0, connection) {
   if (error0) {
      throw error0;
   }

   connection.createChannel(function (error1, channel) {
      if (error1) {
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

      console.log(
         " [*] Waiting for messages in %s. To exit press CTRL+C",
         queue
      );

      //prefetch를 설정해두면 큐에서 최대 10개만 가져감.
      channel.prefetch(10);
      channel.consume(
         queue,
         function (msg) {
            console.log(" [x] Received %s", msg.content.toString());
            // var result = JSON.parse(msg.content.toString());
            // console.log(result.testVal1, result.testVal2, result.testVal3);
            //Ack 메세지를 보내야 큐에서 제거함
            channel.ack(msg);
            //channel.nack(msg);
         },
         {
            //noAck: true 이면 queue에서 데이터를 가져간다음 Ack를 바로 반환함으로 가져가자마자 queue에서 지워버림, ack를 받았을 경우만 큐에서 제거하기 위해 false로 설정
            noAck: false,
         }
      );
   });
});
