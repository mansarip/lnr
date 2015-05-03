<?php

error_reporting(0);
session_start();

if ($_SESSION['logged']) {
	$filename = $_GET['file'].'.lnre';
	$source = '../designer/temp/temp_'.$_GET['id'].'.lnre';

	header("Pragma: public");
	header("Expires: 0");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0"); 
	header("Content-Type: application/force-download");
	header("Content-Type: application/octet-stream");
	header("Content-Type: application/download");
	header("Content-Disposition: attachment;filename=".$filename);
	header("Content-Transfer-Encoding: binary ");

	echo file_get_contents($source);
}

?>