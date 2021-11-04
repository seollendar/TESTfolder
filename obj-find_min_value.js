//console.log(obj);

// var sht = { a: 4, b: 0.5, c: 0.35, d: 5 };
// var arr = Object.keys(obj).map(function (key) {
//    console.log(key, "?: ", obj[key]);
//    return obj[key];
// });
// var min = Math.min.apply(null, arr);
// console.log(min);

// function findMinMax(arr) {
//    let min = arr[0].y,
//       max = arr[0].y;

//    for (let i = 1, len = arr.length; i < len; i++) {
//       let v = arr[i].y;
//       min = v < min ? v : min;
//       max = v > max ? v : max;
//    }

//    return [min, max];
// }

// function findMinMax(obj) {
//    let min = obj[0],
//       max = obj[0];

//    for (let i = 1, len = Object.keys(obj).length; i < len; i++) {
//       let v = obj[i];
//       min = v < min ? v : min;
//       min_key = i;
//       //max = v > max ? v : max;
//    }

//    return [min, min_key];
// }
// console.log(findMinMax(obj));

var part = { 0: 4, 1: 5, 2: 11, 3: 12, 4: 13 };

function get_min(part) {
   var keys = Object.keys(part);
   var min = part[keys[0]];
   var i, min_key;

   for (i = 1; i < keys.length; i++) {
      var value = part[keys[i]];
      if (value < min) {
         min = value;
         min_key = i;
      }
   }

   if (min_key == undefined) {
      for (var i = 0; i < keys.length; i++) {
         if (part[keys[i]] == min) {
            min_key = i;
         }
      }
   }

   return min_key;
}

//var min_arr = get_min(part);
//console.log(get_min(part));
let ae = "7";
let partN = 7;
if (part[ae]) {
   partitionNum = part[ae];
   console.log(part[ae]);
   console.log(partitionNum);
} else {
   //console.log("not exist");
   part[ae] = partN;
   console.log(part);
}

// function get_undefind_key() {
//    if (min_key == undefined) {
//       for (var i = 0; i < keys.length; i++) {
//          if (part[keys[i]] == min) {
//             min_key = part[keys];
//             console.log("not undefind", min_key);
//          }
//       }
//    }
// }
