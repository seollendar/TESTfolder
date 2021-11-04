var express = require('express');
var router = express.Router();


/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});


router.get('/', function(req, res) {
  res.status(200).json(
    {
      "success" : true
    }
  );
});

router.get('/test', function(req, res) {
  res.status(200).json(
    {
      "message" : "test"
    }
  );
});


module.exports = router;
