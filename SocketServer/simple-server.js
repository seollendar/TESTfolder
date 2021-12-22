var net = require('net');
var moment = require('moment');

var now;

var server = net.createServer(function(socket) {
    // connection event
    console.log('클라이언트 접속');
    socket.write('Welcome to Socket Server');

    socket.on('data', function(chunk) {
		now = moment();
        console.log('[',now,'] 클라이언트가 보냄 : ', chunk.toString());
    });

    socket.on('end', function() {
        console.log('클라이언트 접속 종료');
    });
});

server.on('listening', function() {
    console.log('Server is listening');
});

server.on('close', function() {
    console.log('Server closed');
});

server.listen(3000);