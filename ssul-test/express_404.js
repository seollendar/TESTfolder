var express = require('express'),
    app = express.createServer();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.send('hello world');
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.send('what???', 404);
});

app.listen(3000, '127.0.0.1');