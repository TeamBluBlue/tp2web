if(typeof window.com == 'undefined') {
	window.com = {};
}

if(typeof com.dinfogarneau == 'undefined') {
	com.dinfogarneau = {};
}

if (typeof com.dinfogarneau.cours526 == 'undefined') {
	com.dinfogarneau.cours526 = {
		"elementsCharges": {
			"dom": false,
			"zap": false,
			/*"arrondissements": false,*/
			"api-google-map": false,
			"async": false
		},
		"xhrJson": null,
		"xhrXml": null,
		"reperes": null,
		"arrondissements": null,
		// Fonction contrôlant le chargement asynchrone de divers éléments.
		// Permet de charger de manière asynchrone un script
		// et d'appeler une fonction de callback après le chargement.
		"chargerScriptAsync": function (urlFichier, callbackFct) {
			var script = document.createElement('script');
			script.src = urlFichier;
			script.async = true;
			// Fonction de callback (optionnel) après le chargement asynchrone du script.
			if (typeof callbackFct == "function") {
				script.addEventListener('load', callbackFct, false);
			}
			document.documentElement.firstChild.appendChild(script);
		},
		"controleurChargement": function (nouvElemCharge) {
			var cdc = com.dinfogarneau.cours526;
			console.log('controleurChargement: Nouvel élément chargé "' + nouvElemCharge + '".');
			// Est-ce que c'est un élément dont le chargement doit être contrôlé ?
			if (typeof cdc.elementsCharges[nouvElemCharge] != "undefined") {
				// Chargement effectué pour cet élément.
				cdc.elementsCharges[nouvElemCharge] = true;
				// Est-ce que tous les éléments sont chargés ?
				var tousCharge = true;
				for (var elem in cdc.elementsCharges) {
					if ( ! cdc.elementsCharges[elem] )
						tousCharge = false;
				}
				// Si tous les éléments ont été chargés, appel de la fonction qui
				// fait le traitement post-chargement.
				if (tousCharge) {
					console.log('controleurChargement: Tous les éléments ont été chargés.');
					cdc.traitementPostChargement();
				} else {
					console.log('controleurChargement: Il reste encore des éléments à charger.');
				}
			}
		},
		// Fonction appelée pour indiquer que l'API Google Map est chargé.
		"apiGoogleMapCharge": function () {
			var cdc = com.dinfogarneau.cours526;
			console.log('API Google Map chargé.');
			// On informe le contrôleur (une simple fonction) que l'API Google Map est chargé.
			cdc.controleurChargement("api-google-map");
		},
		// Fonction appelée pour tenter de récupérer et d'afficher les informations
		// d'un professeur avec AJAX.
		"affZap": function () {
			var cdc = com.dinfogarneau.cours526;
			// Création de l'objet XMLHttpRequest.
			cdc.xhrJson = new XMLHttpRequest();
			// Fonction JavaScript à exécuter lorsque l'état de la requête HTTP change.
			cdc.xhrJson.onreadystatechange = cdc.affZapCallback;
			// Préparation de la requête HTTP-GET en mode asynchrone (true).
			cdc.xhrJson.open('GET', 'ajax/ajax-json-get.php?req=zap', true);
			cdc.xhrJson.send(null);
		},
		// Callback de la requête AJAX qui demande et affiche les ZAP
		"affZapCallback": function () {
			var cdc = com.dinfogarneau.cours526;
			
			// La requête AJAX est-elle complétée (readyState=4) ?
			if ( cdc.xhrJson.readyState == 4 ) {
				// La requête AJAX est-elle complétée avec succès (status=200) ?
				if ( cdc.xhrJson.status != 200 ) {
					// Affichage du message d'erreur.
					alert ('Erreur (code=' + cdc.xhrJson.status + '): La requête HTTP n\'a pu être complétée.');
				} else {
					// Création de l'objet JavaScript à partir de l'expression JSON.
					try {
						cdc.reperes = JSON.parse( cdc.xhrJson.responseText );
					} catch (e) {
						alert('ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
						// Fin de la fonction.
						return;
					}

					// Y a-t-il eu une erreur côté serveur ?
					if ( cdc.reperes.erreur ) {
						// Affichage du message d'erreur.
						alert (msgErreur = 'Erreur: ' + cdc.reperes.erreur.message);
					} else {
						cdc.controleurChargement("zap");
					}
				}
			}
		},  // Fin de "affZapCallback"
		
	};
}

// Gestionnaire d'événements pour le chargement du DOM.
window.addEventListener('DOMContentLoaded', function() {
	var cdc = com.dinfogarneau.cours526;
	console.log('DOM chargé.');
	// On informe le contrôleur (une simple fonction) que le DOM est chargé.
	cdc.controleurChargement("dom");
	cdc.affZap();
	cdc.chargerScriptAsync('https://maps.googleapis.com/maps/api/js?sensor=true&callback=com.dinfogarneau.cours526.apiGoogleMapCharge', null);
	cdc.chargerScriptAsync('js/async.js', cdc.controleurChargement("async"));
}, false);