
const express = require('express')
const app = express()
const moment = require('moment');

/*
app.listen(3000, ()=> {
  console.log("Server Start on port 3000");
})
*/

const port = 8000
app.listen(port, () => console.log(`app listening at http://localhost:${port}`))


const Influx = require('influx');

const influx = new Influx.InfluxDB('http://admin:password@203.254.173.175:8086/ssultest')


influx.getDatabaseNames().then(names => {
    console.log(names);
}).catch(error => console.log({
   error
}));


app.get("/", (req, res)=>{
  res.status(200).send('ok');
 })