const router = require('express').Router();
const http = require('http');

const Database = require('../src/database');
const Auth = require('../util/auth');
const Config = require('../configuration/config.json');
const system = require('../src/system-usage');
const responseTime = require('../src/response-time');

const GET = 'get';
const POST = 'post';
const PUT = 'put';
const DELETE = 'delete';

let globalOptions = {
  hostname: Config.mobius.host,
  port: Config.mobius.port,
  method: 'POST',
  path: '/' + Config.mobius.cb + '?rcn=3',
  headers: {
    'Accept': 'application/json',
    'X-M2M-RI': 'ketiketi',
    'X-M2M-Origin': 'S',
  }
}

let getMobiusApi = (key, options, durationList, callback) => {
  http.get(options, (response) => {
    let data = "";
    let returnData = '';

    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      console.log('return mobius data: ', JSON.parse(data));
      returnData = JSON.parse(data)["m2m:" + key];

      if (!returnData) {
        returnData = [];
      }

      if (durationList) {
        durationList.forEach((dateSet, dataIndex) => {
          returnData.findIndex((element, containerIndex) => {
            if (element.ct.search(dateSet.date) === 0) {
              durationList[dataIndex].count += 1;
            }
          })
        })
        returnData = durationList;
      }
      callback(returnData);
    })
  })
}

let dailyCount = (userId, type, start_date, end_date, callback) => {
  let sql = 'SELECT resource_type, resource_count, creation_time FROM dailycount WHERE resource_type=\''+ type +'\' '
            + 'AND creation_time BETWEEN '+ start_date +' AND ' + end_date;

  if(userId !== Config.server.admin.id) {
    sql += ' AND user=\'' + userId + '\'';
  } else {
    sql = 'SELECT resource_type, sum(resource_count) as resource_count, creation_time FROM dailycount WHERE resource_type=\''+ type +'\' '
    + 'AND creation_time BETWEEN '+ start_date +' AND ' + end_date + ' GROUP BY creation_time';
  };
            
  Database.mysql.query(sql, (err, result) => {
    if(err) throw err;

    if(!result[0]) { console.log('nop allowd')};

    callback(result);
  })
}

let saveResourceOwner = (userId, aeId) => {
  let sql = 'INSERT INTO CREATION VALUES (\''+ userId + '\', \''+ aeId +'\')';
  Database.mysql.query(sql, (err, result) => {
    if(err) throw err;

    console.log('Resource Owner Saved : ', result);
  })
}

let saveTimeseriesData = (ae, cnt, name, con) => {
  Database.influx.writePoints([{
    measurement: ae,
    tags: { cnt: cnt },
    fields: {
      name: name,
      con: con
    }
  }]);
}

let saveResource = (type, data, userId, path, storage) => {
  let insertData = {};

  insertData = data['m2m:rce']['m2m:'+ type];
  insertData.user = userId;

  if(type === 'cnt') {
    insertData.path = path + "/" + insertData.rn;
    insertData.timeseries = storage.timeseries;
    insertData.spatialData = storage.spatialdata;
  }

  let values = Object.values(insertData);
  let valueString = '';

  values.forEach((element, index) => {
    valueString += "'" + element + "'" + (index == (values.length - 1) ? "" : ",");
  })

  let sql = "INSERT INTO " + type + " (" + Object.keys(insertData) + ") VALUES (" + valueString + ")";

  Database.mysql.query(sql, (err, result) => {
    if (err) throw err;

    if(result.affectedRows === 1) {
      console.log('Success the ' + type + ' creation');
    }
    console.log('send query and return message', result);
  });
}

let saveCount = (type, data, userId) => {
  let sql = '';
  let insertData = {
    resource_type: type,
    creation_time: data['m2m:rce']['m2m:'+ type].ct.split('T', 1)
  }

  let logMessage = 'Resource Daily Counting UPDATE Success';

  sql = 'UPDATE dailycount SET resource_count = resource_count + 1 WHERE '
          + 'user=\'' + userId
          + '\' AND resource_type=\'' + insertData.resource_type
          + '\' AND creation_time=\'' + insertData.creation_time + '\'';

  Database.mysql.query(sql, (err, result) => {
    if(err) throw err;

    if(result.affectedRows === 0) {
      sql = "INSERT dailycount (user, resource_type, resource_count, creation_time) VALUES ('"
            + userId + "', '" 
            + insertData.resource_type + "', 1, '" 
            + insertData.creation_time + "' )";

      Database.mysql.query(sql, (err, result) => {
        if(err) throw err;

        logMessage = 'Resource Daily Counting INSERT Success';
      })
    }
    console.log(logMessage);
  })
}

