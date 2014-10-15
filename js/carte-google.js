function googleMaps(){
	var defLat = 46.7920354;
	var defLong = -71.2946649;
	var defAlt = 12;
	
	var defPosition = new google.maps.LatLng(defLat, defLong);
	var optionsCarte = {
		"zoom": defAlt,
		"center": defPosition,
		"disableDoubleClickZoom": true,
		"mapTypeId": google.maps.MapTypeId.ROADMAP
	};
	
	var carte = new google.maps.Map(document.getElementById("googlemaps"), optionsCarte);
}

// Affichage de la carte Google
google.maps.event.addDomListener(window, 'load', googleMaps);