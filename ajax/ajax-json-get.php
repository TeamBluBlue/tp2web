<?php
// Retourne du contenu en format JSON.
header("Content-type: application/json; charset=utf-8");

// Force l'expiration immédiate de la page au niveau du navigateur Web; elle n'est pas conservée en cache.
header("Expires: Thu, 19 Nov 1981 08:52:00 GMT");
header("Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0");
header("Pragma: no-cache");

require_once("../include/param-bd.inc.php");

// Connexion à la BD
try {
	$connBD = null;
	$connBD = new PDO("mysql:host=$dbHote;dbname=$dbNom", $dbUtilisateur, $dbMotPasse, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
	$connBD->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
	echo "{\n";
	echo "\t\"erreur\": {\n";
	echo "\t\t\"message\": ".json_encode("Erreur lors de la connexion à la BD : ".$e->getMessage())."\n";
	echo "\t}\n";
	echo "}\n";
}

if($_GET["req"] == "zap")
{
	// Début de l'exportation en JSON

	// Récupérer les ZAP de la BD
	try{
		// Rcupérer les ZAP seulement si la connexion à la BD a fonctionné
		if ($connBD !== null){
			$req = null;
			$req = $connBD->query("SELECT * FROM zap");
		}
	} catch (PDOException $e) {
		echo "{\n";
		echo "\t\"erreur\": {\n";
		echo "\t\t\"message\": ".json_encode("Erreur lors de la récupération des ZAP : ".$e->getMessage())."\"\n";
		echo "\t}\n";
		echo "}\n";
	}

	// Exporter les ZAP en JSON
	try{
		// Exporter les ZAP seulement si la récupération des ZAP a fonctionné
		if ($req !== null){
			// Variables servant à faire des traitements particuliers selon le numnéro
			// de rangée atteint
			$nbrRangees = $req->rowCount();
			$i = 1;
			
			echo "[\n";
			// Écrire chaque information sur une ligne différente pour chaque ZAP
			while ($zap = $req->fetch()){
				echo "\t{\n";
				echo "\t\t\"nom\": \"".$zap["nom"]."\",\n";
				echo "\t\t\"arrond\": \"".$zap["arrondissement"]."\",\n";
				echo "\t\t\"noCiv\": \"".$zap["num_civil"]."\",\n";
				echo "\t\t\"nomBati\": \"".$zap["nom_batiment"]."\",\n";
				echo "\t\t\"rue\": \"".$zap["rue"]."\",\n";
				echo "\t\t\"lat\": \"".$zap["latitude"]."\",\n";
				echo "\t\t\"long\": \"".$zap["longitude"]."\"\n";
				echo "\t}";
				
				// Ajouter une virgule suite à l'accolade fermante si ce ZAP
				// n'est pas le dernier
				if ($i < $nbrRangees){
					echo ",";
				}
				
				echo "\n";
				
				$i++;
			}
				echo "]\n";
			
			$req->closeCursor();
		}
	} catch (PDOException $e) {
		echo "{\n";
		echo "\t\"erreur\": {\n";
		echo "\t\t\"erreur\": ".json_encode("Erreur lors de l'exportation JSON des ZAP : ".$e->getMessage())."\n";
		echo "\t}\n";
		echo "}\n";
	} catch (Exception $ex) {
		echo "{\n";
		echo "\t\"erreur\": {\n";
		echo "\t\t\"message\": ".json_encode("Erreur inattendue lors de l'exportation JSON des ZAP : ".$ex->getMessage())."\n";
		echo "\t}\n";
		echo "}\n";
	}
// Fin de l'exportation JSON
}
elseif ($_GET["req"] == "avis") {

	try {
		$req = $connBD->prepare("SELECT message FROM avis WHERE zap = :zap");
		$req->execute(array(
			"zap" => $_GET["borne"] // C'est la borne identity
			));	
	} catch (PDOException $e) {
		echo "{\n";
		echo "\t\"erreur\": {\n";
		echo "\t\t\"message\": ".json_encode("Erreur lors de la récupération des messages : ".$e->getMessage())."\"\n";
		echo "\t}\n";
		echo "}\n";
	}
	try{
		// Exporter les messages seulement si la récupération des messages a fonctionné
		if ($req !== null){

				// Variables servant à faire des traitements particuliers selon le numnéro
			// de rangée atteint
			$nbrRangees = $req->rowCount();
			$i = 1;
			
			echo "[\n";
			while ($avis = $req->fetch()){
				echo "\t{\n";
				echo "\t\t\"message\": ".json_encode($avis["message"])."\n";
				echo "\t}";
				
				// Ajouter une virgule suite à l'accolade fermante si cet avis
				// n'est pas le dernier
				if ($i < $nbrRangees){
					echo ",";
				}
				
				echo "\n";
				
				$i++;

				echo "\n";
			}
			echo "]\n";
		}
		$req->closeCursor();

	} catch (PDOException $e) {
		echo "{\n";
		echo "\t\"erreur\": {\n";
		echo "\t\t\"erreur\": ".json_encode("Erreur lors de l'exportation JSON des ZAP : ".$e->getMessage())."\n";
		echo "\t}\n";
		echo "}\n";
	} catch (Exception $ex) {
		echo "{\n";
		echo "\t\"erreur\": {\n";
		echo "\t\t\"message\": ".json_encode("Erreur inattendue lors de l'exportation JSON des ZAP : ".$ex->getMessage())."\n";
		echo "\t}\n";
		echo "}\n";
	}
}
?>