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
try {
	$json = file_get_contents("php://input");
	$post = json_decode($json);

} catch (Exception $ex) {
	echo "{\n";
	echo "\t\"erreur\": {\n";
	echo "\t\t\"message\": ".json_encode("Erreur inattendue lors de la lecture des données envoyées : ".$ex->getMessage())."\n";
	echo "\t}\n";
	echo "}\n";
}
try {
	$req = $connBD->prepare("INSERT INTO avis (zap, message) VALUES (:zap, :message)");
	$req->execute(array(
		"zap" => $post->zap,
		"message" => $post->message
		));	
} catch (PDOException $e) {
	echo "{\n";
	echo "\t\"erreur\": {\n";
	echo "\t\t\"message\": ".json_encode("Erreur lors de l'insertion de l'avis : ".$e->getMessage())."\"\n";
	echo "\t}\n";
	echo "}\n";
}
// Exporter les messages seulement si la récupération des messages a fonctionné
if ($req !== null) {
	echo "{\n";
	echo "\t\"message\": ".json_encode($post->message)."\n";
	echo "}\n";		
}
?>