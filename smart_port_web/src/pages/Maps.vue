<template>
    <card class="card-map">
      <div class="map">
        <div id="map"></div>
      </div>
    </card>
</template>
<script>
let map = null;
export default {
  data(){
    return{
      center: { lat: 37.407, lng: 127.116 }
    }
  },
  mounted() {
    var myLatlng =  new naver.maps.LatLng(this.center);
    var mapOptions = {
      zoom: 14,
      center: myLatlng,
      scrollWheel: false, // we disable de scroll over the map, it is a really annoing when you scroll through page
      zoomControl: true,
    };
    map = new naver.maps.Map(
      document.getElementById("map"),
      mapOptions
    );
  },
  methods:{
    polylineMap: function(gpsPoints){
      console.log(gpsPoints);
      let polylinePath = []
      const flightPlanCoordinates = gpsPoints
          ? gpsPoints
          : [
              { lat: 37.403, lng: 127.159 }, //37.40392550253045, 127.15979672679869
              { lat: 37.41, lng: 127.128 }, //37.41099048571178, 127.12870456242335
              { lat: 37.418, lng: 127.127 }, //37.41889838581559, 127.12793208628979
              { lat: 37.427, lng: 127.144 }, //37.427623375568345, 127.14475489986484
            ];
      
      flightPlanCoordinates.forEach(element => {
        polylinePath.push(new naver.maps.LatLng(element))
      });
      const flightPath = new naver.maps.Polyline({
          map: map,
          path: polylinePath,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
      });
      map.fitBounds(polylinePath); 
      // flightPath.setMap(map);
    },
    markerMap: function(gpsPoints){
      console.log(gpsPoints);
      let markerPoints = [];
      const flightPlanCoordinates = gpsPoints
          ? gpsPoints
          : [
              { lat: 37.403, lng: 127.159 }, //37.40392550253045, 127.15979672679869
              { lat: 37.41, lng: 127.128 }, //37.41099048571178, 127.12870456242335
              { lat: 37.418, lng: 127.127 }, //37.41889838581559, 127.12793208628979
              { lat: 37.427, lng: 127.144 }, //37.427623375568345, 127.14475489986484
            ];
      flightPlanCoordinates.forEach(element => {
        markerPoints.push(new naver.maps.LatLng(element))
      });
      markerPoints.forEach(element => {
          var marker = new naver.maps.Marker({
            map: map,
            position: element
            // animation: naver.maps.Animation.BOUNCE
        });
      });
      map.fitBounds(markerPoints)
    },
  }
};
</script>
<style>
</style>