let saveLatest = (userId, parent, data) => {
  let insertData = {};
  let logMessage = 'UPDATE Latest CIN success';;
  let values = '';
  let updateString = '';
  let insertString = '';
  let sql = '';

  insertData = data['m2m:rce']['m2m:cin'];
  insertData.sri = data['m2m:rce']['m2m:cin'].ri;
  insertData.ri = '/' + data['m2m:rce'].uri;
  insertData.ae = parent.ae;
  insertData.cnt = parent.cnt;

  values = Object.values(insertData);

  values.forEach((element, index) => {
    updateString += Object.keys(insertData)[index] + "='" + element + (index == (values.length - 1) ? "'" : "',");
  });

  values.forEach((element, index) => {
    insertString += "'" + element + "'" + (index == (values.length - 1) ? "" : ",");
  })
  
  sql ="UPDATE latestcin SET " + updateString + " WHERE ae='" + parent.ae + "' AND cnt='" + parent.cnt + "'";

  Database.mysql.query(sql, (err, result) => {
    if(err) throw err;

    if(result.affectedRows === 0) {

      sql = "INSERT INTO latestcin (" + Object.keys(insertData) + ") VALUES (" + insertString + ")";

      Database.mysql.query(sql, (err, result) => {
        if(err) throw err;

        logMessage = 'INSERT Latest CIN success';
      })
    }
    console.log(logMessage);
  })
}


router.get('/count', (req, res) => {
  let loginStatus = Auth.isLoggedIn(req.headers['x-access-token']);
  let userId = Auth.getUserId(req.headers['x-access-token']);
  let sql = '';
  let userSql = '';

  if(!loginStatus.admin) {
    userSql = 'WHERE user=\'' + userId + '\' ';
    typeWhere = 'and';
  } else {
    typeWhere = 'WHERE';
  }
  
  sql = 'SELECT (SELECT COUNT(*) FROM AE ' + userSql + ') as ae, (SELECT COUNT(*) FROM cnt ' + userSql + ') as cnt, (SELECT SUM(resource_count) FROM Dailycount ' + userSql + typeWhere + ' resource_type=\'cin\') as cin FROM dual';

  Database.mysql.query(sql, (err, result) => {
    if(err) {
      res.status(err.status).send(err.sqlMessage);
    }
    
    res.send(result[0]); 
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  })
});

router.get('/system', (req, res) => {
  let results = {};  
  
  system.usage().then((result)=> {
    results.server = result.osUsage;
    results.process = result.processUsage;
    return responseTime.average();
  }).then((responseAvg)=>{
    results.responseTime = responseAvg;
    res.json(results);
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  });
})

router.get('/cin/daily', (req, res) => {
  let userId = Auth.getUserId(req.headers['x-access-token']);
  let start_date = new Date(req.query.start_date);
  let end_date = new Date(req.query.end_date);
  let durationList = [];
  
  while (start_date <= end_date) {
    let month = (start_date.getMonth() + 1).toString();
    let date = start_date.getDate().toString();
    let fullDate = start_date.getFullYear() + (month[1] ? month : '0' + month[0]) + (date[1] ? date : '0' + date[0]);
    let dateSet = {
      date: fullDate,
      count: 0
    };
    durationList.push(dateSet);
    start_date.setDate(start_date.getDate() + 1);
    
  }

  dailyCount(userId, 'cin', new Date(req.query.start_date).yyyymmdd(), new Date(req.query.end_date).yyyymmdd(), (dataList) => {
    durationList.forEach((element) => {
      dataList.forEach((data) => {
        if(element.date === data.creation_time.yyyymmdd()) {
          element.count = data.resource_count;
        }  
      })
    })
    res.send(durationList);
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  });
})



