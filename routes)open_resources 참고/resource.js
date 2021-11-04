const router = require('express').Router();
const http = require('http');

const database = require('../src/database');
const responseTime = require('../src/responseTime');
const system = require('../src/system');
const config = require('../configuration/config');
const Auth = require('../util/auth');

const countQuery = "SELECT COUNT(*) FROM "
const resourceTable = {
  ae: "ae",
  cnt: "cnt",
  cin: "cin"
}

const resourceCount = (db, table) => {
  return new Promise((resolve) => {
    db.query(countQuery + table, (err, result) => {
      if (err) throw err;

      let resultCount;

      if (!result[0]) {
        resultCount = 0;
      }

      resultCount = result[0]["COUNT(*)"];
      resolve(resultCount);
    })
  })
}

const allResourceCounting = async (admin) => {
  const allCounting = {};

  allCounting.aeCount = await resourceCount(database.bada, resourceTable.ae);
  allCounting.cntCount = await resourceCount(database.mobius, resourceTable.cnt);
  allCounting.cinCount = await resourceCount(database.mobius, resourceTable.cin);
  allCounting.userCount = await resourceCount(database.bada, 'user');

  return allCounting;
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

let countResourceFromMobius = (type) => {
  let key = '';
  if (type === 2) {
    key = 'ae';
  } else if (type === 3) {
    key = 'cnt';
  } else {
    key = 'cin';
  }

  return new Promise((resolve) => {
    let data = "";
    let options = {
      hostname: config.mobius.host,
      port: config.mobius.port,
      path: '/' + config.mobius.cb + '?fu=1&ty=' + type + '&rcn=4',
      headers: {
        'Content-Type': 'application/json',
        'X-M2M-RI': 'ketiketi',
        'X-M2M-Origin': 'keti'
      }
    };

    http.get(options, (response) => {
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        // console.log('get each resource: ', JSON.parse(data)['m2m:'+ key]);
        resolve(JSON.parse(data)['m2m:uril'].length);
      })
    })
  })
}

let countResourcesByAdmin = async () => {
  let counting = {
    ae: 0,
    cnt: 0,
    cin: 0,
    user: 0
  };

  counting.ae = await countResourceFromMobius(2);
  counting.cnt = await countResourceFromMobius(3);
  counting.cin = await countResourceFromMobius(4);
  counting.user = await resourceCount(database.bada, 'user');


  console.log('counting data', counting);
  return counting;
}

let getCntCinCount = async (aeList) => {
  let index = 0;
  let dataSet = [];

  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    method: 'GET',
    path: '/' + config.mobius.cb,
    headers: {
      'Accept': 'application/json',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'keti'
    }
  }

  const getAeResourceCount = (options) => {
    return new Promise((resolve) => {
      http.get(options, (response) => {
        let data = "";

        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          data += chunk;
        }).on('end', () => {
          let jsonData = JSON.parse(data);

          let returnData = {
            cnt_count: jsonData["m2m:cnt"] ? jsonData["m2m:cnt"].length : 0,
            cin_count: 0
          };
      
          jsonData["m2m:cnt"].forEach((element) => {
            returnData.cin_count += element.cni;
          })

          resolve(returnData);
        })
      })
    })
  }

  while (aeList[index]) {
    options.path = '/' + config.mobius.cb + '/' + aeList[index].ae_id + '?rcn=4&ty=3';
    countData = await getAeResourceCount(options);

    dataSet[index] = {
      ae_name: aeList[index].ae_id,
      cnt_count: countData.cnt_count,
      cin_count: countData.cin_count
    }

    index++;
  }

  console.log(dataSet);
  return dataSet;
}

let getUserCntInformation = () => {
  let userId = Auth.getUserId(req.headers['x-access-token']);
  userId = 'user@bada.com';

  getUserAeList(userId)
  .then((aeList) => {
    aeList.forEach((ae, index) => {
      getLatestCinByCnt
    })
  })
}

router.get('/latest/cnt', (req, res) => {
  let userId = Auth.getUserId(req.headers['x-access-token']);

  getUserAeList(userId)
  .then((aeList) => {
    return getAllCntList(aeList);
  })
  .then(allCntList => {
    let asyncList = async (allCntList) => {
      let index = 0;
      let asyncList = [];

      while(allCntList[index]) {
        let latest = await getLatestCinByCnt(allCntList[index]);
        asyncList.push(latest);
        index++;
      }
      return asyncList;
    }
    
    return asyncList(allCntList);
  })
  .then(latestList => {
    console.log('before return final : ', latestList);
    res.send(latestList);
  })
})

