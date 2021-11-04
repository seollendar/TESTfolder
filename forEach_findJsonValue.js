// var array = [
//    { text: "abcd", number: 1234 },
//    { text: "efg", number: 5678 },
// ];

// array.forEach(function (data, idx) {
//    console.log(data);
// });

//var arr = [{ text: "abcd"}, {number: 1234}, {desc: "efg"}]
// var json = { text: "abcd", number: 1234, desc: "efg" };
// Object.keys(json).forEach(function (k) {
//    console.log("키값 : " + k + ", 데이터값 : " + json[k]);
// });

var array = [{ text: "abcd" }, { text: "efg" }];

for (idx in array) {
   //console.log(array[idx]);
   for (key in array[idx]) {
      // console.log("key:" + key + "/" + "value:" + array[idx][key]);
      console.log(array[idx][key]);
   }
}
// for(key in json){
//    alert('key:' + key + '/' + 'value:' + json[key]);
//    }
