[yyyy-MM-ddThh:mm:ss]  
	var net = require('net');
	var server = net.createServer(function(socket) {
		// connection event
		console.time('CHECK')
		console.log('클라이언트 접속');
		
		socket.write('Welcome to Socket Server');

		socket.on('data', function(chunk) {
			//console.log('클라이언트가 보냄 : ',chunk.toString());

		/* \n 구분자로 client전송메세지 개수만큼 preprocessing*/
			// var OfArray = chunk.toString().split('\n');
			// var numOfArray = OfArray.length;
			//console.log("numOfArray: ", numOfArray);
			// for(i=0; i<numOfArray; i++){
				preprocessing(chunk)
			// }			
			
		});
		
		socket.on('end', function() {
			console.timeEnd('CHECK')
			console.log('클라이언트 접속 종료');		
			console.log("count: ",count);	
		});
	});

	server.on('listening', function() {
		console.log('Server is listening');
	});

	server.on('close', function() {
		console.log('Server closed');
	});

	server.listen(8000);
	

	function preprocessing(){
		var getData;
		//console.log('preprocessing : ',chunk);
		count++
		
		var name;
		getData = getDataFromRedis('std06');
		name = 'std06'+'std'+ getData;
		setDataToRedis('std06', 'std');	
	}
		

	function getDataFromRedis(key) {
		return new Promise((resolve, reject) => {
			client.get(key, function (err, data) {
				if (err) {
					reject(err);
				}
				else {
					resolve(data);
				}
			});
		});
	}

	function setDataToRedis(key, value) {
		client.set(key, value, function (err, data) {
			if (err) {
				console.log(`set err: ${err}`);
				return;
			}
		});
	}


/* redis tps test*/
	function redistest(){
		console.time('T')
		for(i=0; i<100000; i++){
			var name;
			getData = getDataFromRedis('std06');
			name = 'std06'+'std'+ getData;
			setDataToRedis('std06', 'std');
		}
		console.timeEnd('T')
		
	}	
	//redistest();


// }