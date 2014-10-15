// Variables globales
var defLat = 46.8380946;
var defLong = -71.3079991;
var defPosition = new google.maps.LatLng(defLat, defLong);
var carte;

function googleMaps(){
	var defAlt = 11;
	var optionsCarte = {
		"zoom": defAlt,
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
		
		// Définir le marqueur de la position du client
		definirPositionClient(positionInitiale);
	}
}

// Reçoit la position obtenue lors la géolocalisation
// Paramètre "position" : représente les coordonnées de la position obtenue
function positionClient(position){
	console.log('Position obtenue : ' + position.coords.latitude + ', ' + position.coords.longitude);
	var positionInitiale = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	
	// Définir le marqueur de la position du client
	definirPositionClient(positionInitiale);
}

// Postion du client n'a pas été obtenue, utilisation d'une position par défaut
// Paramètre "erreur" : représente l'erreur levée lors de l'obtention de la position
// du client
function positionClientErreur(erreur){
	console.log('Utilisation de la position par défaut.');
	var positionInitiale = defPosition;
	
	// Définir le marqueur de la position du client
	definirPositionClient(positionInitiale);
}

// Permet de définir la position du client
// Paramètre position : représente la position du client
function definirPositionClient(position){
	// Définir le marqueur de la position du client
	var optionsRepere = {
		"position": position, 
		"map": carte,
		"icon": "images/smiley-happy.png",
		"clickable": true,
		"title": "Vous êtes ici!"
	};
	var repere = new google.maps.Marker(optionsRepere);
	
	google.maps.event.addListener(repere, "click", function() { clicReperePosition(repere); });
	
	carte.setCenter(position);
}

// Permet d'ouvrir une bulle d'information au-dessus de la position du client
// Paramètre "repere" : représente la position du client
function clicReperePosition(repere){
	var bullePositionClient = new google.maps.InfoWindow({
		content: repere.getTitle()
	});
	bullePositionClient.open(carte, repere);
	
	// Centrer la carte sur le repère
	carte.panTo(repere.getPosition());
}

// Permet de vérifier si une bulle d'information est déjà ouverte
// Paramètre "infoWindow" = représente l'InfoWindow dont nous voulons vérifier
// l'état d'ouverture
//function bulleInfoOuverte(infoWindow){
//	var carteInfoWindow = infoWindow.getMap();
//	return (carteInfoWindow !== null && typeof carteInfoWindow !== "undefined");
//}

// Affichage de la carte Google
google.maps.event.addDomListener(window, 'load', googleMaps);