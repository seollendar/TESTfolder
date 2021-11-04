const moment = require('moment');
// const sizeof = require('object-sizeof');

// 긁어다가 <https://jsoneditoronline.org/> 에서 볼 것!
moveHistory = {"yt1":{"1596473300000":{"ae":"yt1","container":"location","wtime":1596473300000,"lat":35.459644,"lng":127.561136},"1596473300001":{"ae":"yt1","container":"location","wtime":1596473300001,"lat":35.459644,"lng":127.561136},"1596473300002":{"ae":"yt1","container":"location","wtime":1596473300002,"lat":35.459644,"lng":127.561136},"1596473300003":{"ae":"yt1","container":"location","wtime":1596473300003,"lat":35.459644,"lng":127.561136},"1596473300004":{"ae":"yt1","container":"location","wtime":1596473300004,"lat":35.459644,"lng":127.561136}},"yt2":{"1596473300000":{"ae":"yt2","container":"location","wtime":1596473300000,"lat":35.459644,"lng":127.561136},"1596473300001":{"ae":"yt2","container":"location","wtime":1596473300001,"lat":36.459644,"lng":128.561136},"1596473300002":{"ae":"yt2","container":"location","wtime":1596473300002,"lat":37.459644,"lng":129.561136}}};

// sizeof()는 대상의 크기를 Byte 단위로 반환한다.
// console.log(sizeof(moveHistory));

call();

async function call(){
   var result = await detectDevicesMove(moveHistory);
   
   // object 형태로 보기좋게 출력되나 전체가 보이지 않음
   console.log(result);
   // json object를 string으로 변환해서 전체를 보여줌.
   // string으로 출력하기 때문에 보기 쉽지 않음. 긁어다가 <https://jsoneditoronline.org/> 에서 볼 것!
   console.log('%j', result);
}

// moveHistory에 담긴 디바이스 별로 저장된 움직인 좌표 목록을 갖고 움직임의 유무를 판단함
function detectDevicesMove(moveHistory){
   // moveHistory에서 deviceID를 array로 추출함 -> 병렬 처리를 위해
   var devices = Object.keys(moveHistory);
   
   // 모든 디바이스의 움직임의 유무 확인을 병렬로 처리
   // 병렬 처리 방법
   //       1. deviceID 리스트에서 deviceID를 하나씩 꺼내어 detectMove 함수를 실행
   //       2. 모든 디바이스의 움직임 판단이 끝났을 때, 결과를 array에 담아서 반환
   return Promise.all(devices.map(device => {
      return detectMove(device, moveHistory[device]);
   }));
   
   // 디바이스 별로 움직임의 유무 확인
   function detectMove(deviceID, data){
      var obj = {'moved':[], 'not moved': []};
      
      // 특정 디바이스의 이동 좌표를 배열화
      var deviceMoveHistory = [];
      for(var index in data){
         deviceMoveHistory.push({x: data[index].lat, y: data[index].lng, wtime: data[index].wtime});
      }
      
      // 배열에 담긴 좌표를 0과 1, 1과 2를 비교하는 방식으로 움직임의 유무를 판단
      for(var index=1, max=deviceMoveHistory.length; index<max; index++){
         var moveDistance = distance(deviceMoveHistory[index-1].x, deviceMoveHistory[index-1].y,
                              deviceMoveHistory[index].x, deviceMoveHistory[index].y);
         // moved
         if (moveDistance > 5){
            obj['moved'].push(`[${deviceMoveHistory[index-1].wtime} -> ${deviceMoveHistory[index].wtime}] moveDistance = ${moveDistance}m`);
         }
         // not moved
         else {
            obj['not moved'].push(`[${deviceMoveHistory[index-1].wtime} -> ${deviceMoveHistory[index].wtime}] moveDistance = ${moveDistance}m`);
         }
      }
      return {[deviceID]: obj};
   }
}

function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;

    return (12742 * Math.asin(Math.sqrt(a)) * 1000);
}