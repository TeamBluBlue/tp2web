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
	};
}