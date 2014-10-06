		// Indique quels éléments ont déjà été chargés.
		var elementsCharges = {"dom": false, "donnees": false, "api-google-map": false};

		// Fonction contrôlant le chargement asynchrone de divers éléments.
		function controleurChargement(nouvElemCharge) {
			console.log('controleurChargement: Nouvel élément chargé "' + nouvElemCharge + '".');
			// Est-ce que c'est un élément dont le chargement doit être contrôlé ?
			if (typeof elementsCharges[nouvElemCharge] != "undefined") {
				// Chargement effectué pour cet élément.
				elementsCharges[nouvElemCharge] = true;
				// Est-ce que tous les éléments sont chargés ?
				var tousCharge = true;
				for (var elem in elementsCharges) {
					if ( ! elementsCharges[elem] )
						tousCharge = false;
				}
				// Si tous les éléments ont été chargés, appel de la fonction qui
				// fait le traitement post-chargement.
				if (tousCharge) {
					console.log('controleurChargement: Tous les éléments ont été chargés.');
					traitementPostChargement();
				} else {
					console.log('controleurChargement: Il reste encore des éléments à charger.');
				}
			}
		}

		// Gestionnaire d'événements pour le chargement du DOM.
		window.addEventListener('DOMContentLoaded', function() {
				console.log('DOM chargé.');
				// On informe le contrôleur (une simple fonction) que le DOM est chargé.
				controleurChargement("dom");
				// Chargement asynchrone de l'API Google Map (requiert le DOM).
				// Le callback après le chargement est géré par l'API lui-même
				// avec l'appel de la fonction "apiGoogleMapCharge".
				// Le chargement de cet API implique le chargement d'autres APIs liés de manière asynchrone;
				// l'élément "body" doit exister.
				chargerScriptAsync('https://maps.googleapis.com/maps/api/js?sensor=true&callback=apiGoogleMapCharge', null);
			}, false);

		// Chargement asynchrone des données.
		// Utilisation d'une fonction anonyme pour indiquer que le chargement est complété.
		// Pour retarder le chargement des données, utiliser plutôt le script :
		// "http://deptinfo.cegepgarneau.ca/420-526/script-loading/donnees-pause.php".
		chargerScriptAsync('js/donnees.js', function () {
				console.log('Données chargé.');
				// On informe le contrôleur (une simple fonction) que l'API Google Map est chargé.
				controleurChargement("donnees");	
			});

		// Fonction appelée pour indiquer que l'API Google Map est chargé.
		function apiGoogleMapCharge() {
				console.log('API Google Map chargé.');
				// On informe le contrôleur (une simple fonction) que l'API Google Map est chargé.
				controleurChargement("api-google-map");
		}

		// Fonction responsable des traitements post-chargement.
		function traitementPostChargement() {
			console.log('Traitement post-chargement.');
			// Appel de la fonction qui initialise la carte.
			initCarte();
			// Affichage des repères sur la carte.
			afficherReperesCarte();
			// Affichage des coordonnees des repères en HTML.
			genererInterfaceHtml();
		}

		// Référence à la carte Google (variable globale).
		var carte;

		// Fonction responsable de charger la carte.
		function initCarte() {
			// Position initiale du centre de la carte (Cégep Garneau). 
			var posCentre = new google.maps.LatLng(46.793508,-71.263268);
			// Object JSON pour les options de la carte.
			var optionsCarte = {
				"zoom": 17,
				"center": posCentre,
				"mapTypeId": google.maps.MapTypeId.ROADMAP
			};

			// Création de la carte Google (avec les options)
			// tout en spécifiant dans quel élément HTML elle doit être affichée.
			// Il ne faut pas redéclarer la variable "carte" car elle est globale.
			carte = new google.maps.Map(document.getElementById("carte-canvas"), optionsCarte);
			
		}  // Fin de la fonction "initCarte"
		
		// Fonction responsable d'afficher les repères sur la carte.
		function afficherReperesCarte() {
			// Parcours des repères.
			for (var i=0; i < reperes.length; i++) {
				// Position du repère.
				var posRepere = new google.maps.LatLng(reperes[i].lat, reperes[i].long);
				// Création du repère sur la carte.
				var repere = new google.maps.Marker( {"position": posRepere, "map": carte} );
			}
		}

		// Fonction responsable de générer l'interface graphique HTML.
		function genererInterfaceHtml() {
			// La liste HMTL des repères. 
			var listeReperes = document.getElementById('liste-reperes');
			// Parcours des repères.
			for (var i=0; i < reperes.length; i++) {
				var nouvItem = document.createElement('li');
				nouvItem.textContent = reperes[i].lat + ', ' + reperes[i].long;
				listeReperes.appendChild(nouvItem);
			}
		}