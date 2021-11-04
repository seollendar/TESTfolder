// const fullBody = {
                    // "m2m:sgn": {
                     // "nev": {
                       // "rep": {
                        // "m2m:cin": {
                          // "ty": 4,
                          // "ri": "cin00S02f9ecfd6-35ef-451e-8672-09ab3ec09a141603350091457",
                          // "rn": "cin-S02f9ecfd6-35ef-451e-8672-09ab3ec09a141603350091457",
                          // "pi": "cnt00000000000001951",
                          // "ct": "20201022T160131",
                          // "lt": "20201022T160131",
                          // "et": "20201121T160131",
                          // "st": 903335,
                          // "cr": "SS01228427453",
                          // "cnf": "application/json",
                          // "cs": 155,
                          // "con": {
						   // "latitude": 37.411360,
                           // "longitude": 127.129459,
                           // "altitude": 12.934,
                           // "velocity": 100,
                           // "direction": 200,
                           // "position_fix": 1,
                           // "satelites": 0,
                           // "state": "ON"
                          // }
                        // }
                       // },
                       // "om": {
                        // "op": 1,
                        // "org": "SS01228427453"
                       // }
                     // },
                     // "vrq": false,
                     // "sud": false,
                     // "sur": `/~/CB00061/smartharbor/S01228423177/scnt-location/sub-S01228427453_user`,
					 // "cr": "SS01228427453"
                    // }
                  // };
				  
// let resources = fullBody['m2m:sgn'].sur.split('/');
// let ae = resources[4];
// console.log("ae: ", typeof(ae)); //S01228423177


let key = "S01228423177";
const partitionSet = 3;
hash = (key) => {
	let hash = 0;
	for(let i = 0; i < key.length; i++){
		console.log(key.charCodeAt(i));
		hash += key.charCodeAt(i);
	}
	console.log(hash);
	console.log(hash % 3);
}

//hash(key);
console.log(key.charCodeAt(key.length-1)%partitionSet);