router.post('/ae', (req, res) => {
  if (!req.body) {
    res.status(400).send('Bad Request');
  }
  let type = 'ae';
  let userId = Auth.getUserId(req.headers['x-access-token']);
  let options = JSON.parse(JSON.stringify(globalOptions));

  let requestData = {"m2m:ae": req.body };
  
  options.headers['Content-Type'] = 'application/json; ty=2';

  try {
    const request = http.request(options, (response) => {
      let data = '';
  
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        let resultData = JSON.parse(data);
  
        if (response.statusCode === 201) {
          try {
  
            // saveResourceOwner(userId, resultData['m2m:rce']['m2m:'+ type].ri);
            saveResource(type, resultData, userId);
            saveCount(type, resultData, userId);
    
            req.io.to(userId).to(Config.server.admin.id).emit('ae', resultData);
          } catch(e) {
            console.log(e);
          }
        };
  
        res.status(response.statusCode).json(resultData);
        responseTime.store(res.getHeader("X-Response-Time"), POST);
      })
    })
  
    request.write(JSON.stringify(requestData));
    request.end();
  } catch(e) {
    console.log(e);
  }

});

router.post('/cnt', (req, res) => {
  if (!req.body) {
    res.status(400).send('Bad Request');
  }

  let type = 'cnt';
  let userId = Auth.getUserId(req.headers['x-access-token']);
  let options = JSON.parse(JSON.stringify(globalOptions));

  let requestData = {
    'm2m:cnt': {
      'rn': ''
    }
  };

  let storage = {
    timeseries : req.body.timeseries,
    spatialdata : req.body.spatialdata
  }
  let pathList = req.body.path;

  let pathString = "";
  pathList.forEach((path) => {
    pathString += "/" + path
  })

  delete req.body.ae;
  delete req.body.path;
  delete req.body.timeseries;
  delete req.body.spatialdata;

  requestData['m2m:cnt'] = req.body;

  options.headers['Content-Type'] = 'application/json; ty=3';
  options.path = '/' + Config.mobius.cb + pathString + '?rcn=3';

  try {
    const request = http.request(options, (response) => {
      let data = '';
  
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        let resultData = JSON.parse(data);
        let emitData = {};
        // emitData.ae = req.body.ae;
        if(JSON.parse(data).hasOwnProperty('m2m:dbg')) {
          emitData = resultData;
        } else {
          emitData = JSON.parse(data)['m2m:rce']['m2m:cnt'];
        }
  
        if (response.statusCode === 201) {
          saveResource(type, resultData, userId, pathString, storage);
          saveCount(type, resultData, userId);
  
          req.io.to(userId).to(Config.server.admin.id).emit('cnt', emitData);
        };
  
        res.status(response.statusCode).json(resultData);
        responseTime.store(res.getHeader("X-Response-Time"), POST);
      })
    })
  
    request.write(JSON.stringify(requestData));
    request.end();
  } catch(e) {
    console.log(e);
  }  
});

router.post('/cin', (req, res) => {
  if (!req.body) {
    res.status(400).send('Bad Request');
  }
  let type = 'cin';
  let userId = Auth.getUserId(req.headers['x-access-token']);
  let options = JSON.parse(JSON.stringify(globalOptions));

  let parentResource =  {
    ae: req.body.ae,
    cnt: req.body.cnt
  }

  let requestData = {
    'm2m:sub': {
      'con': ''
    }
  };

  let pathList = req.body.path;

  let pathString = "";
  pathList.forEach((path) => {
    pathString += "/" + path
  })

  requestData['m2m:cin'].con = req.body.con;
  options.headers['Content-Type'] = 'application/json; ty=4';
  options.path = '/' + Config.mobius.cb + '/' + parentResource.ae + '/' + parentResource.cnt + '?rcn=3';

  const request = http.request(options, (response) => {
    let data = '';

    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      let resultData = JSON.parse(data);

      let emitData = JSON.parse(data)['m2m:rce']['m2m:cin'];
      emitData.ae = parentResource.ae;
      emitData.cnt = parentResource.cnt;

      if (response.statusCode === 201) {
        saveLatest(userId, parentResource, resultData);
        saveCount(type, resultData, userId);
        req.io.to(userId).to(Config.server.admin.id).emit('cin', emitData);
      };

      res.status(response.statusCode).json(resultData);
      responseTime.store(res.getHeader("X-Response-Time"), POST);
    })
  })

  request.write(JSON.stringify(requestData));
  request.end();
});

