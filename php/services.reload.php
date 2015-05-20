<?php

/**
 * PENTING : Hanya untuk yang dah logged in sahaja
 */
session_start();

if ($_SESSION['logged']) {

	require 'class.servicessource.php';

	$sourcefile = '../services/services.src';
	
	// cek file wujud ke tidak
	if (!file_exists($sourcefile)) {
		$response['status'] = 0;
		$response['message'] = 'Source file not found!';
		exit;
	}

	// cek file boleh dibaca ke tidak
	if (!is_readable($sourcefile)) {
		$response['status'] = 0;
		$response['message'] = 'Unable to read source file!';
		exit;
	}

	$raw = file_get_contents($sourcefile);
	$source = ServicesSource::Decrypt($raw);
	echo $source;

} else {
	http_response_code(403);
}


?>