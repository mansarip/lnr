<?php

$result = array(
	'LNRELibraryAvailable' => false,
	'ServicesSourceLibraryAvailable' => false,
	'ServicesSourceFileReadable' => false,
	'ServicesSourceFileWritable' => false,
	'publishFolderReadable' => false,
	'publishFolderWritable' => false
);

if (file_exists('../php/class.lnre.php'))           $result['LNRELibraryAvailable'] = true;
if (file_exists('../php/class.servicessource.php')) $result['ServicesSourceLibraryAvailable'] = true;
if (is_readable('../services/services.src'))        $result['ServicesSourceFileReadable'] = true;
if (is_writable('../services/services.src'))        $result['ServicesSourceFileWritable'] = true;
if (is_readable('../publish/'))                     $result['publishFolderReadable'] = true;
if (is_writable('../publish/'))                     $result['publishFolderWritable'] = true;

echo json_encode($result);

?>