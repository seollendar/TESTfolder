window.onload = function () {
   initMap();
};

var map = "";
/**
 * Map 초기화
 * @param o : 초기화 시 필요한 파라미터
 *
 */
var zoomListenerCnt = 0;
function initMap(o) {
   map = new google.maps.Map(document.getElementById("map_div"), {
      zoom: 18, //처음 로드시 줌
      maxZoom: 19, //최대 줌
      minZoom: 6, //최소 줌
      center: { lat: 37.5619873, lng: 126.9730337 }, //위치 기본값 지정
      //disableDefaultUI: true,
      streetViewControl: false,
      zoomControl: true,
      zoomControlOptions: {
         position: google.maps.ControlPosition.RIGHT_TOP,
      },
      mapTypeControl: true,
      mapTypeControlOptions: {
         style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
         mapTypeIds: [
            google.maps.MapTypeId.ROADMAP,
            google.maps.MapTypeId.TERRAIN,
         ],
      },
   });
}
