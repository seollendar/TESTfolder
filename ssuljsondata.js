function ssulJsonData(){
   var mem = {
     "1": {
      "1596471030000": {
        "serialNo": 1,
        "phoneNo": "KR01223468724",
        "wtime": 1596471030000,
        "lat": 33.459646,
        "lng": 126.561136,
        "alt": 277.3,
        "temperature": 23,
        "hdop": 0.7,
        "speed": 0,
        "azimuth": 81,
        "evSpeed": 0,
        "evOdo": 40829,
        "evTemp": 21,
        "evSoc": 62,
        "evEst": 64
      }
     },
	  "2": {
      "1596471030000": {
        "serialNo": 1,
        "phoneNo": "KR01223468724",
        "wtime": 1596471030000,
        "lat": 33.459646,
        "lng": 126.561136,
        "alt": 277.3,
        "temperature": 23,
        "hdop": 0.7,
        "speed": 0,
        "azimuth": 81,
        "evSpeed": 0,
        "evOdo": 40829,
        "evTemp": 21,
        "evSoc": 62,
        "evEst": 64
      }
     }
   };
   
   var noti = {
     "serialNo": 3,
     "phoneNo": "KR01223468724",
     "wtime": 1596471050000,
     "lat": 33.459646,
     "lng": 126.561136,
     "alt": 277.3,
     "temperature": 23,
     "hdop": 0.7,
     "speed": 0,
     "azimuth": 81,
     "evSpeed": 0,
     "evOdo": 40829,
     "evTemp": 21,
     "evSoc": 62,
     "evEst": 64
   };   
   /* key-value 페어 삭제 시 사이즈 감소 확인 -> 메모리 관리
      // 306
      console.log(sizeof(noti));
      delete noti['wtime'];
      // 288
      console.log(sizeof(noti));
   */
   
   // noti로 들어온 데이터를 deviceID(serialNo)를 기준으로 나누고, 데이터의 시간(wtime)으로 세분화.
   // var mem = {};
   
   // 해당 deviceID가 없을 경우
   if(mem[noti.serialNo] === undefined){
      mem[noti.serialNo] = {};
      mem[noti.serialNo][noti.wtime] = {...noti};
	  console.log(mem[noti.serialNo][noti.wtime].wtime);
   }
   // 있을 경우
   else {
      mem[noti.serialNo][noti.wtime] = {...noti};
   }
   //console.log(mem);
   //console.log(mem['1'][]);
   
   // 지금으로부터 10분 이전에 쌓인 데이터를 지움
   // deletePastData(mem);
   // console.log(mem);
   
   
   
   // 지금으로부터 10분 이전에 쌓인 데이터를 지움
   function deletePastData(obj){
      // 우리나라 utc 시간은 9시이므로 거기서 -10분
      var tenMinutesAgo = moment().utcOffset('+09:00').subtract(10, 'minutes').format('x');
      
      for(var index in obj){
         for(var time in obj[index]){
            if(time < tenMinutesAgo){
               delete obj[index][time];
            }
         }
      }
   }
}
ssulJsonData();