router.post('/sub', (req, res) => {
  if (!req.body) {
    res.status(400).send('Bad Request');
  }

  let userId = Auth.getUserId(req.headers['x-access-token']);
  let options = JSON.parse(JSON.stringify(globalOptions));

  let requestData = {
    'm2m:sub': {
      'rn': '',
      'enc': {'net': []},
      'pn': ''
    }
  };

  let pathList = req.body.path;

  let pathString = "";
  pathList.forEach((path) => {
    pathString += "/" + path
  })


  requestData['m2m:sub'] = req.body;
  requestData['m2m:sub'].enc = {'net': req.body.net};

  delete req.body.ae;
  delete req.body.path;
  delete req.body.net;

  options.headers['Content-Type'] = 'application/json; ty=23';
  options.path = '/' + Config.mobius.cb + pathString + '?rcn=3';

  try {
    const request = http.request(options, (response) => {
      let data = '';
  
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        let resultData = JSON.parse(data);
        let emitData = {};

        if(JSON.parse(data).hasOwnProperty('m2m:dbg')) {
          emitData = resultData;
        } else {
          emitData = JSON.parse(data)['m2m:rce']['m2m:sub'];
        }
  
        if (response.statusCode === 201) { 
          req.io.to(userId).to(Config.server.admin.id).emit('sub', emitData);
        };
        
        res.status(response.statusCode).json(resultData);
        responseTime.store(res.getHeader("X-Response-Time"), POST);
      })
    })
  
    request.write(JSON.stringify(requestData));
    request.end();
  } catch(e) {
    console.log(e);
  }  
})

router.delete('/sub', (req, res) => {
  if (!req.query.url) {
    res.status(400).send('Bad Request');
  }

  let userId = Auth.getUserId(req.headers['x-access-token']);
  let options = JSON.parse(JSON.stringify(globalOptions));

  options.method = "DELETE";
  options.path = '/' + Config.mobius.cb + req.query.url + '?rcn=1';

  console.log('subscription options' ,options);
  try {
    let request = http.request(options, (response) => {
      let data = '';
  
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        let resultData = JSON.parse(data);
        let emitData = {};

        if(JSON.parse(data).hasOwnProperty('m2m:dbg')) {
          emitData = resultData;
        } else {
          emitData = JSON.parse(data)['m2m:sub'];
          emitData.delete = true;
        }
        res.status(response.statusCode).json(emitData);
        responseTime.store(res.getHeader("X-Response-Time"), DELETE);
      })
    })
    
    request.end();
  } catch(e) {
    console.log(e);
  }
})

router.delete('/cnt', (req, res) => {
  if (!req.query.url) {
    res.status(400).send('Bad Request');
  }

  let userId = Auth.getUserId(req.headers['x-access-token']);
  let options = JSON.parse(JSON.stringify(globalOptions));

  options.method = "DELETE";
  options.path = '/' + Config.mobius.cb + req.query.url + '?rcn=1';

  try {
    let request = http.request(options, (response) => {
      let data = '';
  
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        let resultData = JSON.parse(data);
        let emitData = {};

        if(JSON.parse(data).hasOwnProperty('m2m:dbg')) {
          emitData = resultData;
        } else {
          emitData = JSON.parse(data)['m2m:cnt'];
          emitData.delete = true;
        }

        if(response.statusCode === 200) {
          deleteResource('cnt', req.query.ri);
          req.io.to(userId).to(Config.server.admin.id).emit('cnt', emitData);
        }

        res.status(response.statusCode).json(emitData);
        responseTime.store(res.getHeader("X-Response-Time"), DELETE);
      })
    })
    
    request.end();
  } catch(e) {
    console.log(e);
  }
})

router.delete('/ae', (req, res) => {
  if (!req.query.url) {
    res.status(400).send('Bad Request');
  }

  let userId = Auth.getUserId(req.headers['x-access-token']);
  let options = JSON.parse(JSON.stringify(globalOptions));

  options.method = "DELETE";
  options.path = '/' + Config.mobius.cb + req.query.url + '?rcn=1';
  options.headers['X-M2M-Origin'] = req.query.ri;

  try {
    let request = http.request(options, (response) => {
      let data = '';
  
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        let resultData = JSON.parse(data);
        let emitData = {};

        if(JSON.parse(data).hasOwnProperty('m2m:dbg')) {
          emitData = resultData;
        } else {
          emitData = JSON.parse(data)['m2m:ae'];
          emitData.delete = true;
        }

        if(response.statusCode === 200) {
          deleteResource('ae', req.query.ri);
          req.io.to(userId).to(Config.server.admin.id).emit('ae', emitData);
        }

        res.status(response.statusCode).json(emitData);
        responseTime.store(res.getHeader("X-Response-Time"), DELETE);
      })
    })
    
    request.end();
  } catch(e) {
    console.log(e);
  }
})

