var fullBody = `{
  "m2m:sgn": {
    "nev": {
      "rep": {
        "m2m:cin": {
          "cnf": "application/json",
          "con": {
            "ae": "yt0",
            "container": "location",
            "wtime": 159649076010,
            "lat": 31.859642,
            "lng": 128.561136
          }
        }
      }
    }
  }
}`

console.log("fullBody: ", fullBody);
console.log("type: ",typeof(fullBody));
console.log("json: ", fullBody['m2m:sgn'].nev.rep['m2m:cin'].con);
var jsonbody = JSON.parse(fullBody);
let cinContents = jsonbody['m2m:sgn'].nev.rep['m2m:cin'].con;