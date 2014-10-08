
// Fonction responsable des traitements post-chargement.
com.dinfogarneau.cours526.traitementPostChargement = function() {
	var cdc = com.dinfogarneau.cours526;
	console.log('Traitement post-chargement.');
	// Appel de la fonction qui initialise la carte.
	cdc.initCarte();
	cdc.utilisateur = cdc.ajouterPlacemark(null,"utilisateur");
	cdc.afficherReperesCarte();
}
// Référence à la carte Google (variable globale).
com.dinfogarneau.cours526.carte = {};
// Position par défaut (Beauport).
com.dinfogarneau.cours526.latDefaut = 46.876423;
com.dinfogarneau.cours526.longDefaut = -71.190285;
// Référence à la carte Google (variable globale).
com.dinfogarneau.cours526.utilisateur = {};


com.dinfogarneau.cours526.initCarte = function() {
	var cdc = com.dinfogarneau.cours526;
	
	// Object JSON pour les options de la carte (sans la position initiale).
	var optionsCarte = {
		"zoom": 14,
		"mapTypeId": google.maps.MapTypeId.ROADMAP
	};

	// Création de la carte Google (avec les options)
	// tout en spécifiant dans quel élément HTML elle doit être affichée.
	cdc.carte = new google.maps.Map(document.getElementById("carte-canvas"), optionsCarte);

	// Est-ce que le navigateur supporte la géolocalisation ?
	if ( typeof navigator.geolocation != "undefined" ) {
		console.log('Le navigateur supporte la géolocalisation.');
		// Tentative de récupération de la position du visiteur (une autorisation de l'utilisateur est nécessaire).
		navigator.geolocation.getCurrentPosition(cdc.getCurrentPositionSuccess,cdc.getCurrentPositionError, {});
	} else {
		// Pas de support de la géolocalisation.
		console.log('Le navigateur NE supporte PAS la géolocalisation.');
		// Utilisation de la position par défaut.
		var positionInit = new google.maps.LatLng(cdc.latDefaut, cdc.longDefaut);
		// Centrage de la carte sur la bonne coordonnée.
		cdc.carte.setCenter(positionInit);
	}
}  // Fin de la fonction "initCarte"


// Fonction appelée lors du succès de la récupération de la position.
com.dinfogarneau.cours526.getCurrentPositionSuccess = function (position) {	
	var cdc = com.dinfogarneau.cours526;
	// Utilisation de la position de l'utilisateur.
	console.log('Position obtenue : ' + position.coords.latitude + ', ' + position.coords.longitude);
	var position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	cdc.carte.setCenter(position);
	cdc.setPositionUtilisateur(position);
}

// Fonction appelée lors de l'échec (refus ou problème) de la récupération de la position.
com.dinfogarneau.cours526.getCurrentPositionError = function (erreur) {	
	var cdc = com.dinfogarneau.cours526;
	// Utilisation de la position par défaut.
	console.log('Utilisation de la position par défaut.');
	var position = new google.maps.LatLng(cdc.latDefaut, cdc.longDefaut);
	cdc.carte.setCenter(position);
}

// Fonction responsable d'afficher les repères sur la carte.
com.dinfogarneau.cours526.afficherReperesCarte = function() {
	var cdc = com.dinfogarneau.cours526;
	// Parcours des repères.
	for (var i=0; i < cdc.reperes.json.length-1; i++) {
		// Position du repère.
		var posRepere = new google.maps.LatLng(cdc.reperes.json[i].lat, cdc.reperes.json[i].long);

		// Création du repère sur la carte.
		cdc.reperes.placemarks.push(cdc.ajouterPlacemark(posRepere, "zap"));
	}
}

com.dinfogarneau.cours526.ajouterPlacemark = function(position, type) {
	var options = {"position": position, "map": com.dinfogarneau.cours526.carte};
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

com.dinfogarneau.cours526.setPositionUtilisateur = function(position) {
	var cdc = com.dinfogarneau.cours526;
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