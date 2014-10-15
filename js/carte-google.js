function googleMaps(){
	var defLat = 46.8380946;
	var defLong = -71.3079991;
	var defAlt = 11;
	
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