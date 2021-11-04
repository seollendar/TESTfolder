const router = require('express').Router();
const http = require('http');

const Config = require('../configuration/config.json');
const Database = require('../src/database');
const responseTime = require('../src/response-time');

const GET = 'get';
const POST = 'post';
const PUT = 'put';
const DELETE = 'delete';


let globalOptions = {
  hostname: Config.mobius.host,
  port: Config.mobius.port,
  path: '/' + Config.mobius.cb,
  headers: {}
}

function parsePostgresTimeStamp(mobiusTime) {
  let postgresTimeFormat = {
    fullyear: mobiusTime.slice(0, 4),
    month: mobiusTime.slice(4, 6),
    date: mobiusTime.slice(6, 8),
    hour: mobiusTime.slice(9, 11),
    minute: mobiusTime.slice(11, 13),
    second: mobiusTime.slice(13, 15)
  }

  return postgresTimeFormat.fullyear + "/" + postgresTimeFormat.month + "/" + postgresTimeFormat.date 
          + " " + postgresTimeFormat.hour + ":" + postgresTimeFormat.minute + ":" + postgresTimeFormat.second;
}

let saveCount = (type, data) => {
  let sql = '';
  let insertData = {
    user: '',
    resource_type: type,
    creation_time: data['m2m:rce']['m2m:'+ type].ct.split('T', 1)
  }

  let ae_name = data['m2m:rce'].uri.split('/')[1];
  let logMessage = 'Resource Daily Counting UPDATE Success';

  insertData.user = "(SELECT user FROM ae WHERE rn='" + ae_name + "')";

  sql = 'UPDATE dailycount SET resource_count = resource_count + 1 WHERE '
          + 'user=' + insertData.user
          + ' AND resource_type=\'' + insertData.resource_type
          + '\' AND creation_time=\'' + insertData.creation_time + '\'';

  Database.mysql.query(sql, (err, result) => {
    if(err) {
      console.log(err);
      return;
    } 

    if(result.affectedRows === 0) {
      sql = "INSERT dailycount (user, resource_type, resource_count, creation_time) VALUES ("
            + insertData.user + ", '" 
            + insertData.resource_type + "', 1, '" 
            + insertData.creation_time + "' )";

      Database.mysql.query(sql, (err, result) => {
        if(err) {
          console.log(err);
          return;
        } 

        logMessage = 'Resource Daily Counting INSERT Success';
      })
    }
    console.log(logMessage);
  })
}

let rcnParser = (type, data) => {
  let result = {};

  if((type == 1) || !type) {
    result["m2m:cin"] = data["m2m:cin"];
  } else if(type == 2) {
    result["m2m:uri"] = data["m2m:rce"]["uri"];
  } else if(type == 3) {
    result["m2m:cin"] = data["m2m:rce"]["m2m:cin"];
  }
  return result;
}

let saveLatest = (parent, data) => {
  let jsonData = JSON.parse(data);
  let insertData = jsonData['m2m:rce']['m2m:cin'];
  let logMessage = 'UPDATE Latest CIN success';;
  let values = '';
  let updateString = '';
  let insertString = '';
  let sql = '';

  insertData.con = JSON.stringify(insertData.con);
  insertData.sri = jsonData['m2m:rce']['m2m:cin'].ri;
  insertData.ri = '/' + jsonData['m2m:rce'].uri;
  insertData.ae = parent.ae;
  insertData.cnt = parent.cnt.split('/')[1];

  values = Object.values(insertData);

  values.forEach((element, index) => {
    updateString += Object.keys(insertData)[index] + "='" + element + (index == (values.length - 1) ? "'" : "',");
  });

  values.forEach((element, index) => {
    insertString += "'" + element + "'" + (index == (values.length - 1) ? "" : ",");
  })
  
  sql = "UPDATE latestcin SET " + updateString + " WHERE pi='" + insertData.pi + "'";

  let cntsearchsql = "SELECT ri FROM cnt WHERE ri='" + insertData.pi + "'";

  Database.mysql.query(cntsearchsql, (err, result) => {
    if(err) throw err;

    if(!result[0].ri) { 
      console.log('No Container resource id: ', err);
      return;
    };

    Database.mysql.query(sql, (err, result) => {
      if(err) {
        console.log(err);
        return;
      } 
  
      if(result.affectedRows === 0) {
        sql = "INSERT INTO latestcin (" + Object.keys(insertData) + ") VALUES (" + insertString + ")";
  
        Database.mysql.query(sql, (err, result) => {
          if(err) {
            console.log(err);
            return;
          } 
          console.log("result of cin insert: ", result.affectedRows)
          logMessage = 'INSERT Latest CIN success';
        })
      }
      insertData = null;
      console.log(logMessage);
    })
  })
}

