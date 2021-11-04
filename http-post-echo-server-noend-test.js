const express = require('express')
const app = express()
const port = 6789



app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))



app.get("/", (req, res)=>{
 res.status(200).send('ok');
})



app.post("/post", (req, res)=>{

  var fullBody = '';
 
  req.on('data', function(chunk) {
    fullBody += chunk; 
  });

  req.on('end', function() {
  //  req.body = fullBody;
  //  console.log (req.header);  
  //  console.log (req.body); 
   res.status(200).send('post /end test ok');

  });

})


app.post("/no_end", (req, res)=>{

   console.log (req.header);  
   console.log (req.body);  
   res.status(200).send('post /no_end test ok');
 
})