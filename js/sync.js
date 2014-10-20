// Définition du namespace com.dinfogarneau.cours526 si nécessaire
if(typeof window.com == 'undefined') {
	window.com = {};
}
if(typeof com.dinfogarneau == 'undefined') {
	com.dinfogarneau = {};
}
if(typeof com.dinfogarneau.cours526 == 'undefined') {
	com.dinfogarneau.cours526 = {
		
		// Objet JSON qui contient les états de chargement des éléments à charger
		"elementsCharges" : {"dom": false, "zap": false, "arrondissements": false, "api-google-map": false, "async": false},
		// Objet XHR qui permet de retourner des données au format JSON (pour les ZAP et les avis)
		"xhrJsonGet" : null,
		// Objet XHR qui permet de retourner des données au format XML (pour les arrondissements)
		"xhrXmlGet" : null,
		// Variable qui contient la liste des ZAP au format JSON
		"reperes" : null,
		
		// Permet de charger de manière asynchrone un script
		// et d'appeler une fonction de callback après le chargement
		// "urlFichier" : URL vers le script à aller récupérer
		// "callbackFct" : fonction qui doit être appelée une fois la requête terminée
		"chargerScriptAsync" : function (urlFichier, callbackFct) {
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
		"controleurChargement" : function (nouvElemCharge, valeur) {
			var cdc = com.dinfogarneau.cours526;

			console.log('controleurChargement: Nouvel élément chargé "' + nouvElemCharge + '".');
			// Vérifier que le nouvel élément chargé existe dans l'objet JSON "elementsCharges"
			if (typeof cdc.elementsCharges[nouvElemCharge] != "undefined") {
				cdc.elementsCharges[nouvElemCharge] = valeur;
				
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
		"apiGoogleMapCharge" : function () {
				console.log('API Google Map chargé.');
				com.dinfogarneau.cours526.controleurChargement("api-google-map", true);
		},
		
		// Permet d'obtenir les données formant les ZAP
		"chargerDonneesZap" : function () {
			var cdc = com.dinfogarneau.cours526;
			var erreur = false;

			// Tentative de création de l'objet XMLHttpRequest
			try  {
				cdc.xhrJsonGet = new XMLHttpRequest();
			} catch (e) {
				alert('Erreur: Impossible de créer l\'objet XMLHttpRequest');
				erreur = true;
				cdc.controleurChargement("zap", null);
			}
			
			// S'il n'y a pas d'erreur, continuer la création de la requête
			if (!erreur)
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
					cdc.controleurChargement("zap", null);				
				} else {
					// Création de l'objet JavaScript à partir de l'expression JSON.
					try { 
						cdc.reperes = JSON.parse( xhr.responseText );
					} catch (e) {
						alert('ERREUR: La réponse AJAX n\'est pas une expression JSON valide.');
						// Fin de la fonction.
						cdc.controleurChargement("zap", null);
						return;
					}

					// Y a-t-il eu une erreur côté serveur ?
					if ( cdc.reperes.erreur ) {
						// Affichage du message d'erreur.
						alert('Erreur: ' + cdc.reperes.erreur.message);
						cdc.controleurChargement("zap", null);
					} else {
						cdc.controleurChargement("zap", true);
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
				cdc.controleurChargement("arrondissements", null);
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
				{
					alert( 'Erreur: La requête HTTP a échoué (code=' + xhr.status +  ')' );
					cdc.controleurChargement("arrondissements", null);
				}
				else
				{
					cdc.controleurChargement("arrondissements", true);
				}
			}
		}
	};
}
// Gestionnaire d'événements pour le chargement du DOM.
window.addEventListener('DOMContentLoaded', function() {
		var cdc = com.dinfogarneau.cours526;

		console.log('DOM chargé.');
		// On informe le contrôleur (une simple fonction) que le DOM est chargé.
		cdc.controleurChargement("dom", true);
		// Chargement asynchrone de l'API Google Map (requiert le DOM).
		// Le callback après le chargement est géré par l'API lui-même
		// avec l'appel de la fonction "apiGoogleMapCharge".
		// Le chargement de cet API implique le chargement d'autres APIs liés de manière asynchrone;
		// l'élément "body" doit exister.
		cdc.chargerDonneesArr();
		cdc.chargerDonneesZap();
		cdc.chargerScriptAsync('https://maps.googleapis.com/maps/api/js?sensor=true&callback=com.dinfogarneau.cours526.apiGoogleMapCharge&libraries=geometry', null);
		cdc.chargerScriptAsync('js/async.js', cdc.controleurChargement("async",true));
	}, false);