let deleteResource = (type, resourceId) => {
  let sql = "DELETE FROM " + type + " WHERE ri=" + "'" + resourceId + "'";

  Database.mysql.query(sql, (err, result) => {
    if (err) throw err;

    if(result.affectedRows === 1) {
      console.log('Success the ' + type + ' creation');
    }
    console.log('send query and return message', result);
  })
}


router.get('/latest', (req, res) => {
  let loginStatus = Auth.isLoggedIn(req.headers['x-access-token']);
  let userId = Auth.getUserId(req.headers['x-access-token']);

  let sql = "";
  let limit = Config.resource.limit;

  if (!req.query.type) {
    res.status(406).send("Resource is not specified");
  }
  if (req.query.limit) {
    limit = req.query.limit;
  }

  if(req.query.type === "AE") {
    sql = "SELECT * FROM ae"
  } else if(req.query.type === "CNT") {
    sql = "SELECT cnt.*, ae.rn as ae FROM cnt LEFT JOIN ae ON cnt.pi = ae.ri"
  } else if(req.query.type === "CIN"){
    sql = "select latestcin.*, cnt.user as user FROM LATESTCIN LEFT JOIN cnt ON latestcin.pi = cnt.ri";
  }

  if(!loginStatus.admin) {
    sql += " WHERE user='" + userId + "'";
  }

  sql += " ORDER BY ct DESC LIMIT " + limit;

  Database.mysql.query(sql, (err, result) => {
    if (err) {
      console.log(' error');
    };

    res.json(result);
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  })
})

router.get('/latest/cnt', (req, res) =>{
  let loginStatus = Auth.isLoggedIn(req.headers['x-access-token']);
  let userId = Auth.getUserId(req.headers['x-access-token']);
  let sql = 'SELECT latestcin.* FROM latestcin LEFT JOIN AE on ae.rn = latestcin.ae';
  let whereList = [];
  let whereSet = "";

  if(!loginStatus.admin) {
    whereList.push('user=\'' + userId + '\'');
  }

  if(req.query.parent) {
    whereList.push('cnt=\'' + req.query.parent + '\'');
  }

  if(whereList.length > 0) {
    whereSet += ' WHERE ';

    whereList.forEach((clause, index, list) => {
      whereSet += list[index+1]? clause + ' AND ': clause;
    })
  }

  sql += whereSet;

  Database.mysql.query(sql, (err, result) => {
    if(err) { console.log('Database error')};

    res.send(result);
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  })
})


router.get('/ae', function (req, res) {
  let loginStatus = Auth.isLoggedIn(req.headers['x-access-token']);
  let userId = Auth.getUserId(req.headers['x-access-token']);
  let sql = "";
  let whereList = [];
  let whereSet = "";

  if(!loginStatus.admin) {
    whereList.push('user=\'' + userId + '\'');
  }

  if(req.query.ri) {
    whereList.push('ri=\'' + req.query.ri + '\'');
  } else if(req.query.rn) {
    whereList.push('rn=\'' + req.query.rn + '\'');
  }

  if(whereList.length > 0) {
    whereSet += ' WHERE ';

    whereList.forEach((clause, index, list) => {
      whereSet += list[index+1]? clause + ' AND ': clause;
    })
  }

  sql = 'SELECT * FROM ae ' + whereSet;

  Database.mysql.query(sql, (err, result) => {
    if(err) { console.log('Database error')};

    res.send(result);
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  })
});

router.get('/cnt', (req, res) => {
  let loginStatus = Auth.isLoggedIn(req.headers['x-access-token']);
  let userId = Auth.getUserId(req.headers['x-access-token']);
  let sql = 'SELECT * FROM cnt ';
  let whereList = [];

  if(!loginStatus.admin) {
    whereList.push('user=\'' + userId + '\'');
  }
  if(req.query.pi) {
    whereList.push('pi=\'' + req.query.pi + '\'');
  } else if(req.query.ri) {
    whereList.push('ri=\'' + req.query.ri + '\'');
  } else if(req.query.rn) {
    whereList.push('rn=\'' + req.query.rn + '\'');
  }
  
  if(req.query.path) {
    whereList.push('path=\'' + req.query.path + '\'');
  }

  if(whereList.length > 0) {
    sql += ' WHERE ';

    whereList.forEach((clause, index, list) => {
      sql += list[index+1]? clause + ' AND ': clause;
    })
  }

  Database.mysql.query(sql, (err, result) => {
    if(err) { console.log(err) };
    
    res.send(result);
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  })
});