const getAllCntList = async (aeList) => {
  let cntListAll = [];
  let index = 0;
  while(aeList[index]) {
    let cntList = await getCntList(aeList[index].ae_id);

    if(cntList.length > 0) {
      cntList.forEach(element => {
        cntListAll.push({ae:aeList[index].ae_id , cnt:element.rn})
      })
    } else {
      cntListAll.push({ae:aeList[index].ae_id , cnt:cntList.rn})
    }
    index++;
  }

  return cntListAll;
}

const getCntList = (ae) => {
  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    method: 'GET',
    path: '/' + config.mobius.cb,
    headers: {
      'Accept': 'application/json',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'keti'
    }
  }
  options.path = '/' + config.mobius.cb + '/' + ae + '?ty=3&rcn=4';

  return new Promise((resolve) => {
    http.get(options, (response) => {
      let data = "";

      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        resolve(JSON.parse(data)["m2m:cnt"]);
      })
    })
  })
}

const getLatestCinByCnt = (cnt) => {
  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    method: 'GET',
    path: '/' + config.mobius.cb,
    headers: {
      'Accept': 'application/json',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'keti'
    }
  }
  options.path = '/' + config.mobius.cb + '/' + cnt.ae + '/' + cnt.cnt + '/latest'

  return new Promise((resolve) => {
    http.get(options, (response) => {
      let data = "";

      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        let jsonData = JSON.parse(data)["m2m:cin"];

        jsonData.cnt = cnt.cnt;
        jsonData.ae = cnt.ae;

        resolve(jsonData);
      })
    })
  })
}

let getUserAeList = (userId) => {
  return new Promise((resolve) => {
    let sql = 'SELECT * FROM creation WHERE user="' + userId + '"';

    database.bada.query(sql, (err, result) => {
      if (err) throw err;
      
      resolve(result);
    })
  })
}

router.get('/counting', (req, res) => {
  let loginStatus = Auth.isLoggedIn(req.headers['x-access-token']);
  let userId = Auth.getUserId(req.headers['x-access-token']);
  if (!loginStatus.success) {
    res.status(400).send('Bad Request');
  }

  if (loginStatus.admin) {
    countResourcesByAdmin()
      .then((countResult) => {
        res.send(countResult);
      });
  } else {
    let sql = 'SELECT * FROM creation WHERE user="' + userId + '"';
    let dataSet = {
      ae: 0,
      cnt: 0,
      cin: 0
    }

    database.bada.query(sql, (err, result) => {
      if (err) throw err;

      dataSet.ae = result.length;
      getCntCinCount(result)
        .then((dataList) => {
          dataList.forEach((data, index) => {
            dataSet.cnt += data.cnt_count;
            dataSet.cin += data.cin_count;
          });
          res.send(dataSet);
        })
    })
  }
})

router.get('/system', (req, res) => {
  let results = {};
  let systemValue = system.resources();
  results.cpu = systemValue.cpuPercent;
  results.memory = systemValue.memoryPercent;
  results.responseTime = responseTime.average();

  res.json(results);
  responseTime.store(res.getHeader("X-Response-Time"));
})

router.get('/ae/daily', (req, res) => {
  if (!req.query.start_date && !req.query.end_date) {
    res.status(400).send('Bad Request');
  }

  let durationList = [];
  let start_date = new Date(req.query.start_date);
  let end_date = new Date(req.query.end_date);
  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    path: '/' + config.mobius.cb + '/' + req.query.id + '?rcn=4',
    headers: {
      'Content-Type': 'application/json',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'keti'
    }
  };
  let subOptions = '?fu=2&ty=2&rcn=4&crb=' + end_date.yyyymmdd() + 'T235959&cra=' + start_date.yyyymmdd() + 'T000000';
  options.path = '/' + config.mobius.cb + subOptions;

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

  getMobiusApi('ae', options, durationList, (data) => {
    console.log('ae returned data: ', data);
    res.json(data);
    responseTime.store(res.getHeader("X-Response-Time"));
  })
})

