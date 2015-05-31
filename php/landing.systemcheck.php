<?php

require 'key.php';

$result = array(
	'LNRELibraryAvailable' => false,
	'ServicesSourceLibraryAvailable' => false,
	'ServicesSourceFileReadable' => false,
	'ServicesSourceFileWritable' => false,
	'publishFolderReadable' => false,
	'publishFolderWritable' => false,
	'phpMysqli' => false,
	'phpOci8' => false,
	'phpSybase' => false,
	'servicesKeySecure' => false,
	'designerKeySecure' => false
);

if (file_exists('../php/class.lnre.php'))           $result['LNRELibraryAvailable'] = true;
if (file_exists('../php/class.servicessource.php')) $result['ServicesSourceLibraryAvailable'] = true;
if (is_readable('../services/services.src'))        $result['ServicesSourceFileReadable'] = true;
if (is_writable('../services/services.src'))        $result['ServicesSourceFileWritable'] = true;
if (is_readable('../publish/'))                     $result['publishFolderReadable'] = true;
if (is_writable('../publish/'))                     $result['publishFolderWritable'] = true;
if (extension_loaded('mysqli'))                     $result['phpMysqli'] = true;
if (extension_loaded('oci8'))                       $result['phpOci8'] = true;
if (extension_loaded('sybase'))                     $result['phpSybase'] = true;
if (SERVICES_KEY !== 'abc123')                      $result['servicesKeySecure'] = true;
if (DESIGNER_KEY !== 'xyz789')                      $result['designerKeySecure'] = true;

echo json_encode($result);

?>