router.get('/cnt/children', (req, res) => {
  if(!req.query.pi && !req.query.ri) return;

  let data = "";
  let options = JSON.parse(JSON.stringify(globalOptions));

  options.method = "GET";
  options.headers['Content-Type'] = 'application/json; ty=3';
  options.path = '/' + Config.mobius.cb + req.query.parent + '/' + req.query.ri + '?rcn=4&ty=23&ty=3';

  http.get(options, (response) => {
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {      
      res.json(JSON.parse(data)['m2m:rsp']);
      responseTime.store(res.getHeader("X-Response-Time"), GET);
    })
  })
})


router.get('/cnt/sub', (req, res) => {
  if(!req.query.path) return;
  
  let data = "";
  let path = req.query.path;
  let api = "";
  let options = JSON.parse(JSON.stringify(globalOptions));

  path.forEach((value, index) => {
    api += "/" + value
  })

  options.method = "GET";
  options.headers['Content-Type'] = 'application/json; ty=3';
  options.path = '/' + Config.mobius.cb + api + '?rcn=4&ty=23';

  http.get(options, (response) => {
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      res.json(JSON.parse(data)['m2m:sub']);
      responseTime.store(res.getHeader("X-Response-Time"), GET);
    })
  })
})

router.get('/children', (req, res) => {
  if(!req.query.resource) return;
  let data = "";
  let path = req.query.path;
  let resourceName = JSON.parse(req.query.resource).rn;
  let resourceId = JSON.parse(req.query.resource).ri;
  let pathString = "";
  let options = JSON.parse(JSON.stringify(globalOptions));

  if(typeof path === "object") {
    path.forEach((value, index) => {
      pathString += "/" + value;
    })
  }

  let resultChildren = {
    "cnt": [],
    "sub": [],
    "cin": {}
  }

  options.method = "GET";
  options.path = '/' + Config.mobius.cb + pathString + '?rcn=4&ty=3&ty=23';

  let sql = 'SELECT * FROM latestcin where pi=\'' + resourceId + '\'';
  Database.mysql.query(sql, (err, result) => {
    if(err) { console.log('Database error')};

    resultChildren.cin = result[0];

    http.get(options, (response) => {
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk; 
      }).on('end', () => {
  
        let resourceAll = JSON.parse(data)['m2m:rsp'];
        function myResourceFilter(value) {
          return value.pi === resourceId;
        }

        if(resourceAll["m2m:cnt"]) {
          resultChildren.cnt = resourceAll["m2m:cnt"].filter(myResourceFilter);
        }

        if(resourceAll["m2m:sub"]) {
          resultChildren.sub = resourceAll["m2m:sub"].filter(myResourceFilter);
        }

        res.json(resultChildren);
        responseTime.store(res.getHeader("X-Response-Time"), GET);
      })
    })
  })
})

router.get('/ae/children', (req, res) => {
  let data = "";
  let options = JSON.parse(JSON.stringify(globalOptions));
  if(!req.query.pi && !req.query.ri) return;

  options.method = "GET";
  options.headers['Content-Type'] = 'application/json; ty=2';
  options.path = '/' + Config.mobius.cb + req.query.parent + '/' + req.query.ri + '?rcn=4&ty=3';

  http.get(options, (response) => {
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      res.json(JSON.parse(data)['m2m:rsp']);
      responseTime.store(res.getHeader("X-Response-Time"), GET);
    })
  })
})

router.get('/intensification', (req, res) => {
  let userId = Auth.getUserId(req.headers['x-access-token']);
  let today = new Date();
  let yesterday = new Date();

  yesterday.setDate(today.getDate()-1);

  let sql = 'SELECT * FROM dailycount WHERE user=\'' + userId + '\' AND resource_type=\'cin\' AND creation_time BETWEEN \'' + yesterday.yyyymmdd() + '\' AND \'' + today.yyyymmdd() + '\'';
  // let sql = 'SELECT * FROM dailycount WHERE user=\'' + userId + '\' AND resource_type=\'cin\' AND creation_time BETWEEN 20180805 AND 20180806';
  Database.mysql.query(sql, (err, result) => {
    if(err) { console.log('Database error')};

    result.forEach(element => {
      element.creation_time = new Date(element.creation_time).yyyymmdd();
    }) 
    res.send(result);
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  })
});

module.exports = router;