let saveResource = (type, data, userid) => {
  let jsonData = {};
  let insertData = {};

  if(typeof data === 'object') {
    jsonData = data;
  } else {
    jsonData = JSON.parse(data);
  }

  insertData = jsonData['m2m:rce']['m2m:'+ type];

  if(type === 'cnt') {
    insertData.path = jsonData['m2m:rce'].uri.replace("Mobius", "");
    insertData.user = userid;
  }

  let values = Object.values(insertData);
  let valueString = '';

  values.forEach((element, index) => {
    valueString += "'" + element + "'" + (index == (values.length - 1) ? "" : ",");
  })

  let sql = "INSERT INTO " + type + " (" + Object.keys(insertData) + ") VALUES (" + valueString + ")";

  Database.mysql.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return;
    };

    if(result.affectedRows === 1) {
      console.log('Success the ' + type + ' creation');
    }
    console.log('send query and return message', result);
  });
}

let getOwner = (ae) => {
  return new Promise((resolve) => {
    let sql  = "SELECT user FROM ae WHERE rn='" + ae + "'";

    Database.mysql.query(sql, (err, result) => {
      if(err) console.log(err);
      
      resolve(result[0].user);
    })
  })
}

let saveTimeseriesData = (aeName, cntName, cinData) => {
  // console.log(`Timeseries> CIN Not matched data format in <${cntName}>.`)
  let fieldsData;
  if(typeof cinData !== 'object') {
    fieldsData = {
      "value": cinData
    }
  } else {
    fieldsData = cinData;
  }

  Database.timeseries.write({
    "measurement": aeName,
    "tags": { cnt: cntName },
    "fields": fieldsData
  });
}

let saveSpatialData = (aeName, cntName, data) => {
  let parent = aeName + "_" + cntName;
  let postgresTime = parsePostgresTimeStamp(data.ct);

  if((data.con.lng || data.con.longitude) && (data.con.lat || data.con.latitude)) {
    Database.spatial.query({
      "parent": parent,
      "id": data.ri,
      "lat": data.con.lat,
      "lng": data.con.lng,
      "createdat": postgresTime
    });
  } else {
    console.log(`SpatialData> CIN Not matched data format in <${cntName}>.`)
    return;
  }
}

function requestMobius(requestInfo, method, returnData, bodyInfo) {
  let options = {
    hostname: Config.mobius.host,
    port: Config.mobius.port,
    path: '/' + Config.mobius.cb,
    method: method,
    headers: {}
  }

  let httpHeaders = Object.keys(requestInfo.headers);
  let urlParams = Object.keys(requestInfo.query);
  let httpRequestParam = "";  

  console.log('--resource name keys----', requestInfo.url);


  // make mobius request header
  httpHeaders.forEach(header => {
    if(header === 'accept' || header === 'x-m2m-ri' || header === 'x-m2m-origin' || header=== 'content-type') {
      options.headers[header] = requestInfo.headers[header];
    }
  })

  // make mobius request path
  urlParams.forEach((key, index) => {
    if (index === (urlParams.length-1)) {
      httpRequestParam += key + "=" + requestInfo.query[key];
    } else {
      httpRequestParam += "&" + key + "=" + requestInfo.query[key];
    }
  })

  options.path += requestInfo.url + (httpRequestParam? "?"+httpRequestParam: "");

  // execute mobius request
  let request = http.request(options, (response) => {
    let data = '';
    
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      returnData(response.statusCode, data);
    })
  })
  
  if(bodyInfo) {
    request.write(JSON.stringify(bodyInfo));
  }
  request.end();
}


