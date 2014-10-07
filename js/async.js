
// Fonction responsable des traitements post-chargement.
var cdc = com.dinfogarneau.cours526;
cdc.traitementPostChargement = function() {
	console.log('Traitement post-chargement.');
	// Appel de la fonction qui initialise la carte.
	this.initCarte();
	// Affichage des repères sur la carte.
	this.afficherReperesCarte();
}
// Référence à la carte Google (variable globale).
cdc.carte = {};
// Position par défaut (Beauport).
cdc.latDefaut = 46.876423;
cdc.longDefaut = -71.190285;
// Référence à la carte Google (variable globale).

cdc.initCarte = function() {
	
	// Object JSON pour les options de la carte (sans la position initiale).
	var optionsCarte = {
		"zoom": 14,
		"mapTypeId": google.maps.MapTypeId.ROADMAP
	};

	// Création de la carte Google (avec les options)
	// tout en spécifiant dans quel élément HTML elle doit être affichée.
	this.carte = new google.maps.Map(document.getElementById("carte-canvas"), optionsCarte);

	// Est-ce que le navigateur supporte la géolocalisation ?
	if ( typeof navigator.geolocation != "undefined" ) {
		console.log('Le navigateur supporte la géolocalisation.');
		// Tentative de récupération de la position du visiteur (une autorisation de l'utilisateur est nécessaire).
		navigator.geolocation.getCurrentPosition(this.getCurrentPositionSuccess,this.getCurrentPositionError, {});
	} else {
		// Pas de support de la géolocalisation.
		console.log('Le navigateur NE supporte PAS la géolocalisation.');
		// Utilisation de la position par défaut.
		var positionInit = new google.maps.LatLng(this.latDefaut, this.longDefaut);
		// Centrage de la carte sur la bonne coordonnée.
		cdc.carte.setCenter(positionInit);
	}
	// ajouterPlacemark(carte.getCenter());
}  // Fin de la fonction "initCarte"

// Fonction appelée lors du succès de la récupération de la position.
cdc.getCurrentPositionSuccess = function (position) {	
	// Utilisation de la position de l'utilisateur.
	console.log('Position obtenue : ' + position.coords.latitude + ', ' + position.coords.longitude);
	var positionInit = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	// Centrage de la carte sur la bonne coordonnée.
	cdc.carte.setCenter(positionInit);
}

// Fonction appelée lors de l'échec (refus ou problème) de la récupération de la position.
cdc.getCurrentPositionError = function (erreur) {	
	// Utilisation de la position par défaut.
	console.log('Utilisation de la position par défaut.');
	var positionInit = new google.maps.LatLng(this.latDefaut, this.slongDefaut);
	// Centrage de la carte sur la bonne coordonnée.
	cdc.carte.setCenter(positionInit);
}

// Fonction responsable d'afficher les repères sur la carte.
cdc.afficherReperesCarte = function() {
	// Parcours des repères.
	for (var i=0; i < cdc.reperes.length-1; i++) {
		// Position du repère.
		var posRepere = new google.maps.LatLng(cdc.reperes[i].lat, cdc.reperes[i].long);
		// Création du repère sur la carte.
		var repere = new google.maps.Marker( {"position": posRepere, "map": cdc.carte, "icon" : "images/wifi.png"} );
	}
}