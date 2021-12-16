var json = {
   id: "test",
};

var keys = Object.keys(json); //키를 가져옵니다. 이때, keys 는 반복가능한 객체가 됩니다.
console.log(keys[0], json[keys[0]]);
// for (var i = 0; i < keys.length; i++) {
//    var key = keys[i];
//    console.log("key : " + key + ", value : " + json[key]);
// }
