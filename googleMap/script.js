// script.js
var map;
var button = document.getElementById('button');
button.addEventListener('click', changeCenter);

function initMap() {
  var station = { lat: 37.411225 ,lng: 127.128686 };
  map = new google.maps.Map( document.getElementById('map'), {
      zoom: 15,
      center: station
    });

  new google.maps.Marker({
    position: station,
    map: map,
    label: "station"
  });
}

function changeCenter(){
  var Institute = { lat: 37.403985, lng: 127.159765 };
  map = new google.maps.Map( document.getElementById('map'), {
      zoom: 15,
      center: Institute
    });

	new google.maps.Marker({
	position: Institute,
	map: map,
	label: "Institute"
	});
}