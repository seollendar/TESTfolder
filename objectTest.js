var prevData = {};
var ae = 'ssul';
var container = 'scnt-location';
var cinContents = {
    latitude: 37.1046016,
    longitude: 129.0953344,
    altitude: 12.934,
    velocity: 0,
    direction: 0,
    time: '2021-07-26T07:24:34.200',
    position_fix: 1,
    satelites: 0,
    state: 'ON'
};
//cinContents = JSON.parse(fullBody);
console.log(cinContents);
// prevData[ae + "/" + container] = { ...cinContents };
// console.log("print: "+prevData[ae + "/" + container]);
prevData[ae + "/" + container] = { ...cinContents };
var prevObject = prevData[ae + "/" + container];
console.log(prevObject);