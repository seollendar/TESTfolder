/*
function len(){
	var collectfirstpoint = [37.395162, 127.111135];
	var wrongpoint = 0;
	
	console.log(collectfirstpoint.length)
	console.log(wrongpoint.length)
}

len();
*/
function len(){
   var collectFirstPoint = '[37.395162,]';
   var wrongFirstPoint = 0;
   console.log(collectFirstPoint.length);
   console.log(wrongFirstPoint.length);
   
   try{
      console.log(JSON.parse(collectFirstPoint));
   } catch (e) {
      console.log('Bad request');
      return;
   }
   

}

len();



//원치 않는 값 걸러내기
function NumberCheck(str) {
   var pattern1 = /[0-9]/; // 숫자
   var pattern2 = /[a-zA-Z]/; // 문자
   var pattern3 = /[~!@#$%^&*()_+|<>?:{}]/; // 특수문자
   if(pattern2.test(str)) { 
      res.status(400).send("Bad Request");
    return; 
}

NumberCheck(firstpoint[0]);
NumberCheck(secondpoint[0]);
NumberCheck(firstpoint[1]);
NumberCheck(secondpoint[1]);






//indexOf
var text = "456789";
var findStr = "123"; // 123이 있는지 찾아보기

if (text.indexOf(findStr) != -1) {
  alert("Find!");
}
else {
  alert("Not Found!!");
}


//중간에 문자가 있으니까 json자체가 아니게 됨! 굳이 문자가 있냐 없냐 안따져도 됨.