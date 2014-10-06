<?php
header("Content-type: text/plain");
$xml = simplexml_load_file("http://donnees.ville.quebec.qc.ca/Handler.ashx?id=29&f=KML");
foreach ($xml->Document->Folder->Placemark->children() as $key => $placemark)
{
	var_dump($key);
	foreach ($placemark as $key2 => $enfant) {
		echo "\t";
		var_dump($key2);
		foreach ($enfant as $key3 => $bebe) {
			echo "\t\t";
			var_dump($bebe->attributes()[0]);
		}
	}
	echo "\n";
}
echo "CREATE TABLE IF NOT EXISTS `Zap`(

);

";
$bdd->prepare("INSERT INTO `Zap` (name,snippet,description,) VALUES ()";
foreach($xml->Document->Folder->Placemark as $placemark)
{
	echo "('".$placemark->name."','".$placemark->snippet."','".$placemark->description."','";
	echo "),
";
}
?>