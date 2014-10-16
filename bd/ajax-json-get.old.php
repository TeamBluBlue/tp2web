<?php
// Retourne du contenu en format JSON.
header("Content-type: application/json; charset=utf-8");

// Force l'expiration immédiate de la page au niveau du navigateur Web; elle n'est pas conservée en cache.
header("Expires: Thu, 19 Nov 1981 08:52:00 GMT");
header("Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0");
header("Pragma: no-cache");

$xml = simplexml_load_file("http://donnees.ville.quebec.qc.ca/Handler.ashx?id=29&f=KML");
echo "[\n";
$nb = $xml->Document->Folder->Placemark->count();
$i = 0;
foreach($xml->Document->Folder->Placemark as $placemark)
{
	$i++;
	$coordonnees = split(",", $placemark->Point->coordinates);

	$zapLong = trim($coordonnees[0]);
	$zapLat = trim($coordonnees[1]);

	if(!empty($zapLat) && !empty($zapLong))
	{
		echo "\t{\n";
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
?>