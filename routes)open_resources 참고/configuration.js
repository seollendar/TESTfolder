const router = require('express').Router();
const util = require('util');
const fs = require('fs');

// let config = require('../configuration/config_deprecated');
let config = require('../configuration/config.json');
let currentPort = config.server.port;

let changableData = {
  database: config.db,
  mobius: config.mobius,
  bada: config.server
}


router.get('/info', (req, res)=>{
  delete changableData.database.mysql.debug;
  delete changableData.database.mysql.database;
  delete changableData.database.influx.database;
  delete changableData.database.influx.precision;
  delete changableData.database.postgres.database;

  res.send(changableData);
})

router.post('/info', (req, res)=>{
  let changedData = req.body;

  config.server.port = changedData.bada.port;
  config.db = changedData.database;
  config.mobius = changedData.mobius;
  
  fs.writeFile('./server/configuration/config.json', JSON.stringify(config), (err)=>{
    if(err) {
      console.log(err);
    }
  });

  res.send('Success');
})


module.exports = router;