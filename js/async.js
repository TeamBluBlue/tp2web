// Référence à la carte Google (variable globale).
com.dinfogarneau.cours526.carte = null;
com.dinfogarneau.cours526.infoWindow = null;
// Position par défaut (Cégep Garneau).
com.dinfogarneau.cours526.latDefaut = 46.792517671520045;
com.dinfogarneau.cours526.longDefaut = -71.26503957969801;
// Référence à la carte Google (variable globale).
com.dinfogarneau.cours526.utilisateur = null;
com.dinfogarneau.cours526.arrondissements = [];
com.dinfogarneau.cours526.rtc = null;

com.dinfogarneau.cours526.traitementPostChargement = function (){
	var cdc = com.dinfogarneau.cours526;
	
	cdc.initCarte();
	cdc.definirPositionsZap();
};

// Fonction responsable de charger la carte.
com.dinfogarneau.cours526.initCarte = function () {
	var cdc = com.dinfogarneau.cours526;
	// Position initiale du centre de la carte (Cégep Garneau). 
	var posCentre = new google.maps.LatLng(cdc.latDefaut, cdc.longDefaut);
	// Object JSON pour les options de la carte.
	var optionsCarte = {
		"zoom": 14,
		"center": posCentre,
		"mapTypeId": google.maps.MapTypeId.ROADMAP
	};

	// Création de la carte Google (avec les options)
	// tout en spécifiant dans quel élément HTML elle doit être affichée.
	// Il ne faut pas redéclarer la variable "carte" car elle est globale.
	cdc.carte = new google.maps.Map(document.getElementById("googlemaps"), optionsCarte);
	
	// Tenter de récupérer la position du client
	if (typeof navigator.geolocation != "undefined"){
		console.log('Le navigateur supporte la géolocalisation.');
		navigator.geolocation.getCurrentPosition(cdc.positionClient, cdc.positionClientErreur, {});
	}
	// En cas d'échec, mettre une position par défaut
//	else{
//		console.log('Le navigateur NE supporte PAS la géolocalisation.');
//		cdc.carte.panTo(posCentre);
//	}
}; // Fin de la fonction "initCarte"

// Reçoit la position obtenue lors la géolocalisation
// Paramètre "position" : représente les coordonnées de la position obtenue
com.dinfogarneau.cours526.positionClient = function (position){
	var cdc = com.dinfogarneau.cours526;
	console.log('Position obtenue : ' + position.coords.latitude + ', ' + position.coords.longitude);
	var positionInitiale = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	
	// Définir le marqueur de la position du client
	cdc.definirPositionClient(positionInitiale);
};

// Postion du client n'a pas été obtenue, utilisation d'une position par défaut
// Paramètre "erreur" : représente l'erreur levée lors de l'obtention de la position
// du client
com.dinfogarneau.cours526.positionClientErreur = function (erreur){
	var cdc = com.dinfogarneau.cours526;
	console.log('Utilisation de la position par défaut.');
	cdc.carte.panTo(posCentre);
};

// Permet de définir la position du client
// Paramètre "position" : représente la position du client
com.dinfogarneau.cours526.definirPositionClient = function (position){
	var cdc = com.dinfogarneau.cours526;
	// Définir le marqueur de la position du client
	var optionsRepere = {
		"position": position, 
		"map": cdc.carte,
		"icon": "images/smiley-happy.png",
		"clickable": true,
		"title": "Vous êtes ici!"
	};
	var repere = new google.maps.Marker(optionsRepere);
	
	google.maps.event.addListener(repere, "click", function() { cdc.ouvrirInfoWindow(repere); });
	
	cdc.carte.setCenter(position);
};

// Permet de définir les positions des ZAP
com.dinfogarneau.cours526.definirPositionsZap = function (){
	var cdc = com.dinfogarneau.cours526;
	
	for (var i = 0; i < cdc.reperes.length; i++){
		cdc.definirUnZap(cdc.reperes[i]);
	}
	
	console.log("Les ZAP ont été affichés.");
};

com.dinfogarneau.cours526.definirUnZap = function (zapJson){
	var cdc = com.dinfogarneau.cours526;
	
	// Définir le marqueur de la position du zap
	var optionsRepere = {
		"position": new google.maps.LatLng(zapJson.lat, zapJson.long),
		"map": cdc.carte,
		"icon": "images/wifi.png",
		"clickable": true,
		"title": zapJson.id
	};
	zapJson.placemark = new google.maps.Marker(optionsRepere);

	google.maps.event.addListener(zapJson.placemark, "click", function() { cdc.ouvrirInfoWindow(zapJson.placemark); });
}

// Permet d'ouvrir une bulle d'information au-dessus de la position du client
// Paramètre "repere" : représente la position du client
com.dinfogarneau.cours526.ouvrirInfoWindow = function (repere){
	var cdc = com.dinfogarneau.cours526;
	
	// Fermer l'infoWindow existante
	if (cdc.infoWindow !== null){
		cdc.infoWindow.close();
	}
	
	// Créer une nouvelle infoWindow et l'ouvrir
	cdc.infoWindow = new google.maps.InfoWindow({
			content: repere.getTitle()
	});
	cdc.infoWindow.open(cdc.carte, repere);
	
	// Centrer la carte sur le repère
	cdc.carte.panTo(repere.getPosition());
};