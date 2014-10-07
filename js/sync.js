if(typeof window.com == 'undefined') {
	window.com = {};
}
if(typeof com.dinfogarneau == 'undefined') {
	com.dinfogarneau = {};
}
if(typeof com.dinfogarneau.cours526 == 'undefined') {
	com.dinfogarneau.cours526 = {
		// Permet de charger de manière asynchrone un script
		// et d'appeler une fonction de callback après le chargement.
		"chargerScriptAsync" : function (urlFichier, callbackFct) {
			var script = document.createElement('script');
			script.src = urlFichier;
			script.async = true;
			// Fonction de callback (optionnel) après le chargement asynchrone du script.
			if (typeof callbackFct == "function") {
				script.addEventListener('load', callbackFct, false);
			}
			document.documentElement.firstChild.appendChild(script);
		},

		// Indique quels éléments ont déjà été chargés.
		"elementsCharges" : {"dom": false, "donnees": false, "api-google-map": false},

		// Fonction contrôlant le chargement asynchrone de divers éléments.
		"controleurChargement" : function (nouvElemCharge) {
			console.log('controleurChargement: Nouvel élément chargé "' + nouvElemCharge + '".');
			// Est-ce que c'est un élément dont le chargement doit être contrôlé ?
			if (typeof this.elementsCharges[nouvElemCharge] != "undefined") {
				// Chargement effectué pour cet élément.
				this.elementsCharges[nouvElemCharge] = true;
				// Est-ce que tous les éléments sont chargés ?
				var tousCharge = true;
				for (var elem in this.elementsCharges) {
					if ( ! this.elementsCharges[elem] )
						tousCharge = false;
				}
				// Si tous les éléments ont été chargés, appel de la fonction qui
				// fait le traitement post-chargement.
				if (tousCharge) {
					console.log('controleurChargement: Tous les éléments ont été chargés.');
					this.traitementPostChargement();
				} else {
					console.log('controleurChargement: Il reste encore des éléments à charger.');
				}
			}
		},
		"xhr" : {},
		"reperes" : {},
		"chargerDonneesZap" : function () {
			// Création de l'objet XMLHttpRequest.
			this.xhr = new XMLHttpRequest();

			// Fonction JavaScript à exécuter lorsque l'état de la requête HTTP change.
			this.xhr.onreadystatechange = this.chargerDonneesZapCallback;
			
			// Préparation de la requête HTTP-GET en mode asynchrone (true).
			this.xhr.open('GET', 'ajax/ajax-json-get.php', true);
			
			// Envoie de la requête au serveur en lui passant null (aucun contenu);
			// lorsque la requête changera d'état; la fonction "afficherInfoProfAJAX_callback" sera appelée.
			this.xhr.send(null);

		},
		// Callback de la requête AJAX qui demande et affiche les informations d'un professeur.
		"chargerDonneesZapCallback" : function () {
			var xhr = com.dinfogarneau.cours526.xhr;
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
						cdc.reperes = JSON.parse( xhr.responseText );
					} catch (e) {
						alert('ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
						// Fin de la fonction.
						return;
					}

					// Y a-t-il eu une erreur côté serveur ?
					if ( cdc.reperes.erreur ) {
						// Affichage du message d'erreur.
						var msgErreur = 'Erreur: ' + cdc.reperes.erreur.message;
						$('msg-erreur').textContent = msgErreur;
						
					} else {
						com.dinfogarneau.cours526.controleurChargement("donnees");
					}
				}
			}
		},
		
		// Fonction appelée pour indiquer que l'API Google Map est chargé.
		"apiGoogleMapCharge" : function () {
				console.log('API Google Map chargé.');
				// On informe le contrôleur (une simple fonction) que l'API Google Map est chargé.
				this.controleurChargement("api-google-map");
		}
	};
}
// Gestionnaire d'événements pour le chargement du DOM.
window.addEventListener('DOMContentLoaded', function() {
		console.log('DOM chargé.');
		// On informe le contrôleur (une simple fonction) que le DOM est chargé.
		com.dinfogarneau.cours526.controleurChargement("dom");
		// Chargement asynchrone de l'API Google Map (requiert le DOM).
		// Le callback après le chargement est géré par l'API lui-même
		// avec l'appel de la fonction "apiGoogleMapCharge".
		// Le chargement de cet API implique le chargement d'autres APIs liés de manière asynchrone;
		// l'élément "body" doit exister.
		com.dinfogarneau.cours526.chargerDonneesZap();
		com.dinfogarneau.cours526.chargerScriptAsync('https://maps.googleapis.com/maps/api/js?sensor=true&callback=com.dinfogarneau.cours526.apiGoogleMapCharge&libraries=geometry', null);
		com.dinfogarneau.cours526.chargerScriptAsync('js/async.js', null);
	}, false);