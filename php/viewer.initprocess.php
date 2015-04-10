<?php

// libs and classes
include('../php/viewer.error.php');
include('../php/class.connection.php');
include('../php/class.query.php');
include('../php/class.group.php');
include('../php/class.parameter.php');
include('../php/class.lnre.php');
include('../libs/tcpdf/tcpdf.php');

// constant
define('PUBLISH_PATH', '../publish/');
define('FILE', $_GET['file']);
define('FILENAME', $_GET['file'].'.lnre');

// check file
if (!FILE) {
	ErrorMessage::DisplayMessage(1);
}

// check file exist
if (!file_exists(PUBLISH_PATH . FILENAME)) {
	ErrorMessage::DisplayMessage(2);
}

// read lnre file
$source = LNRE::Open(PUBLISH_PATH . FILENAME);
$source = json_decode($source, true);

if (!is_array($source)) {
	ErrorMessage::DisplayMessage(3);
}

?>