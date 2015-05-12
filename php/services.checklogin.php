<?php

session_start();

if (isset($_SESSION['logged']) && $_SESSION['logged']) {

	include('../php/class.servicessource.php');
	$source = ServicesSource::Read('../services/services.src');
	$source = json_decode($source, true);
	
	// invalid source
	if (!$source) {
		$response['status'] = 2;

	// valid source
	} else {
		$response['status'] = 1;
		$response['source'] = $source;
	}

} else {
	$response['status'] = 0;
}

echo json_encode($response);

?>