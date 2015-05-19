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

		// dapatkan sumber views
		$response['source']['view']['home']                                 = trim(preg_replace('/\s+/', ' ', file_get_contents('../services/home.html')));
		$response['source']['view']['wizard']                               = trim(preg_replace('/\s+/', ' ', file_get_contents('../services/wizard.html')));
		$response['source']['view']['globalConnectionDetails']              = trim(preg_replace('/\s+/', ' ', file_get_contents('../services/globalconnection.details.html')));
		$response['source']['view']['globalConnectionDetailsClosingButton'] = trim(preg_replace('/\s+/', ' ', file_get_contents('../services/globalconnection.buttons.html')));
	}

} else {
	$response['status'] = 0;
}

echo json_encode($response);

?>