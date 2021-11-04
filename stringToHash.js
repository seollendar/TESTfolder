const crypto = require("crypto");

/*
String.prototype.hashCode = function(){
    if (Array.prototype.reduce){
        return this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    }
    var hash = 0;
    if (this.length === 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var character  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

String.prototype.hashcode = function() {
    return (this.hashCode() + 2147483647) + 1;
};

var hash = "some string to be hashed".hashcode();
console.log(hash);
*/

var deviceName = "S0354561";
String.prototype.hashCode = function () {
   var hash = 0,
      i = 0,
      len = this.length;
   while (i < len) {
      hash = ((hash << 5) - hash + this.charCodeAt(i++)) << 0;
   }
   return hash + 2147483647 + 1;
};
console.log(deviceName.hashCode() % 5);

const salt = crypto.randomBytes(128).toString("base64"); //SHA-512 hash
const hashDevice = crypto
   .createHash("sha512")
   .update(deviceName + salt)
   .digest("hex");

let yourNumber = parseInt(hashDevice, 16) % 5;
console.log("hashing: ", yourNumber);

function getHashCode(DeviceName, partitionSet) {
   const secret = "partitionHash";
   const hashed = crypto
      .createHmac("sha256", secret)
      .update(DeviceName)
      .digest("hex");

   let partitionNumber = parseInt(hashed, 16) % partitionSet;
   return partitionNumber;
}
