/* test = {"key1":"value1", "key2":"value2", "key3":"value3"};

console.log("type: ", typeof(test));
console.log("length: ", Object.keys(test).length);
console.log("length key: ", Object.getOwnPropertyNames(test).length);
console.log("key: ", Object.getOwnPropertyNames(test));
 */
var cinContents = { 'NAME':'홍길동', 'SEX':'남', 'AGE':'99세'};

// var data = {};
// for(key in json) {
	// data[key] = json[key];
// }
// console.log("data: ", data); //data:  { NAME: '홍길동', SEX: '남', AGE: '99세' }


// var key = [];
// var value = [];
// for(key in cinContents) {
	// key.push = key; 
	// value.push = cinContents[key];
// }

// console.log("key: ", Object.keys(cinContents));
// console.log("value: ", Object.values(cinContents));
// var keysOfData = Object.keys(cinContents);
// var valuesOfData =  Object.values(cinContents);
// console.log(keysOfData[0]);
var tag = 'latitude'; 

var result = {
  cnt: 'scnt-location',
  computeDistance: 0,
  computevelocity: 0,
  direction: 0,
  latitude: 35.1102944,
  longitude: 129.0941056,
  velocity: 0
};

console.log(result[tag]);