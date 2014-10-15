// Variables globales
var defLat = 46.8380946;
var defLong = -71.3079991;
var defPosition = new google.maps.LatLng(defLat, defLong);
var carte;

function googleMaps(){
	var defAlt = 11;
	var optionsCarte = {
		"zoom": 14,
		"mapTypeId": google.maps.MapTypeId.ROADMAP
	};
	carte = new google.maps.Map(document.getElementById("googlemaps"), optionsCarte);
	
	
	// Tenter de récupérer la position du client
	if (typeof navigator.geolocation !== "undefined"){
		console.log('Le navigateur supporte la géolocalisation.');
		navigator.geolocation.getCurrentPosition(positionClient, positionClientErreur, {});
	}
	// En cas d'échec, mettre une position par défaut
	else{
		console.log('Le navigateur NE supporte PAS la géolocalisation.');
		var positionInitiale = defPosition;
		carte.setCenter(positionInitiale);
	}
}

// Position du client obtenue
function positionClient(position){
	console.log('Position obtenue : ' + position.coords.latitude + ', ' + position.coords.longitude);
	var positionInitiale = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	carte.setCenter(positionInitiale);
}

// Postion du client n'a pas été obtenue, utilisation d'une position par défaut
function positionClientErreur(erreur){
	console.log('Utilisation de la position par défaut.');
	var positionInitiale = defPosition;
	carte.setCenter(positionInitiale);
}

// Affichage de la carte Google
google.maps.event.addDomListener(window, 'load', googleMaps);