/**
 * Create Content Instance
 * @function
 * @param {string} parameter - api parameter.
 * @param {callback} execution - api execution callback function.
 */

 router.post('/*/*', (req, res) => {
  if(!req.body['m2m:sub'] && !req.body['m2m:cin']) {
    console.log("request body: ", req);
    console.log("No Resource Info");
    res.status(400).json({
      "m2m:dbg": "body is empty"
    });
    return;
  }

  if(req.body['m2m:sub']) {
    requestMobius(req, POST, (statusCode, data)=>{
      res.status(statusCode).json(JSON.parse(data));
      responseTime.store(res.getHeader("X-Response-Time"), POST);
    }, req.body);
  } else {
    let names = req.path.split('/');
    let aeName = req.params[0];
    let cntName = req.params[1];
    let options = JSON.parse(JSON.stringify(globalOptions));
    let httpHeaders = Object.keys(req.headers);

    let parentResource = {
      ae: aeName,
      cnt: cntName
    };

    if(names.length > 3) {
      cntName = "";
      names.forEach((value, index) => {
        if(index === 1) {
          aeName = value;
        } else if(index > 1) {
          cntName += "/" + value;
        }
      })
    }

    
    // let headerChecker = /^[application\/json]*[ty=4]$/;
    // if(req.headers['Content-Type'] !== headerChecker) {
    //   console.log('not match header');
    // }
    options.method = POST;

    httpHeaders.forEach(header => {
      if(header === 'accept' || header === 'x-m2m-ri' || header === 'x-m2m-origin' || header=== 'content-type') {
        options.headers[header] = req.headers[header];
      }
    })
    
    options.path = "/" + Config.mobius.cb + "/" + aeName + "/" + cntName + "?rcn=3";

    console.log('cin creation options', options)
    
    const request = http.request(options, (response) => {
      let data = '';

      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        let mobiusReturn = JSON.parse(data);
        let returningData = {};

        console.log('----creation return: ', mobiusReturn);

        if (response.statusCode === 201) {
          console.log('parent ID', mobiusReturn['m2m:rce']['m2m:cin'].pi);
          // Test some duration
          let cntsearchsql = "SELECT * FROM cnt WHERE ri='" + mobiusReturn['m2m:rce']['m2m:cin'].pi + "'";

          let emitData = JSON.parse(data)['m2m:rce']['m2m:cin'];
          emitData.ae = parentResource.ae;
          emitData.cnt = parentResource.cnt;
          emitData.responseTime = new Date();

          returningData = rcnParser(req.query.rcn, mobiusReturn);
          saveCount('cin', mobiusReturn);
          saveLatest(parentResource, data);

          Database.mysql.query(cntsearchsql, (err, result) => { 
            if(err) { console.log(err); }
            if(!result[0].ri) { console.log(err); }
        
            if(result[0].timeseries == 'true') {
              console.log('------ save timeseries data');
              saveTimeseriesData(aeName, cntName, req.body["m2m:cin"].con);
            }

            if(result[0].spatialData == 'true') { 
              console.log('------ save spatial data');
              saveSpatialData(aeName, cntName, mobiusReturn['m2m:rce']['m2m:cin']);
            }
          });
          // saveTimeseriesData(aeName, cntName, mobiusReturn['m2m:rce']['m2m:cin'], req.body["m2m:cin"].con);
          // saveSpatialData(aeName, cntName, mobiusReturn['m2m:rce']['m2m:cin']);

          getOwner(emitData.ae).then((userId)=> {
            req.io.to(userId).to(Config.server.admin.id).emit('cin', emitData);
          }).catch((err) => {
            console.log(err);
          })
        } else {
          returningData = mobiusReturn;
        }

        res.status(response.statusCode).json(returningData);
        responseTime.store(res.getHeader("X-Response-Time"), POST);
      })
    })

    request.write(JSON.stringify(req.body));
    request.end();
  }
 });
