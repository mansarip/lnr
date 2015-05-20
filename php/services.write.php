<?php

/**
 * PENTING : Hanya untuk yang dah logged in sahaja
 */
session_start();

if ($_SESSION['logged']) {
	require 'class.servicessource.php';

	$data = $_POST['data'];
	$data = ServicesSource::Encrypt($data);

	$file = '../services/services.src';

	// check file exist
	if (!file_exists($file)) {
		$response['status'] = 0;
		$response['message'] = 'Missing source file!';
		exit;
	}

	// check file is writable
	if (!is_writable($file)) {
		$response['status'] = 0;
		$response['message'] = 'Unable to write source file. Permission denied!';
		exit;
	}

	// write file
	$handler = fopen($file, 'w');
	fwrite($handler, $data);
	fclose($handler);

	$response['status'] = 1;
	$response['message'] = 'Success';

} else {
	$response['status'] = 0;
	$response['message'] = 'Invalid session!';
}

echo json_encode($response);

?>