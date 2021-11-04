const getBodyFromKafka = {
   "ae": "ytt123",
   "container": "location",
   "wtime": 1596476600070,
   "lat": 40.459652,
   "lng": 127.561135,
   "alt": 277.3,
   "list": [1, 4, 7]
}

getBodyFromKafka.list.forEach(index => {
   switch(index){
      case 1:
         console.log(`processing 1`);
         break;
      case 2:
         console.log(`processing 2`);
         break;
      case 3:
         console.log(`processing 3`);
         break;
      case 4:
         console.log(`processing 4`);
         break;
      case 7:
         console.log(`processing 7`);
         break;
      default:
         break;
   }
});

