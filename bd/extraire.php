<?php
header("Content-type: text/html; charset=utf-8");
$xml = simplexml_load_file("http://donnees.ville.quebec.qc.ca/Handler.ashx?id=29&f=KML");

include("../include/param-bd.inc.php");

try {
	$connBD = new PDO("mysql:host=$dbHote;dbname=$dbNom", $dbUtilisateur, $dbMotPasse, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
	$connBD->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
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
			latitude DECIMAL(18,14),
			longitude DECIMAL(18,14),
			PRIMARY KEY (nom)
			) ENGINE=InnoDB
EOSQL;
	$reqCreationTableAvis = <<<EOSQL
			CREATE TABLE IF NOT EXISTS avis(
			id INT NOT NULL AUTO_INCREMENT,
			zap VARCHAR(7),
			message TEXT,
			PRIMARY KEY (id),
			CONSTRAINT FK_zap FOREIGN KEY (zap) REFERENCES zap(nom))
EOSQL;
	
	$res = $connBD->exec($reqCreationTableZap);
	
	if ($res !== false){
		$res = $connBD->exec($reqCreationTableAvis);
		
		if ($res !== false){
			echo "Tables créées avec succès!<br/>";
		}
		else{
			echo "La table des avis n'a pas été créée.<br/>";
		}
	}
	else{
		echo "La table des ZAP n'a pas été créée.<br/>";
	}
	
} catch (PDOException $e) {
	echo "La création des tables n'a pas fonctionné :<br />\n".$e->getMessage();
} catch (Exception $ex) {
	echo "Une erreur inattendue s'est produite :<br />\n".$e->getMessage();
}

//try{
//	$connBD->exec("ALTER TABLE avis DROP CONSTRAINT FK_zap");
//} catch (PDOException $e) {
//	echo "La clé étrangère de la table avis n'a pu être supprimée :<br />\n".$e->getMessage();
//}

try{
	$connBD->exec("DELETE FROM zap");
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
	
	foreach ($placemark->ExtendedData->SchemaData as $schemaData){
		$arrondissement = $schemaData->SimpleData[0];
		$noCivil = $schemaData->SimpleData[1];
		$nomBatiment = $schemaData->SimpleData[2];
		$rue = $schemaData->SimpleData[3];
	}
	
	$chaineCoordonnees = $placemark->Point->coordinates;
	$elementsCoordonnes = split(",", $chaineCoordonnees);
	
	if (count($elementsCoordonnes) < 2){
		$lat = null;
		$long = null;
	}
	else{
		$lat = (float) $elementsCoordonnes[0];
		$long = (float) $elementsCoordonnes[1];
	}
	
	if ($lat !== null && $long !== null){
			try{
			$prepZap->execute(array(
				"nom" => $nom,
				"arrondissement" => $arrondissement,
				"num_civil" => $noCivil,
				"nom_batiment" => $nomBatiment,
				"rue" => $rue,
				"latitude" => $lat,
				"longitude" => $long
			));
		} catch (PDOException $e) {
			echo "Le zap $nom n'a pu être ajouté à la BD :<br />\n".$e->getMessage();
		}
	}
}
