const os = require('os');

module.exports = {
   server: {
     HOST: os.hostname(),
     PORT: 7979
   },
   influx: {
      "host": "10.252.73.5",
      "port": 8086,
      "admin": "admin",
      "password": "password",
      "database": "SmartPortData",
      "precision": "rc3339"
    },
    postgres:{
      host: "10.252.73.5",
      port: 5432,
      user: "postgres",
      password: "keti123",
      database: "spatiodata",
    }
 }