// router.post('/*/*', (req, res) => {
//   let aeName = req.params[0];
//   let cntName = req.params[1];
//   let options = JSON.parse(JSON.stringify(globalOptions));

//   let parentResource = {
//     ae: aeName,
//     cnt: cntName
//   };

//   console.log('resource length: ', req.params);
//   // if(names.length > 3) {
//   //   cntName = "";
//   //   names.forEach((value, index) => {
//   //     if(index === 1) {
//   //       aeName = value;
//   //     } else if(index > 1) {
//   //       cntName += "/" + value;
//   //     }
//   //   })
//   // }

//   if(!req.body['m2m:sub'] && !req.body['m2m:cin']) {
//     console.log("request body: ", req);
//     console.log("No Resource Info");
//     res.status(400).json({
//       "m2m:dbg": "body is empty"
//     });
//     return;
//   }
//   // let headerChecker = /^[application\/json]*[ty=4]$/;
//   // if(req.headers['Content-Type'] !== headerChecker) {
//   //   console.log('not match header');
//   // }

//   options.headers['Accept'] = req.headers['accept'];
//   options.headers['X-M2M-RI'] = req.headers['x-m2m-ri'];
//   options.headers['X-M2M-Origin'] = req.headers['x-m2m-origin'];
//   options.headers['Content-Type'] = req.headers['content-type'];
  
//   options.path = "/" + Config.mobius.cb + "/" + aeName + cntName + "?rcn=3";

//   const request = http.request(options, (response) => {
//     let data = '';

//     response.setEncoding('utf8');
//     response.on('data', (chunk) => {
//       data += chunk;
//     }).on('end', () => {
//       let mobiusReturn = JSON.parse(data);
//       let returningData = {};

//       if (response.statusCode === 201) {
//         // Test some duration
//         let cntsearchsql = "SELECT * FROM cnt WHERE ri='" + mobiusReturn['m2m:rce']['m2m:cin'].pi + "'";
//         let containerName = cntName;

//         let emitData = JSON.parse(data)['m2m:rce']['m2m:cin'];
//         emitData.ae = parentResource.ae;
//         emitData.cnt = parentResource.cnt;
//         emitData.responseTime = new Date();

//         returningData = rcnParser(req.query.rcn, mobiusReturn);
//         saveCount('cin', mobiusReturn);
//         saveLatest(parentResource, data);

//         Database.mysql.query(cntsearchsql, (err, result) => { 
//           if(err) { console.log(err); }
//           if(!result[0].ri) { console.log(err); }
      
//           if(result[0].timeseries == 'true') {
//             saveTimeseriesData(aeName, containerName, req.body["m2m:cin"].con);
//           }

//           console.log(typeof result[0].spatialData);
//           if(result[0].spatialData == 'true') { 
//             console.log('------ save spatial data');
//             saveSpatialData(aeName, containerName, mobiusReturn['m2m:rce']['m2m:cin']);
//           }
//         });
//         // saveTimeseriesData(aeName, cntName, mobiusReturn['m2m:rce']['m2m:cin'], req.body["m2m:cin"].con);
//         // saveSpatialData(aeName, cntName, mobiusReturn['m2m:rce']['m2m:cin']);

//         getOwner(emitData.ae).then((userId)=> {
//           req.io.to(userId).to(Config.server.admin.id).emit('cin', emitData);
//         }).catch((err) => {
//           console.log(err);
//         })
//       } else {
//         returningData = mobiusReturn;
//       }

//       res.status(response.statusCode).json(returningData);
//       responseTime.store(res.getHeader("X-Response-Time"), POST);
//     })
//   })

