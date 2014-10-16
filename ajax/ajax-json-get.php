<?php
// Retourne du contenu en format JSON.
header("Content-type: application/json; charset=utf-8");

// Force l'expiration immédiate de la page au niveau du navigateur Web; elle n'est pas conservée en cache.
header("Expires: Thu, 19 Nov 1981 08:52:00 GMT");
header("Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0");
header("Pragma: no-cache");

require_once("../include/param-bd.inc.php");

try {
	$connBD = new PDO("mysql:host=$dbHote;dbname=$dbNom", $dbUtilisateur, $dbMotPasse, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
	$connBD->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
} catch (PDOException $e) {
	$erreur = "Erreur lors de la connexion à la BD :\n".$e->getMessage();
}
if (empty($erreur))
{
	if($_GET["req"] == "zap")
	{
		echo "[\n";
		$xml = simplexml_load_file("http://donnees.ville.quebec.qc.ca/Handler.ashx?id=29&f=KML");
		$nb = $xml->Document->Folder->Placemark->count();
		$i = 0;
		foreach($xml->Document->Folder->Placemark as $placemark)
		{
			$zapNom = $placemark->name;
			$i++;
			$coordonnees = split(",", $placemark->Point->coordinates);

			$zapLong = trim($coordonnees[0]);
			$zapLat = trim($coordonnees[1]);

			if(!empty($zapLat) && !empty($zapLong))
			{
				echo "\t{\n";
				echo "\t\t\"nom\": \"$zapNom\",\n";
				$nomsRemplacement = array("NOM_BATI" => "nomBati", "ARROND" => "arrond", "NO_CIV" => "noCiv", "RUE" => "rue");
				foreach($placemark->ExtendedData->SchemaData->SimpleData as $sd)
				{
					echo "\t\t\"".$nomsRemplacement[(string) $sd->attributes()["name"]]."\": \"$sd\",\n";
				}
				echo "\t\t\"lat\": \"$zapLat\",\n";
				echo "\t\t\"long\": \"$zapLong\"\n";
				echo "\t}";
				if($i < $nb)
				{
					echo ",";
				}
				echo "\n";
			}

		}
		echo "]\n";
	}
	elseif ($_GET["req"] == "avis") {

		try {
			$req = $connBD->prepare("SELECT message FROM avis WHERE zap = :zap");
			$req->execute(array(
				"zap" => $_GET["borne"] // C'est la borne identity
				));	
		} catch (PDOException $e) {
			$erreur = "Erreur lors de la lecture des messages :\n".$e->getMessage();
		}
		if(empty($erreur))
		{
			echo "[\n";
			$messages = $req->fetchAll();
			$count = count($messages);
			for ($i=0; $i < $count; $i++) { 
				echo "\t{\n";
				echo "\t\t\"message\": ".json_encode($messages[$i]["message"])."\n";
				echo "\t}";
				if($i < $count-1)
				{
					echo ",";
				}
				echo "\n";
			}
			echo "]\n";

		}
		else
		{
			echo "\t{\n";
			echo "\t\t\"erreur\": {\n";
			echo "\t\t\t\"message\":".json_encode($erreur)."\n";
			echo "\t\t}\n";
			echo "\t}\n";
		}
	}
}
else
{
	echo "\t{\n";
	echo "\t\t\"erreur\": {\n";
	echo "\t\t\t\"message\":".json_encode($erreur)."\n";
	echo "\t\t}\n";
	echo "\t}\n";
}
?>