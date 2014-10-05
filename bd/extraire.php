<?php 
$xml = simplexml_load_file("http://donnees.ville.quebec.qc.ca/Handler.ashx?id=29&f=KML");
echo "INSERT INTO blahblah () VALUES"
foreach($xml->Document->Folder->Placemark as $placemark)
{
	echo "(".$placemark);
	echo "<br />";
}
?>