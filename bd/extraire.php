<?php
header("Content-type: text/html; charset=utf-8");
$xml = simplexml_load_file("http://donnees.ville.quebec.qc.ca/Handler.ashx?id=29&f=KML");

include("../include/param-bd.inc.php");

try {
	$connBD = new PDO("mysql:host=$dbHote;dbname=$dbNom", $dbUtilisateur, $dbMotPasse, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
	$connBD->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	echo "L'objet PDO a été créé!<br/>";
} catch (PDOException $e) {
	echo "Erreur lors de la connexion à la BD :<br />\n".$e->getMessage();
}

try {
	$reqCreationTableZap = <<<EOSQL
			CREATE TABLE IF NOT EXISTS zap(
			nom VARCHAR(7) NOT NULL,
			arrondissement VARCHAR(50),
			num_civil VARCHAR(5),
			nom_batiment VARCHAR(50),
			rue VARCHAR(50),
			latitude DECIMAL(18,14) NOT NULL,
			longitude DECIMAL(18,14) NOT NULL,
			PRIMARY KEY (nom)
			) ENGINE=InnoDB
EOSQL;
	$reqCreationTableAvis = <<<EOSQL
			CREATE TABLE IF NOT EXISTS avis(
			id INT NOT NULL AUTO_INCREMENT,
			zap VARCHAR(7) NOT NULL,
			message TEXT NOT NULL,
			PRIMARY KEY (id),
			CONSTRAINT FK_zap FOREIGN KEY (zap) REFERENCES zap(nom))
EOSQL;
	
	$connBD->exec($reqCreationTableZap);
	$connBD->exec($reqCreationTableAvis);
	
	echo "Les tables ont été créées!<br/>";
} catch (PDOException $e) {
	echo "La création des tables n'a pas fonctionné :<br />\n".$e->getMessage();
} catch (Exception $ex) {
	echo "Une erreur inattendue s'est produite :<br />\n".$e->getMessage();
}

try{
	$connBD->exec("ALTER TABLE avis DROP FOREIGN KEY FK_zap");
	echo "La clé étrangère a été supprimée!<br/>";
} catch (PDOException $e) {
	echo "La clé étrangère de la table avis n'a pu être supprimée :<br />\n".$e->getMessage();
}

try{
	$connBD->exec("DELETE FROM zap");
	echo "La table zap a été vidée!<br/>";
} catch (PDOException $e) {
	echo "Un problème est survenu lors du vidage de la table des zap :<br />\n".$e->getMessage();
}

$reqAjoutZap = <<<EOSQL
INSERT INTO zap (nom, arrondissement, num_civil, nom_batiment, rue, latitude, longitude)
VALUES(:nom, :arrondissement, :num_civil, :nom_batiment, :rue, :latitude, :longitude)
EOSQL;
$prepZap = $connBD->prepare($reqAjoutZap);

foreach($xml->Document->Folder->Placemark as $placemark)
{
	$nom = $placemark->name;

	$nomsRemplacement = array("NOM_BATI" => "nomBatiment", "ARROND" => "arrondissement", "NO_CIV" => "noCivil", "RUE" => "rue");
	$infos = array();
	foreach ($placemark->ExtendedData->SchemaData->SimpleData as $simpleData){
		$infos[$nomsRemplacement[(string) $simpleData->attributes()["name"]]] = $simpleData;
	}
	$chaineCoordonnees = $placemark->Point->coordinates;
	$elementsCoordonnes = split(",", $chaineCoordonnees);
	
	if (count($elementsCoordonnes) < 2){
		$lat = null;
		$long = null;
	}
	else{
		$long = (float) trim($elementsCoordonnes[0]);
		$lat = (float) trim($elementsCoordonnes[1]);
	}
	
	if ($lat !== null && $long !== null){
		try{
			$prepZap->execute(array(
				"nom" => $nom,
				"arrondissement" => $infos["arrondissement"],
				"num_civil" => $infos["noCivil"],
				"nom_batiment" => $infos["nomBatiment"],
				"rue" => $infos["rue"],
				"latitude" => $lat,
				"longitude" => $long
			));
		} catch (PDOException $e) {
			echo "Le zap $nom n'a pu être ajouté à la BD :<br />\n".$e->getMessage()."<br />$noCivil\n";
		}
	}
}
echo "Les nouveaux zap ont été enregistrés dans la BD!<br/>";

$prepZap->closeCursor();

try{
	$connBD->exec("ALTER TABLE avis ADD CONSTRAINT FK_zap FOREIGN KEY (zap) REFERENCES zap(nom)");
	echo "La clé étrangère de la table avis a été rajoutée!<br/>";
} catch (PDOException $e) {
	echo "La clé étrangère de la table avis n'a pu être rajoutée :<br />\n".$e->getMessage();
}