router.get('/cnt/daily', (req, res) => {
  if (!req.query.start_date && !req.query.end_date) {
    res.status(400).send('Bad Request');
  }

  let durationList = [];
  let start_date = new Date(req.query.start_date);
  let end_date = new Date(req.query.end_date);
  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    path: '/' + config.mobius.cb + '/' + req.query.id + '?rcn=4',
    headers: {
      'Content-Type': 'application/json',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'keti'
    }
  };
  let subOptions = '?fu=2&ty=3&rcn=4&crb=' + end_date.yyyymmdd() + 'T235959&cra=' + start_date.yyyymmdd() + 'T000000';
  options.path = '/' + config.mobius.cb + subOptions;

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
  };

  getMobiusApi('cnt', options, durationList, (data) => {
    res.json(data);
    responseTime.store(res.getHeader("X-Response-Time"));
  })
})

router.get('/cin/daily', (req, res) => {
  if (!req.query.start_date && !req.query.end_date) res.status(400).send('Bad Request');

  let durationList = [];
  let start_date = new Date(req.query.start_date);
  let end_date = new Date(req.query.end_date);
  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    path: '/' + config.mobius.cb + '/' + req.query.id + '?rcn=4',
    headers: {
      'Content-Type': 'application/json',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'keti'
    }
  };
  let subOptions = '?fu=2&ty=4&rcn=4&crb=' + end_date.yyyymmdd() + 'T235959&cra=' + start_date.yyyymmdd() + 'T000000';
  options.path = '/' + config.mobius.cb + subOptions;

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

  getMobiusApi('cin', options, durationList, (data) => {
    console.log('cin returned data: ', data);
    res.json(data);
    responseTime.store(res.getHeader("X-Response-Time"));
  })
})

router.get('/ae', function (req, res) {
  let loginStatus = Auth.isLoggedIn(req.headers['x-access-token']);
  let userId = Auth.getUserId(req.headers['x-access-token']);
  
  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    path: '/' + config.mobius.cb + '?fu=2&ty=2&rcn=4',
    headers: {
      'Content-Type': 'application/json',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'keti'
    }
  }

  if (req.query.isEmpty()) {
    console.log('query check', req.query);
    let userSet = '';
    let aeTable = 'SELECT ri, api, aei, poa, `or`, rr, nl, pi, ty, ct, rn, lt, et, lbl, at, aa, sri, api, ae_create.user_id, (bookmark.ae_id) as bookmark FROM (SELECT * FROM ae LEFT JOIN creation ON ae.rn = creation.ae_id' + userSet +') as ae_create left JOIN bookmark ON ae_create.rn = bookmark.ae_id';
    
    if(!loginStatus.admin) {
      userSet = ' WHERE creation.user_id=\'' + userId + '\' ';
    }

    console.log(aeTable);
    database.bada.query(aeTable, (err, result) => {
      if (err) throw err;

      res.send(result);
      responseTime.store(res.getHeader("X-Response-Time"));
    })
  }

  if (req.query.start_date && req.query.end_date) {
    let start_date = new Date(req.query.start_date);
    let end_date = new Date(req.query.end_date);
    let subOptions = '?fu=2&ty=2&rcn=4&cra=' + start_date.yyyymmdd() + 'T000000&crb=' + end_date.yyyymmdd() + 'T235959';

    options.path = '/' + config.mobius.cb + subOptions;

    getMobiusApi('ae', options, '', (data) => {
      res.json(data);
      responseTime.store(res.getHeader("X-Response-Time"));
    })
  }
});

router.get('/cnt', (req, res) => {
  if (!req.query.id && !req.query.start_date && !req.query.end_date) {
    res.status(400).send('Bad Request');
  }

  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    path: '/' + config.mobius.cb + '/' + req.query.id + '?rcn=4',
    headers: {
      'Content-Type': 'application/json',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'S'
    }
  }

  if (req.query.start_date && req.query.end_date) {
    let start_date = new Date(req.query.start_date);
    let end_date = new Date(req.query.end_date);
    let subOptions = '?fu=2&ty=3&rcn=4&cra=' + start_date.yyyymmdd() + 'T000000&crb=' + end_date.yyyymmdd() + 'T235959';

    options.path = '/' + config.mobius.cb + subOptions;
  }

  getMobiusApi('cnt', options, '', (data) => {
    res.json(data);
    responseTime.store(res.getHeader("X-Response-Time"));
  })
})

router.get('/cin', (req, res) => {
  if (!req.query.id && !req.query.start_date && !req.query.end_date) {
    res.status(400).send('Bad Request');
  }

  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    path: '/' + config.mobius.cb + '/' + req.query.id + '?rcn=4',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'keti'
    }
  }

  if (req.query.start_date && req.query.end_date) {
    let start_date = new Date(req.query.start_date);
    let end_date = new Date(req.query.end_date);
    let subOptions = '?fu=2&ty=4&rcn=4&cra=' + start_date.yyyymmdd() + 'T000000&crb=' + end_date.yyyymmdd() + 'T235959';

    options.path = '/' + config.mobius.cb + subOptions;
  }

  getMobiusApi('cin', options, '', (data) => {
    res.json(data);
    responseTime.store(res.getHeader("X-Response-Time"));
  })
})

