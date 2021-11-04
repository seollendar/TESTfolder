const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const Database = require('../src/database');
const responseTime = require('../src/response-time');
const Auth = require('../util/auth');

const GET = 'get';
const POST = 'post';
const PUT = 'put';
const DELETE = 'delete';

function bcryptPassword(password) {
  const salt = bcrypt.genSaltSync();
  const hashedPassword = bcrypt.hashSync(password, salt);

  return hashedPassword;
}

router.post('/signup', (req, res) => {
  Database.mysql.query("SELECT * FROM user WHERE email=?", req.body.email, (err, result) => {
    if (err) throw err;
    
    if(result[0]) {
      res.status(500).send('There is the same email address');
    } else {
      Database.mysql.query("INSERT INTO user (email, name, department, password) VALUES (?, ?, ? ,?)", [req.body.email, req.body.name, req.body.department, bcryptPassword(req.body.password)], (err, result) => {
        if(err) throw err;

        res.status(200).send("success Signup");
        responseTime.store(res.getHeader("X-Response-Time"), POST);
      });
    }
  });
});

router.put('/signup', (req, res) => {
  let query = "UPDATE user SET name = ?, department = ? WHERE email = ?";
  let factors = [req.body.name, req.body.department, req.body.email];

  if(req.body.new_password) {
    query = "UPDATE user SET name = ?, department = ?, password=? WHERE email = ?"
    factors = [req.body.name, req.body.department, bcryptPassword(req.body.new_password), req.body.email]
  }

  Database.mysql.query("SELECT * FROM user WHERE email=?", req.body.email, (err, result) => {
    if (err) throw err;
    
    if(!result[0]) {
      res.status(503).send('There is no account.');
    } 
    else if(!bcrypt.compareSync(req.body.password, result[0].password)) {
      res.status(503).send('Wrong Password.');
    } else {
      Database.mysql.query(query, factors, (err, result) => {
        if(err) throw err;

        res.status(200).json('Succes Update');
        responseTime.store(res.getHeader("X-Response-Time"), PUT);
      });
    }

  });
});

router.get('/list', (req, res) => {
  let query = "SELECT email, name, department FROM user";

  Database.mysql.query(query, (err, result) => {
    if(err) { console.log('Database error')};

    res.json(result);
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  })
})

router.get('/', (req, res) => {
  Database.mysql.query("SELECT * FROM user WHERE email=?", req.query.email, (err, result) => {
    if(err) { console.log('Database error')};

    let account = {};

    account.email = result[0].email;
    account.name = result[0].name;
    account.department = result[0].department;

    res.json(account);
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  });
})

router.post('/login', (req, res) => {
  let account = {
    email: '',
    name: '',
    department: '',
    token: ''
  }

  console.log('login api call');

  Database.mysql.query("SELECT * FROM user WHERE email=?", req.body.email, (err, result) => {
    console.log("error check log: ", err);
    if(err) { console.log('Database error')};

    if(!result[0]) {
      res.status(503).send('There is no account.');
    } else if(!bcrypt.compareSync(req.body.password, result[0].password)) {
      res.status(503).send('There is no account.');
    } else {
      jwt.sign({
        email: result[0].email,
        password: result[0].password
      },
      'badacafe00',
      { algorithm: 'HS256'}, 
      (err, token) => {
        if(err) throw err;

        account.token = token;
        account.email = result[0].email;
        account.name = result[0].name;
        account.department = result[0].department;

        // req.io.on('connection', (socket) => {
        //   let userId = Auth.getUserId(socket.handshake.query.token);
  
        //   socket.join(userId);
        // })
        res.json(account);
        responseTime.store(res.getHeader("X-Response-Time"), POST);
      });
    }
  })
})

router.get('/count', (req, res) => {
  let loginStatus = Auth.isLoggedIn(req.headers['x-access-token']);
  let sql = 'SELECT COUNT(*) AS user FROM user';

  if(!loginStatus.admin) {
    res.status(401).send("Unauthorized")
  }

  Database.mysql.query(sql, (err, result) => {
    if(err) { console.log('Database error')};

    if(!result[0]) { res.status(404).send("Not Found")};
    
    res.send(result[0]);
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  })
})


router.get('/count', (req, res) => {
  let loginStatus = Auth.isLoggedIn(req.headers['x-access-token']);
  let sql = 'SELECT COUNT(*) AS user FROM user';

  if(!loginStatus.admin) {
    res.status(401).send("Unauthorized")
  }

  Database.mysql.query(sql, (err, result) => {
    if(err) { console.log('Database error')};

    if(!result[0]) { res.status(404).send("Not Found")};
    
    res.send(result[0]);
    responseTime.store(res.getHeader("X-Response-Time"), GET);
  })
})

module.exports = router;