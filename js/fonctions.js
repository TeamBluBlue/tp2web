	
// Référence à la carte Google (variable globale).
var carte;
// Position par défaut (Beauport).
var latDefaut = 46.876423;
var longDefaut = -71.190285;

function initCarte() {
	
	// Object JSON pour les options de la carte (sans la position initiale).
	var optionsCarte = {
		"zoom": 14,
		"mapTypeId": google.maps.MapTypeId.ROADMAP
	};

	// Création de la carte Google (avec les options)
	// tout en spécifiant dans quel élément HTML elle doit être affichée.
	carte = new google.maps.Map(document.getElementById("carte-canvas"), optionsCarte);

	// Est-ce que le navigateur supporte la géolocalisation ?
	if ( typeof navigator.geolocation != "undefined" ) {
		console.log('Le navigateur supporte la géolocalisation.');
		// Tentative de récupération de la position du visiteur (une autorisation de l'utilisateur est nécessaire).
		navigator.geolocation.getCurrentPosition(getCurrentPositionSuccess, getCurrentPositionError, {});
	} else {
		// Pas de support de la géolocalisation.
		console.log('Le navigateur NE supporte PAS la géolocalisation.');
		// Utilisation de la position par défaut.
		var positionInit = new google.maps.LatLng(latDefaut, longDefaut);
		// Centrage de la carte sur la bonne coordonnée.
		carte.setCenter(positionInit);
	}
	ajouterPlacemark(carte.getCenter());
}  // Fin de la fonction "initCarte"

// Fonction appelée lors du succès de la récupération de la position.
function getCurrentPositionSuccess (position) {	
	// Utilisation de la position de l'utilisateur.
	console.log('Position obtenue : ' + position.coords.latitude + ', ' + position.coords.longitude);
	var positionInit = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	// Centrage de la carte sur la bonne coordonnée.
	carte.setCenter(positionInit);
}

// Fonction appelée lors de l'échec (refus ou problème) de la récupération de la position.
function getCurrentPositionError(erreur) {	
	// Utilisation de la position par défaut.
	console.log('Utilisation de la position par défaut.');
	var positionInit = new google.maps.LatLng(latDefaut, longDefaut);
	// Centrage de la carte sur la bonne coordonnée.
	carte.setCenter(positionInit);
}
	google.maps.event.addDomListener(window, 'load', initCarte);	

// Appel de la fonction au chargement de la page (utilisation de l'API de Google).
function ajouterPlacemark(position) {
	var repere = new google.maps.Marker( {"position": position, "map": carte, "icon":"images/wifi.png"} );
}