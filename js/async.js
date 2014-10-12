
// Fonction responsable des traitements post-chargement.
com.dinfogarneau.cours526.traitementPostChargement = function() {
	var cdc = com.dinfogarneau.cours526;
	console.log('Traitement post-chargement.');
	// Appel de la fonction qui initialise la carte.
	cdc.initCarte();
	cdc.afficherReperesCarte();
	cdc.afficherArrondissementsCarte();
	cdc.initRtc();
}
// Référence à la carte Google (variable globale).
com.dinfogarneau.cours526.carte = null;
// Position par défaut (Cégep Garneau).
com.dinfogarneau.cours526.latDefaut = 46.792517671520045;
com.dinfogarneau.cours526.longDefaut = -71.26503957969801;
// Référence à la carte Google (variable globale).
com.dinfogarneau.cours526.utilisateur = {};
com.dinfogarneau.cours526.arrondissements = [];
com.dinfogarneau.cours526.rtc = null;


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

com.dinfogarneau.cours526.setPositionUtilisateur = function(position) {
	var cdc = com.dinfogarneau.cours526;

	cdc.utilisateur = cdc.ajouterPlacemark(position, "utilisateur");
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

// Fonction responsable d'afficher les repères sur la carte.
com.dinfogarneau.cours526.afficherReperesCarte = function() {
	var cdc = com.dinfogarneau.cours526;
	// Parcours des repères.
	for (var i=0; i < cdc.reperes.json.length-1; i++) {
		cdc.ajouterZap(cdc.reperes.json[i]);
	}	
}
// Fonction servant afficher certaines informations suite à l'exécution avec succès de la requête HTTP.
com.dinfogarneau.cours526.afficherArrondissementsCarte = function() {		
	var cdc = com.dinfogarneau.cours526;
	// Document XML retourné.
	var docXML = cdc.xhrArr.responseXML;
	var arrondissements = docXML.getElementsByTagName("Arrondissement");
	for(var h = 0; h< arrondissements.length;h++) {
		var points = [];
		var arr = arrondissements[h];
		var m = arr.getElementsByTagName("Geometrie")[0].firstChild.nodeValue.match(/\([^\(\)]+\)/g);
		if (m !== null) {
			for (var i = 0; i < m.length; i++) {
				//match all numeric strings
				var tmp = m[i].match(/-?\d+\.?\d*/g);
				if (tmp !== null) {
					//convert all the coordinate sets in tmp from strings to Numbers and convert to LatLng objects
					for (var j = 0, tmpArr = []; j < tmp.length; j+=2) {
						var lat = Number(tmp[j + 1]);
						var lng = Number(tmp[j]);
						var pos = new google.maps.LatLng(lat, lng);
						tmpArr.push(pos);
					}
					points.push(tmpArr);
				}
			}
		}
		cdc.ajouterArr(arr.getElementsByTagName("Code")[0].firstChild.nodeValue,arr.getElementsByTagName("Nom")[0].firstChild.nodeValue,points);
	}
	// // Recherche du premier noeud "Element" (nodeType=1) sous la racine.
	// var i=0;
	// // Attention: Ce code va planter s'il n'y pas au moins un élément sous la racine.
	// while ( racineXML.childNodes[i].nodeType != 1 )
	// 	i++;
	// // Contenu texte du premier élément sous la racine.
	// var titreLivre = racineXML.childNodes[i].firstChild.nodeValue;
	cdc.arrondissements.sort(function(a, b){
		return a.code - b.code;
	});
	cdc.initInterface();
}
com.dinfogarneau.cours526.ajouterZap = function(zapJSON) {
	var cdc = com.dinfogarneau.cours526;

	// Position du repère.
	var posRepere = new google.maps.LatLng(zapJSON.lat, zapJSON.long);

	var options = {
		"title": zapJSON.NOM_BATI,
		"clickable": true
		};

	// Création du repère sur la carte.
	var repere = cdc.ajouterPlacemark(posRepere, "zap", options);

	google.maps.event.addListener(repere, "click", function() {
	/***** Décommenter pour que les InfoWindows apparaissent *****/

		// cdc.gererClickRepere(repere, zapJSON);
	
	});
	
	cdc.reperes.placemarks.push(repere);

}
com.dinfogarneau.cours526.ajouterPlacemark = function(position, type, options) {
	var opts;
	if(options == null) {
		opts = {};	
	}
	else {
		opts = options;
	}
	opts.position = position;
	opts.map = com.dinfogarneau.cours526.carte;
	switch(type) {
		case "zap":
			opts.icon="images/wifi.png";
			break;
		case "utilisateur":
			opts.icon="images/smiley_happy.png";
			break;
	}
	return new google.maps.Marker(opts);
}
com.dinfogarneau.cours526.ajouterArr = function(code,nom,points) {
	var arrPoly = new google.maps.Polygon({
		paths: points,
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#FF0000',
		fillOpacity: 0.35
	});
	var cdc = com.dinfogarneau.cours526;

	arrPoly.setMap(cdc.carte);
	cdc.arrondissements.push({"code": Number(code), "nom":nom, "polygone": arrPoly});
}
// Fonction appelée pour gérer le click sur un repère.
com.dinfogarneau.cours526.gererClickRepere = function(repere, zapJSON) {
	var cdc = com.dinfogarneau.cours526;

	var infoWindow = new google.maps.InfoWindow({
			content: cdc.getInfoWindow(zapJSON)
		});

	infoWindow.open(cdc.carte, repere);

	// Recentrage de la carte sur le nouveau repère.
	cdc.carte.panTo(repere.getPosition());
}
com.dinfogarneau.cours526.getInfoWindow = function(zapJSON) {
	var div = document.createElement("div");
	var h1 = document.createElement("h1");
	h1.appendChild(document.createTextNode(zapJSON.NOM_BATI));
	div.appendChild(h1);
	return div;
}
com.dinfogarneau.cours526.initRtc = function()
{
	var cdc = com.dinfogarneau.cours526;
	cdc.rtc = new google.maps.KmlLayer({
		url: "http://webequinox.net/kml/rtc-trajets.kml"
	});

	document.getElementById("chkBoxRtc").addEventListener("change", function(){
		if(this.checked)
		{
			cdc.rtc.setMap(cdc.carte);
		}	
		else
		{
			cdc.rtc.setMap();
		}
	});
}
com.dinfogarneau.cours526.initInterface = function(){
	var cdc = com.dinfogarneau.cours526;
	for(var i = 0; i < cdc.arrondissements.length; i++)
	{
		var arr = cdc.arrondissements[i];
		var panneau = document.getElementById("arrondissements");

		var label = document.createElement("label");
		var input = document.createElement("input");
		input.type = "checkbox";
		input.checked = true;
		input.value = i;

		input.addEventListener("change", function(){
			cdc.arrondissements[this.value].polygone.setVisible(this.checked);
		});

		label.addEventListener("mouseover", function(){
			cdc.arrondissements[this.firstChild.value].polygone.setOptions({
				fillOpacity:0.25,
				visible:true,
				strokeColor: '#FF4444',
				strokeOpacity: 0.4,
				fillColor: '#FF4444'
			});			
		});
		label.addEventListener("mouseout", function(){
			cdc.arrondissements[this.firstChild.value].polygone.setOptions({
				fillOpacity:0.35,
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				fillColor: '#FF0000',
				visible:this.firstChild.checked
			});			
		});
		label.appendChild(input);
		label.appendChild(document.createTextNode(arr.code + " - " + arr.nom));

		panneau.appendChild(label);
	}
	document.getElementById("selectAll").addEventListener("click", function(e){
		e.preventDefault();
		var inputs = document.getElementById("arrondissements").getElementsByTagName("input");
		for(var i = 0; i < inputs.length; i++)
		{
			inputs[i].checked = true;
			inputs[i].dispatchEvent(new Event("change"));
		}
	});
	document.getElementById("unselectAll").addEventListener("click", function(e){
		e.preventDefault();
		var inputs = document.getElementById("arrondissements").getElementsByTagName("input");
		for(var i = 0; i < inputs.length; i++)
		{
			inputs[i].checked = false;
			inputs[i].dispatchEvent(new Event("change"));
		}
	});
}
