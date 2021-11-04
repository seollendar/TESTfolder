const router = require('express').Router();
const http = require('http');

const Config = require('../configuration/config.json');
const responseTime = require('../src/response-time');

const GET = 'get';

let globalOptions = {
  hostname: Config.mobius.host,
  port: Config.mobius.port,
  method: GET,
  path: '',
  headers: {
    'Accept': 'application/json',
    'X-M2M-RI': 'ketiketi',
    'X-M2M-Origin': 'S',
  }
}

router.get('/*/*/latest', (req, res) => {
  let options = JSON.parse(JSON.stringify(globalOptions));
  let names = req.path.split('/');
  let aeName = names[1];
  let cntName = names[2];

  options.headers['Accept'] = req.headers['accept'];
  options.headers['X-M2M-RI'] = req.headers['x-m2m-ri'];
  options.headers['X-M2M-Origin'] = req.headers['x-m2m-origin'];

  options.path = "/" + Config.mobius.cb + "/" + aeName + "/" + cntName + "/latest";

  console.log(aeName);
  console.log(cntName);

  http.get(options, (response) => {
    let data = "";

    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      res.send(JSON.parse(data));
    })
  })
})


module.exports = router;