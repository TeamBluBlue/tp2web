
// Fonction responsable des traitements post-chargement.
var cdc = com.dinfogarneau.cours526;
cdc.traitementPostChargement = function() {
	console.log('Traitement post-chargement.');
	// Appel de la fonction qui initialise la carte.
	this.initCarte();
	cdc.utilisateur = this.ajouterPlacemark(null,"utilisateur");
	this.afficherReperesCarte();
}
// Référence à la carte Google (variable globale).
cdc.carte = {};
// Position par défaut (Beauport).
cdc.latDefaut = 46.876423;
cdc.longDefaut = -71.190285;
// Référence à la carte Google (variable globale).
cdc.utilisateur = {};
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
}  // Fin de la fonction "initCarte"

// Fonction appelée lors du succès de la récupération de la position.
cdc.getCurrentPositionSuccess = function (position) {	
	// Utilisation de la position de l'utilisateur.
	console.log('Position obtenue : ' + position.coords.latitude + ', ' + position.coords.longitude);
	var position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	cdc.carte.setCenter(position);
	cdc.setPositionUtilisateur(position);
}

// Fonction appelée lors de l'échec (refus ou problème) de la récupération de la position.
cdc.getCurrentPositionError = function (erreur) {	
	// Utilisation de la position par défaut.
	console.log('Utilisation de la position par défaut.');
	var position = new google.maps.LatLng(cdc.latDefaut, cdc.longDefaut);
	cdc.carte.setCenter(position);
	cdc.setPositionUtilisateur(position);	
}

// Fonction responsable d'afficher les repères sur la carte.
cdc.afficherReperesCarte = function() {
	// Parcours des repères.
	for (var i=0; i < cdc.reperes.json.length-1; i++) {
		// Position du repère.
		var posRepere = new google.maps.LatLng(cdc.reperes.json[i].lat, cdc.reperes.json[i].long);

		// Création du repère sur la carte.
		cdc.reperes.placemarks.push(this.ajouterPlacemark(posRepere, "zap"));
	}
}
cdc.ajouterPlacemark = function(position, type) {
	var options = {"position": position, "map": cdc.carte};
	switch(type)
	{
		case "zap":
			options.icon="images/wifi.png";
			break;
		case "utilisateur":
			options.icon="images/smiley_happy.png";
			break;
	}
	return new google.maps.Marker(options);
}
cdc.setPositionUtilisateur = function(position) {
	cdc.utilisateur.setPosition(position);
	for (var i=0; i < cdc.reperes.placemarks.length-1; i++) {
		var repere = cdc.reperes.placemarks[i];
		if(google.maps.geometry.spherical.computeDistanceBetween(repere.getPosition(), cdc.utilisateur.getPosition())<5000)
		{
			repere.setIcon("images/wifi_proche.png");
		}
		else
		{
			repere.setIcon("images/wifi.png");
		}
	}
}