router.get('/latest', (req, res) => {
  let query = "SELECT * FROM lookup";
  let limit = config.resource.limit;

  if (!req.query.type) {
    res.status(406).send("Resource is not specified");
  }
  if (req.query.limit) {
    limit = req.query.limit;
  }

  query += ' WHERE ty=' + req.query.type + " ORDER BY ct DESC LIMIT " + limit;

  database.mobius.query(query, (err, result) => {
    if (err) throw err;

    res.json(result);
    responseTime.store(res.getHeader("X-Response-Time"));
  })
})

router.get('/mobius/latest', (req, res) => {
  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    path: '/' + config.mobius.cb + '?fu=1&lim=8&ty=2',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-M2M-RI': 'ketiketi'
    }
  }

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

router.post('/ae', (req, res) => {
  if (!req.body) {
    res.status(400).send('Bad Request');
  }

  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    method: 'POST',
    path: '/' + config.mobius.cb + '?rcn=3',
    headers: {
      'Accept': 'application/json',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'S',
      'Content-Type': 'application/json; ty=2'
    }
  }

  let requestData = {};
  requestData["m2m:ae"] = req.body;

  const request = http.request(options, (response) => {
    let data = "";

    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      let resultData = JSON.parse(data);

      if (response.statusCode === 200) {
        saveAe(resultData)
      };

      res.status(response.statusCode).json(resultData);
    })

  })

  request.write(JSON.stringify(requestData));
  request.end();

});

router.post('/cnt', (req, res) => {
  if (!req.body) {
    res.status(400).send('Bad Request');
  }

  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    method: 'POST',
    path: '/' + config.mobius.cb + '/' + req.body.ae + '?rcn=3',
    headers: {
      'Accept': 'application/json',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'S',
      'Content-Type': 'application/json; ty=3'
    }
  }

  let requestData = {
    "m2m:cnt": {
      "rn": ""
    }
  };
  requestData["m2m:cnt"].rn = req.body.rn;

  const request = http.request(options, (response) => {
    let data = "";

    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      let resultData = JSON.parse(data);

      res.status(response.statusCode).json(resultData);
    })
  })

  request.write(JSON.stringify(requestData));
  request.end();
});

router.post('/cin', (req, res) => {
  if (!req.body) {
    res.status(400).send('Bad Request');
  }

  let options = {
    hostname: config.mobius.host,
    port: config.mobius.port,
    method: 'POST',
    path: '/' + config.mobius.cb + '/' + req.body.ae + '/' + req.body.cnt + '?rcn=3',
    headers: {
      'Accept': 'application/json',
      'X-M2M-RI': 'ketiketi',
      'X-M2M-Origin': 'S',
      'Content-Type': 'application/json; ty=4'
    }
  }

  let requestData = {
    "m2m:cin": {
      "con": ""
    }
  };
  requestData["m2m:cin"].con = req.body.con;

  const request = http.request(options, (response) => {
    let data = "";

    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      let resultData = JSON.parse(data);
      res.status(response.statusCode).json(resultData);
    })
  })

  request.write(JSON.stringify(requestData));
  request.end();
});


let saveAe = (data) => {
  let insertData = {};

  insertData = data['m2m:rce']['m2m:ae'];
  insertData.ri = '/' + data['m2m:rce'].uri;

  let values = Object.values(insertData);
  let valueString = "";

  values.forEach((element, index) => {
    valueString += '\'' + element + '\'' + (index == (values.length - 1) ? '' : ',');
  })

  let sql = 'INSERT INTO ae (' + Object.keys(insertData) + ') VALUES (' + valueString + ')';

  database.bada.query(sql, (err, result) => {
    if (err) throw err;

    console.log(sql);
  })
}

router.get('/matrix', (req, res) => {
  let userId = Auth.getUserId(req.headers['x-access-token']);
  let sql = 'SELECT * FROM creation WHERE user_id="' + userId + '"';

  database.bada.query(sql, (err, result) => {
    if (err) throw err;

    getCntCinCount(result)
      .then((data) => {
        res.send(data);
      })
  })
})

module.exports = router;