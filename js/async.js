
// Fonction responsable des traitements post-chargement.
com.dinfogarneau.cours526.traitementPostChargement = function() {
	var cdc = com.dinfogarneau.cours526;
	console.log('Traitement post-chargement.');

	// Appel de la fonction qui initialise la carte.
	console.log('Affichage de la carte');
	cdc.initCarte();

	if(cdc.elementsCharges.zap)
	{
		console.log('Affichage des repères');
		cdc.afficherReperesCarte();
	}

	if(cdc.elementsCharges.arrondissements)
	{
		console.log('Affichage des arrondissements');
		cdc.afficherArrondissementsCarte();
	}

	console.log('Interface HTML');
	cdc.initInterface();
}

// Référence à la carte Google (variable globale).
com.dinfogarneau.cours526.carte = null;
// Référence à la XmlHttpRequest pour l'envoi d'avis
com.dinfogarneau.cours526.xhrJsonPost = null;

// Référence vers InfoWindow qui sera ouverte dans l'application (il n'y en aura qu'une seul d'ouverte à la fois)
com.dinfogarneau.cours526.infoWindow = null;

// Position par défaut (Cégep Garneau).
com.dinfogarneau.cours526.latDefaut = 46.792517671520045;
com.dinfogarneau.cours526.longDefaut = -71.26503957969801;

// Position de l'utilisateur
com.dinfogarneau.cours526.utilisateur = null;

// Liste des arrondissments
com.dinfogarneau.cours526.arrondissements = null;

// Carte du RTC
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
	// Utilisation de la position par défaut.
	var positionInit = new google.maps.LatLng(cdc.latDefaut, cdc.longDefaut);
	// Centrage de la carte sur la bonne coordonnée.
	cdc.carte.setCenter(positionInit);

	// Est-ce que le navigateur supporte la géolocalisation ?
	if ( typeof navigator.geolocation != "undefined" ) {
		console.log('Le navigateur supporte la géolocalisation.');
		// Tentative de récupération de la position du visiteur (une autorisation de l'utilisateur est nécessaire).
		navigator.geolocation.getCurrentPosition(cdc.getCurrentPositionSuccess,cdc.getCurrentPositionError, {});
	} else {
		// Pas de support de la géolocalisation.
		console.log('Le navigateur NE supporte PAS la géolocalisation.');
	}
}  // Fin de la fonction "initCarte"


// Fonction appelée lors du succès de la récupération de la position.
com.dinfogarneau.cours526.getCurrentPositionSuccess = function (position) {	
	var cdc = com.dinfogarneau.cours526;
	// Utilisation de la position de l'utilisateur.
	console.log('Position obtenue : ' + position.coords.latitude + ', ' + position.coords.longitude);
	var position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	cdc.carte.panTo(position);
	cdc.setPositionUtilisateur(position);
}

// Fonction appelée lors de l'échec (refus ou problème) de la récupération de la position.
com.dinfogarneau.cours526.getCurrentPositionError = function (erreur) {	
	var cdc = com.dinfogarneau.cours526;
	// Utilisation de la position par défaut.
	console.log('Utilisation de la position par défaut.');
}

