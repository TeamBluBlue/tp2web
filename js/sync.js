if(typeof window.com == 'undefined') {
	window.com = {};
}
if(typeof com.dinfogarneau == 'undefined') {
	com.dinfogarneau = {};
}
if(typeof com.dinfogarneau.cours526 == 'undefined') {
	com.dinfogarneau.cours526 = {
		// Contrôleur des éléments chargés
		"elementsCharges" : {"dom": false, "zap": false, "arrondissements": false, "api-google-map": false, "async": false},
		
		"xhrJsonGet" : null,
		"xhrXmlGet" : null,
		"reperes" : null,

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
		// Fonction contrôlant le chargement asynchrone de divers éléments.
		"controleurChargement" : function (nouvElemCharge) {
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
		"apiGoogleMapCharge" : function () {
				console.log('API Google Map chargé.');
				// On informe le contrôleur (une simple fonction) que l'API Google Map est chargé.
				com.dinfogarneau.cours526.controleurChargement("api-google-map");
		},
		"chargerDonneesZap" : function () {
			var cdc = com.dinfogarneau.cours526;

			// Variable indiquant s'il y a une erreur jusqu'à présent.
			var erreur = false;

			// Création de l'objet XMLHttpRequest.
			cdc.xhrJsonGet = new XMLHttpRequest();

			// Tentative de création de l'objet "XMLHttpRequest".
			try  {
				cdc.xhrJsonGet = new XMLHttpRequest();
			} catch (e) {
				alert('Erreur: Impossible de créer l\'objet XMLHttpRequest');
				erreur = true;
			}

			if ( ! erreur )
			{

				var xhr = cdc.xhrJsonGet;

				// Fonction JavaScript à exécuter lorsque l'état de la requête HTTP change.
				xhr.onreadystatechange = cdc.chargerDonneesZapCallback;
				
				// Préparation de la requête HTTP-GET en mode asynchrone (true).
				xhr.open('GET', 'ajax/ajax-json-get.php?req=zap', true);
				
				// Envoie de la requête au serveur en lui passant null (aucun contenu);
				// lorsque la requête changera d'état; la fonction "afficherInfoProfAJAX_callback" sera appelée.
				xhr.send(null);
			}

		},
		// Callback de la requête AJAX qui demande et affiche les informations d'un professeur.
		"chargerDonneesZapCallback" : function () {
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
						alert('Erreur: ' + cdc.reperes.erreur.message);						
					} else {
						cdc.controleurChargement("zap");
					}
				}
			}
		},
		

		"chargerDonneesArr" : function() {	
			var cdc = com.dinfogarneau.cours526;

			// Variable indiquant s'il y a une erreur jusqu'à présent.
			var erreur = false;

			// Tentative de création de l'objet "XMLHttpRequest".
			try  {
				cdc.xhrXmlGet = new XMLHttpRequest();
			} catch (e) {
				alert('Erreur: Impossible de créer l\'objet XMLHttpRequest');
				erreur = true;
			}
			
			// On continue si l'objet "XMLHttpRequest" a été créé avec succès.
			if ( ! erreur )
			{
				var xhr = cdc.xhrXmlGet;
				// Fonction à appeler lorsque l'état de la requête change (callback).
				xhr.onreadystatechange = cdc.chargerDonneesArrCallback;
				// Configuration de la requête (GET) en mode asynchrone (true).
				xhr.open('GET', "ajax/ajax-xml-get.php", true);
				// Envoie de la requête asynchrone (non bloquante) au serveur.
				// Note : "null" signifie que le corps de la requête est vide.
				xhr.send(null);
			}
		},
		// Fonction callback pour la requête AJAX;
		// elle est appelée à chaque fois que la requête change d'état.
		"chargerDonneesArrCallback" : function() {
			var cdc = com.dinfogarneau.cours526;

			var xhr = cdc.xhrXmlGet;
			// La requête est-elle complétée (readyState=4)  ?  Sinon, rien à faire pour le moment.
			if( xhr.readyState == 4 )
			{
				// Le code de retour d'une requête XHR est 200 (OK) si tout s'est bien déroulé.
				if ( xhr.status != 200 )
					alert( 'Erreur: La requête HTTP a échoué (code=' + xhr.status +  ')' );
				else
					cdc.controleurChargement("arrondissements");
			}
		}
	};
}
// Gestionnaire d'événements pour le chargement du DOM.
window.addEventListener('DOMContentLoaded', function() {
		var cdc = com.dinfogarneau.cours526;

		console.log('DOM chargé.');
		// On informe le contrôleur (une simple fonction) que le DOM est chargé.
		cdc.controleurChargement("dom");
		// Chargement asynchrone de l'API Google Map (requiert le DOM).
		// Le callback après le chargement est géré par l'API lui-même
		// avec l'appel de la fonction "apiGoogleMapCharge".
		// Le chargement de cet API implique le chargement d'autres APIs liés de manière asynchrone;
		// l'élément "body" doit exister.
		cdc.chargerDonneesArr();
		cdc.chargerDonneesZap();
		cdc.chargerScriptAsync('https://maps.googleapis.com/maps/api/js?sensor=true&callback=com.dinfogarneau.cours526.apiGoogleMapCharge&libraries=geometry', null);
		cdc.chargerScriptAsync('js/async.js', cdc.controleurChargement("async"));
	}, false);