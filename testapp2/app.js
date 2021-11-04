const express = require('express')
const app = express()
const port = 3000


//express 를 app으로 받았기 때문에 app.listen으로 불러야 한다.
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))



app.get("/", (req, res)=>{
 res.status(200).send('ok');
})



app.post("/end", (req, res)=>{

  var fullBody = '';
 
 req.on('data', function(chunk) {
    fullBody += chunk; 
    console.log("-on-");
  });

  req.on('end', function() {
   req.body = fullBody;
   
   console.log (req.header);  
   console.log (req.body); 
   res.status(200).send('post /end test ok');

  });
})


app.post("/no_end", (req, res)=>{

   console.log (req.header);  
   console.log (req.body);  
   res.status(200).send('post /no_end test ok');
 
})