com.dinfogarneau.cours526.setPositionUtilisateur = function(position) {
	var cdc = com.dinfogarneau.cours526;

	cdc.utilisateur = cdc.ajouterPlacemark(position, "utilisateur");
	console.log("Calcul de la distance entre les bornes et l'utilisateur");

	if(cdc.elementsCharges.zap)
	{
		for (var i=0; i < cdc.reperes.length; i++) {
			var repere = cdc.reperes[i].placemark;
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
}

// Fonction responsable d'afficher les repères sur la carte.
com.dinfogarneau.cours526.afficherReperesCarte = function() {
	var cdc = com.dinfogarneau.cours526;
	// Parcours des repères.
	for (var i=0; i < cdc.reperes.length; i++) {
		cdc.ajouterZap(cdc.reperes[i]);
	}	
}
// Fonction servant afficher certaines informations suite à l'exécution avec succès de la requête HTTP.
com.dinfogarneau.cours526.afficherArrondissementsCarte = function() {		
	var cdc = com.dinfogarneau.cours526;
	cdc.arrondissements = [];
	// Document XML retourné.
	try{
		var docXML = cdc.xhrXmlGet.responseXML;
		var arrondissements = docXML.getElementsByTagName("Arrondissement");
	} catch(e) {
		alert('Erreur: Impossible de lire les arrondissements');
		cdc.elementsCharges.arrondissements = null;
		return;
	}
	for(var h = 0; h< arrondissements.length;h++) {
		var points = [];
		var arr = arrondissements[h];
		
		var concatCoords = "";
		var listeCoordsSeparees = arr.getElementsByTagName("Geometrie")[0].childNodes;
		
		// Concaténer les coordonnées séparées (se produit dans Firefox)
		for (var f = 0; f < listeCoordsSeparees.length; f++){
			concatCoords += listeCoordsSeparees[f].nodeValue;
		}
		
		var m = concatCoords.match(/\([^\(\)]+\)/g);
		
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

	cdc.arrondissements.sort(function(a, b){
		return a.code - b.code;
	});
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
com.dinfogarneau.cours526.ajouterZap = function(repere) {
	var cdc = com.dinfogarneau.cours526;
	// Position du repère.
	var posRepere = new google.maps.LatLng(repere.lat, repere.long);

	var options = {
		"clickable": true,
		"title": repere.nomBati
		};

	// Création du repère sur la carte.
	repere.placemark = cdc.ajouterPlacemark(posRepere, "zap", options);
	repere.avis = [];
	google.maps.event.addListener(repere.placemark, "click", function() {
		console.log("affichage de l'infowindow par le repère");
		cdc.preparerInfoWindow(repere);
	
	});
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
			opts.title = "Vous êtes ici";
			opts.icon="images/smiley_happy.png";
			break;
	}
	return new google.maps.Marker(opts);
}

// Fonction appelée pour gérer le click sur un repère.
com.dinfogarneau.cours526.preparerInfoWindow = function(repere) {
	var cdc = com.dinfogarneau.cours526;
	if(repere.avis.length == 0)
	{
		cdc.chargerDonneesAvis(repere);
	}
	else
	{
		cdc.afficherInfoWindow(repere);
	}
}
com.dinfogarneau.cours526.afficherInfoWindow = function(repere, avecFormulaire){
	var cdc = com.dinfogarneau.cours526;
	if(cdc.infoWindow != null)
	{
		console.log("Fermeture de l'infowindow");
		cdc.infoWindow.close();
	}
	if(avecFormulaire == null)
	{
		avecFormulaire = true;
	}

	console.log("Création de l'infowindow");
	cdc.infoWindow = new google.maps.InfoWindow({
			content: cdc.getInfoWindow(repere, avecFormulaire)
		});

	cdc.infoWindow.open(cdc.carte, repere.placemark);

	// Recentrage de la carte sur le nouveau repère.
	cdc.carte.panTo(repere.placemark.getPosition());
}
com.dinfogarneau.cours526.getInfoWindow = function(repere, avecFormulaire) {
	var cdc = com.dinfogarneau.cours526;

	var infoWindow = document.createElement("div");
	infoWindow.className = "infoWindow";

	var adresse = document.createElement("div");
	adresse.className = "adresse";

	var h1NomBati = document.createElement("h1");
	h1NomBati.appendChild(document.createTextNode(repere.nomBati));

	var divNoRue = document.createElement("div");
	divNoRue.appendChild(document.createTextNode(repere.noCiv + " " + repere.rue));

	var divArrond = document.createElement("div");
	divArrond.appendChild(document.createTextNode(repere.arrond));
	
	adresse.appendChild(h1NomBati);
	adresse.appendChild(divNoRue);	
	adresse.appendChild(divArrond);

	infoWindow.appendChild(adresse);

	var divAvis = document.createElement("div");
	divAvis.className = "avis";

	var h1AvisUti = document.createElement("h1");
	h1AvisUti.appendChild(document.createTextNode("Avis des utilisateurs"));

	var divListeAvis = document.createElement("div");
	divListeAvis.className = "listeAvis";
	divListeAvis.appendChild(cdc.getDomAvis(repere));

	divAvis.appendChild(h1AvisUti);
	divAvis.appendChild(divListeAvis);

	if(avecFormulaire)
	{
		var h2AvisPerso = document.createElement("h2");
		h2AvisPerso.appendChild(document.createTextNode("Avis personnel"));

		var form = document.createElement("form");

		var textarea = document.createElement("textarea");
		textarea.name = "avis";
		textarea.placeholder = "Laissez un avis sur cette ZAP";
		textarea.rows = 5;

		var button = document.createElement("button");
		button.type = "submit";
		button.appendChild(document.createTextNode("Envoyer"));
		button.disabled = true;

		textarea.addEventListener("input", function(){
			button.disabled = (this.value.trim() == "");	
		});

		form.appendChild(textarea);
		form.appendChild(button);


		form.addEventListener("submit",function(e){
			e.preventDefault();
		
			var divChargement = document.createElement("div");
			divChargement.className = "chargement";

			var divIcone = document.createElement("div");
			divIcone.className = "icone icone-chargement";
			divIcone.appendChild(document.createTextNode("\u2713"));

			divChargement.appendChild(divIcone);
			this.appendChild(divChargement);
			
			cdc.envoyerAvisAjax(repere, this);
			textarea.disabled=true;
			button.disabled=true;
		});
		divAvis.appendChild(h2AvisPerso);
		divAvis.appendChild(form);
	}
	else
	{
		divListeAvis.className = divListeAvis.className + " avis-retroaction";
	}



	infoWindow.appendChild(divAvis);

	return infoWindow;
}

com.dinfogarneau.cours526.getDomAvis = function(repere) {
	var div = document.createElement("div");

	for (var i = 0; i < repere.avis.length; i++) {
		var divAvisUti = document.createElement("div");
		var p = document.createElement("p");
		p.appendChild(document.createTextNode("« " + repere.avis[i].message + " »"));
		divAvisUti.appendChild(p);
		div.appendChild(divAvisUti);
	};
	return div;
}

com.dinfogarneau.cours526.envoyerAvisAjax = function(repere, formulaire) {
	var cdc = com.dinfogarneau.cours526;

	var erreur = false;

	// Création de l'objet XMLHttpRequest.
	cdc.xhrJsonPost = new XMLHttpRequest();

	try  {
		cdc.xhrJsonPost = new XMLHttpRequest();
	} catch (e) {
		alert('Erreur: Impossible de créer l\'objet XMLHttpRequest');
		erreur = true;
	}
	if(! erreur)
	{
		var xhr = cdc.xhrJsonPost;

		// Fonction JavaScript à exécuter lorsque l'état de la requête HTTP change.
		xhr.onreadystatechange = function(){
			cdc.envoyerAvisAjaxCallback(repere, formulaire);
		};
				
		// Contenu de la requête avec la méthode POST.
		contenuPOST = JSON.stringify({"zap": repere.nom, "message": formulaire["avis"].value.trim()});
		
		// Préparation de la requête HTTP-POST en mode asynchrone (true).
		xhr.open('POST', 'ajax/ajax-json-post.php', true);
		
		// Type de contenu de la requête.
		xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
		
		// Envoie de la requête au serveur en lui passant le contenu;
		// lorsque la requête changera d'état; la fonction "envoyerAvisAjaxCallback" sera appelée.
		xhr.send(contenuPOST);
	}

}

// Callback de la requête AJAX qui demande et affiche les informations d'un professeur.
com.dinfogarneau.cours526.envoyerAvisAjaxCallback = function(repere, formulaire) {
	var cdc = com.dinfogarneau.cours526;
	var xhr = cdc.xhrJsonPost;

	// La requête AJAX est-elle complétée (readyState=4) ?
	if ( xhr.readyState == 4 ) {

		// La requête AJAX est-elle complétée avec succès (status=200) ?
		if ( xhr.status != 200 ) {
			// Affichage du message d'erreur.
			alert('Erreur (code=' + xhr.status + '): La requête HTTP n\'a pu être complétée.');		
		} else {
			// Création de l'objet JavaScript à partir de l'expression JSON.
			try { 
				var reponse = JSON.parse( xhr.responseText );
			} catch (e) {
				alert('ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
				// Fin de la fonction.
				return;
			}

			// Y a-t-il eu une erreur côté serveur ?
			if ( reponse.erreur ) {
				// Affichage du message d'erreur.
				alert('Erreur: ' + reponse.erreur.message);				
			} else {
				var icone = formulaire.lastChild.firstChild;
				icone.className = icone.className.replace("icone-chargement","").trim();
				repere.avis.push(reponse);
				cdc.afficherInfoWindow(repere, false);
			}

		}
	}
}  // Fin de "afficherInfoProfAjaxCallback" 

com.dinfogarneau.cours526.chargerDonneesAvis = function(repere){
	var cdc = com.dinfogarneau.cours526;
	// Création de l'objet XMLHttpRequest.
	cdc.xhrJsonGet = new XMLHttpRequest();

	var xhr = cdc.xhrJsonGet;

	// Fonction JavaScript à exécuter lorsque l'état de la requête HTTP change.
	xhr.onreadystatechange = function(){
		cdc.chargerDonneesAvisCallback(repere);
	}
	
	// Préparation de la requête HTTP-GET en mode asynchrone (true).
	xhr.open('GET', 'ajax/ajax-json-get.php?req=avis&borne='+repere.nom, true);
	
	// Envoie de la requête au serveur en lui passant null (aucun contenu);
	// lorsque la requête changera d'état; la fonction "afficherInfoProfAJAX_callback" sera appelée.
	xhr.send(null);
}

com.dinfogarneau.cours526.chargerDonneesAvisCallback = function(repere){
	var cdc = com.dinfogarneau.cours526;
	var xhr = cdc.xhrJsonGet;
	// La requête AJAX est-elle complétée (readyState=4) ?
	if ( xhr.readyState == 4 ) {

		// La requête AJAX est-elle complétée avec succès (status=200) ?
		if ( xhr.status != 200 ) {
			// Affichage du message d'erreur.
			var msgErreur = 'Erreur (code=' + xhr.status + '): La requête HTTP n\'a pu être complétée.';
			alert(msgErreur);
			
		} else {
			// Création de l'objet JavaScript à partir de l'expression JSON.
			// *** Notez l'utilisation de "responseText".
			try { 
				repere.avis = JSON.parse( xhr.responseText );
			} catch (e) {
				alert('ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
				// Fin de la fonction.
				return;
			}

			// Y a-t-il eu une erreur côté serveur ?
			if ( repere.avis.erreur ) {
				// Affichage du message d'erreur.
				var msgErreur = 'Erreur: ' + repere.avis.erreur.message;
				alert(msgErreur);
				
			} else {
				console.log("affichage de l'infowindow par le callback");
				cdc.preparerInfoWindow(repere);
			}
		}
	}

}

com.dinfogarneau.cours526.initInterface = function(){
	var cdc = com.dinfogarneau.cours526;
	if(cdc.elementsCharges.zap)
	{	
		cdc.initInterfaceZap();
	}
	if(cdc.elementsCharges.arrondissements)
	{
		cdc.initInterfaceArr();
	}
	cdc.initInterfaceRtc();
	cdc.initLiens();
	cdc.showInterface();
}

com.dinfogarneau.cours526.initInterfaceZap = function(){
	var cdc = com.dinfogarneau.cours526;

	var liste = document.getElementById("lstZap");

	for(var i = 0; i < cdc.reperes.length; i++){
		liste.appendChild(cdc.ajouterElemZapInterface(cdc.reperes[i]));
	}
}
com.dinfogarneau.cours526.ajouterElemZapInterface = function(repere){
	var cdc = com.dinfogarneau.cours526;

		var li = document.createElement("li");
		var a = document.createElement("a");
		a.href="#"+repere.nomBati;
		a.addEventListener("click", function(e){
			e.preventDefault();
			console.log("affichage de l'infowindow par l'onglet");
			cdc.preparerInfoWindow(repere);
		});
		a.appendChild(document.createTextNode(repere.nomBati));
		li.appendChild(a);
		return li;
}


com.dinfogarneau.cours526.initInterfaceArr = function(){
	var cdc = com.dinfogarneau.cours526;

	var panneau = document.getElementById("lstArr");
	for(var i = 0; i < cdc.arrondissements.length; i++)
	{
		var arr = cdc.arrondissements[i];

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
				visible:true,
				strokeColor: '#0000FF',
				fillColor: '#0000FF'
			});			
		});
		label.addEventListener("mouseout", function(){
			cdc.arrondissements[this.firstChild.value].polygone.setOptions({
				strokeColor: '#FF0000',
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
		var inputs = document.getElementById("lstArr").getElementsByTagName("input");
		for(var i = 0; i < inputs.length; i++)
		{
			inputs[i].checked = true;
			inputs[i].dispatchEvent(new Event("change"));
		}
	});
	document.getElementById("unselectAll").addEventListener("click", function(e){
		e.preventDefault();
		var inputs = document.getElementById("lstArr").getElementsByTagName("input");
		for(var i = 0; i < inputs.length; i++)
		{
			inputs[i].checked = false;
			inputs[i].dispatchEvent(new Event("change"));
		}
	});
}

com.dinfogarneau.cours526.initInterfaceRtc = function()
{
	var cdc = com.dinfogarneau.cours526;
	cdc.rtc = new google.maps.KmlLayer({
		url: "http://webequinox.net/kml/rtc-trajets.kml",
		preserveViewport: true
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
com.dinfogarneau.cours526.initLiens = function(){
	var panneau = document.getElementById("panneau");

	var nav = panneau.getElementsByClassName("nav-onglets")[0];
	
	var liens = nav.getElementsByClassName("lien");

	for (var i = 0; i< liens.length; i++)
	{
		var lien = liens[i].getElementsByTagName("a")[0];

		lien.addEventListener("click",function(e){
			e.preventDefault();

			var courants = nav.getElementsByClassName("courant");
			for(var j = 0; j< courants.length; j++)
			{
				courants[j].className = courants[j].className.replace("courant","").trim();
			}

			var parent = this.parentNode;
			this.parentNode.className = this.parentNode.className + " courant";

			var onglets = panneau.getElementsByClassName("onglet");
			for (var i = 0; i < onglets.length; i++) {
				onglets[i].className = onglets[i].className.replace("ouvert","ferme");
			};
			var onglet = document.getElementById(this.getAttribute("href").replace("#",""));
			onglet.className = onglet.className.replace("ferme","ouvert");
		});
	}
	panneau.getElementsByClassName("fermer")[0].addEventListener("click", function(e){
		e.preventDefault();
		if(panneau.className.search("panneau-ouvert") > -1)
		{
			panneau.className = panneau.className.replace("panneau-ouvert", "panneau-ferme");
		}
		else
		{
			panneau.className = panneau.className.replace("panneau-ferme", "panneau-ouvert");
		}
	});
}
com.dinfogarneau.cours526.showInterface = function() {
	var panneau = document.getElementById("panneau");
	panneau.className = panneau.className.replace("panneau-ferme", "panneau-ouvert");
}