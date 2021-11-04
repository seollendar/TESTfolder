var express = require('express')
  , http = require('http')
  , app = express()
  , server = http.createServer(app);

app.get('/', function (req, res) {
  res.send('Hello /');
});

app.get('/world.html', function (req, res) {
  res.send('Hello World');
});

server.listen(8000, function() {
  console.log('Express server listening on port ' + server.address().port);
});



  app.post("/no_on", (req, res)=>{  
    console.log(req.header)
    console.log(req.body)
    let jsonbody = req.body;
  /*
    console.log("Start...");
    var fullBody = '';
    req.on('data', function(chunk) {
      fullBody += chunk;      
    });
    console.log("req.data end..");
    
    req.on('end', function() {      
    {
      console.log("req.on end.. ");
      var jsonbody = JSON.parse(fullBody) 
  
  */ 
    res .status (200 ).send ('Received Location Data');
    console .log (">>> Send Response, 200");
  
  })
  

  app.post("/on", (req, res)=>{
    console.log(req.header)
    console.log(req.body)

    var fullBody = '';
    req.on('data', function(chunk) {
      fullBody += chunk; 
      console.log("-------------collecting done---------");     
    });
  
    req.on('end', function() {
      var jsonbody = JSON.parse(fullBody)
      console.log("-------------dataBody---------------");
      console.log(jsonbody);     
      
    })
    res .status (200 ).send ('Received Location Data');
        console .log (">>> Send Response, 200");
    })
  