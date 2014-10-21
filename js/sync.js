// Définition du namespace com.dinfogarneau.cours526 si nécessaire
if (typeof window.com == 'undefined') {
	window.com = {};
}
if (typeof com.dinfogarneau == 'undefined') {
	com.dinfogarneau = {};
}
if (typeof com.dinfogarneau.cours526 == 'undefined') {
	com.dinfogarneau.cours526 = {
		// Objet JSON qui contient les états de chargement des éléments à charger
		"elementsCharges": {
			"dom": false,
			"zap": false,
			"arrondissements": false,
			"api-google-map": false,
			"async": false
		},
		// Objet XHR qui permet de retourner des données au format JSON (pour les ZAP et les avis)
		// à l'aide d'une requête GET
		"xhrJsonGet" : null,
		// Objet XHR qui permet de retourner des données au format XML (pour les arrondissements)
		// à l'aide d'une requête GET
		"xhrXmlGet" : null,
		// Variable qui contient la liste des ZAP sous forme d'objet Javascript
		"reperes" : null,

		// Permet de charger de manière asynchrone un script
		// et d'appeler une fonction de callback après le chargement
		// "urlFichier" : URL vers le script à aller récupérer
		// "callbackFct" : fonction qui doit être appelée une fois la requête terminée
		"chargerScriptAsync": function (urlFichier, callbackFct) {
			var script = document.createElement('script');
			script.src = urlFichier;
			script.async = true;
			// Vérifier que le paramètre "callbackFct" est réellement une fonction avant
			// de l'appeler
			if (typeof callbackFct == "function") {
				script.addEventListener('load', callbackFct, false);
			}
			document.documentElement.firstChild.appendChild(script);
		},

		// Fonction contrôlant le chargement asynchrone de divers éléments
		// "nouvElemCharge" : nom de l'élément qui a été chargé
		// "valeur" : nouvel état de chargement de cet élément (true ou false)
		"controleurChargement": function (nouvElemCharge, valeur) {
			var cdc = com.dinfogarneau.cours526;

			console.log('controleurChargement: Nouvel élément chargé "' + nouvElemCharge + '".');
			// Est-ce que c'est un élément dont le chargement doit être contrôlé ?
			if (typeof cdc.elementsCharges[nouvElemCharge] != "undefined") {
				// Chargement effectué pour cet élément.
				cdc.elementsCharges[nouvElemCharge] = valeur;
				
				// Est-ce que tous les éléments sont chargés ?
				var tousCharge = true;
				// Vérifier que tous les éléments ont été chargés
				for (var elem in cdc.elementsCharges) {
					// Tous les éléments ne sont pas chargés si une seul d'entre eux ne l'est pas
					if (cdc.elementsCharges[elem] == false)
						tousCharge = false;
				}
				
				// Si tous les éléments ont été chargés, appel de la fonction qui
				// fait le traitement post-chargement
				if (tousCharge) {
					console.log('controleurChargement: Tous les éléments ont été chargés.');
					cdc.traitementPostChargement();
				} else {
					console.log('controleurChargement: Il reste encore des éléments à charger.');
				}
			}
		},
		
		// Fonction appelée pour indiquer que l'API Google Map est chargé
		"apiGoogleMapCharge": function () {
				console.log('API Google Map chargé.');
				com.dinfogarneau.cours526.controleurChargement("api-google-map", true);
		},
		
		// Permet d'obtenir les données formant les ZAP
		"chargerDonneesZap": function () {
			var cdc = com.dinfogarneau.cours526;
			var erreur = false;

			// Création de l'objet XMLHttpRequest.
			cdc.xhrJsonGet = new XMLHttpRequest();

			// Tentative de création de l'objet "XMLHttpRequest".
			try {
				cdc.xhrJsonGet = new XMLHttpRequest();
			} catch (e) {
				alert('Erreur: Impossible de créer l\'objet XMLHttpRequest');
				erreur = true;
				cdc.controleurChargement("zap", null);
			}

			// S'il n'y a pas d'erreur, continuer la création de la requête
			if (!erreur) {
				var xhr = cdc.xhrJsonGet;
				xhr.onreadystatechange = cdc.chargerDonneesZapCallback;
				xhr.open('GET', 'ajax/ajax-json-get.php?req=zap', true);
				xhr.send(null);
			}

		},
		
		// Fonction callback appelée suite à la réception d'une réponse pour la requête
		// des données sur les ZAP
		"chargerDonneesZapCallback": function() {
			var cdc = com.dinfogarneau.cours526;
			var xhr = cdc.xhrJsonGet;
			
			// Si la requête AJAX est complétée (readyState=4)
			if (xhr.readyState == 4) {
				
				// Si la requête AJAX n'a pas été complétée avec succès (status autre que 200),
				// afficher un message d'erreur, autrement poursuivre avec le traitement des données
				if (xhr.status != 200) {
					// Affichage du message d'erreur
					var msgErreur = 'Erreur (code=' + xhr.status + '): La requête HTTP n\'a pu être complétée.';
					alert(msgErreur);
					cdc.controleurChargement("zap", null);
				} else {
					// Création de l'objet JavaScript à partir de l'expression JSON
					try {
						cdc.reperes = JSON.parse(xhr.responseText);
					} catch (e) {
						alert('ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
						cdc.controleurChargement("zap", null);
						return;
					}

					// Vérifier s'il y a eu une erreur du côté serveur
					if (cdc.reperes.erreur) {
						alert('Erreur: ' + cdc.reperes.erreur.message);
						cdc.controleurChargement("zap", null);
					} else {
						cdc.controleurChargement("zap", true);
					}
				}
			}
		},

		// Permet d'obtenir les données formant les arrondissements
		"chargerDonneesArr": function() {
			var cdc = com.dinfogarneau.cours526;
			var erreur = false;

			// Tentative de création de l'objet XMLHttpRequest
			try {
				cdc.xhrXmlGet = new XMLHttpRequest();
			} catch (e) {
				alert('Erreur: Impossible de créer l\'objet XMLHttpRequest');
				erreur = true;
				cdc.controleurChargement("arrondissements", null);
			}

			// S'il n'y a pas d'erreur, continuer la création de la requête
			if (!erreur) {
				var xhr = cdc.xhrXmlGet;
				xhr.onreadystatechange = cdc.chargerDonneesArrCallback;
				xhr.open('GET', "ajax/ajax-xml-get.php", true);
				xhr.send(null);
			}
		},
		
		// Fonction callback appelée suite à la réception d'une réponse pour la requête
		// des données sur les arrondissements
		"chargerDonneesArrCallback": function() {
			var cdc = com.dinfogarneau.cours526;
			var xhr = cdc.xhrXmlGet;
			
			// Si la requête est complétée (readyState=4)
			if (xhr.readyState == 4) {
				
				// Si la requête AJAX n'a pas été complétée avec succès (status autre que 200),
				// afficher un message d'erreur, autrement poursuivre avec le traitement des données
				if (xhr.status != 200) {
					alert('Erreur: La requête HTTP a échoué (code=' + xhr.status + ')');
					cdc.controleurChargement("arrondissements", null);
				} else {
					cdc.controleurChargement("arrondissements", true);
				}
			}
		}
	};
}

// Gestionnaire d'événements pour le chargement du DOM
window.addEventListener('DOMContentLoaded', function() {
	var cdc = com.dinfogarneau.cours526;
	console.log('DOM chargé.');
	
	cdc.controleurChargement("dom", true);
	// Chargement asynchrone des arrondissements, des ZAP,
	// de l'API Google Map et du script asynchrone de l'application
	cdc.chargerDonneesArr();
	cdc.chargerDonneesZap();
	cdc.chargerScriptAsync('https://maps.googleapis.com/maps/api/js?sensor=true&callback=com.dinfogarneau.cours526.apiGoogleMapCharge&libraries=geometry', null);
	cdc.chargerScriptAsync('js/async.js', cdc.controleurChargement("async", true));
}, false);