//   request.write(JSON.stringify(req.body));
//   request.end();
// })


/**
 * Create Container
 * @function
 * @param {string} parameter - api parameter.
 * @param {callback} execution - api execution callback function.
 */
router.post('/*', (req, res) => {
  let aeName = req.params[0];
  let options = JSON.parse(JSON.stringify(globalOptions));
  
  if(!req.body['m2m:cnt']) { 
    console.log('no cnt Set');
    return; 
  };

  options.headers['Accept'] = req.headers['accept'];
  options.headers['X-M2M-RI'] = req.headers['x-m2m-ri'];
  options.headers['X-M2M-Origin'] = req.headers['x-m2m-origin'];
  options.headers['Content-Type'] = req.headers['content-type'];

  options.path = "/" + Config.mobius.cb + "/" + aeName + "?rcn=3";
  
  const request = http.request(options, (response) => {
    let data = '';

    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      let mobiusReturn = JSON.parse(data);
      let returningData = '';

      if (response.statusCode === 201) {
        returningData = rcnParser(req.query.rcn, mobiusReturn);
        saveCount('cnt', mobiusReturn);

        let emitData = JSON.parse(data)['m2m:rce']['m2m:cnt'];
        emitData.ae = aeName;

        getOwner(emitData.ae).then((userId)=> {
          saveResource('cnt', mobiusReturn, userId);
          req.io.to(userId).to(Config.server.admin.id).emit('cnt', emitData);
        }).catch((err) => {
          console.log(err);
        })
      } else {
        returningData = mobiusReturn;
      }

      res.status(response.statusCode).json(returningData);
      responseTime.store(res.getHeader("X-Response-Time"), POST);
    })
  })

  request.write(JSON.stringify(req.body));
  request.end();
});

/**
 * Create Container
 * @function
 * @param {string} parameter - AE name/CNT name.
 * @param {callback} execution - api execution callback function.
 */
// router.get('/*/*', (req, res) => {
//   let cntName = req.params[1];

//   if(!cntName) {
//     console.log("empty cnt name");
//     res.status(404).json({
//       "m2m:dbg": "resource does not exist"
//     })
//     return;
//   }

//   requestMobius(req, GET, (statusCode, data)=>{
//     res.status(statusCode).json(JSON.parse(data));
//     responseTime.store(res.getHeader("X-Response-Time"), GET);
//   });
// })


/**
 * Retrieve Mobius Resource
 * @function
 * @param {string} parameter - Resource Parameter Path
 * @param {callback} execution - api execution callback function.
 */
router.get('/*', (req, res) => {
  requestMobius(req, GET, (statusCode, data)=>{
    res.status(statusCode).json(JSON.parse(data));
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  });
})

/**
 * PUT Mobius Subscription
 * @function
 * @param {string} parameter - Resource Parameter Path
 * @param {callback} execution - api execution callback function.
 */
router.put('/*/*/*', (req, res)=> {  
  requestMobius(req, PUT, (statusCode, data)=>{
    res.status(statusCode).json(JSON.parse(data));
    responseTime.store(res.getHeader("X-Response-Time"), PUT);
  }, req.body);
})

/**
 * DELETE Mobius Latest ContentInstance
 * @function
 * @param {string} parameter - Resource Parameter Path
 * @param {callback} execution - api execution callback function.
 */
router.delete('/*/*/latest', (req, res)=> {
  res.status(404).json({
    "m2m:dbg": "resource does not exist"
  });
})

/**
 * DELETE Mobius Subscription
 * @function
 * @param {string} parameter - Resource Parameter Path
 * @param {callback} execution - api execution callback function.
 */
router.delete('/*/*/*', (req, res)=> {  
  requestMobius(req, DELETE, (statusCode, data)=>{
    res.status(statusCode).json(JSON.parse(data));
    responseTime.store(res.getHeader("X-Response-Time"), DELETE);
  });
})

module.exports = router;