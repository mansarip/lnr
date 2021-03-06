<?php

session_start();

if (isset($_SESSION['logged']) && $_SESSION['logged']) {

	include('../php/class.servicessource.php');
	$source = ServicesSource::Read('../services/services.src', $_SESSION['servicesKey']);
	$source = json_decode($source, true);
	
	// invalid source
	if (!$source) {
		$response['status'] = 2;

	// valid source
	} else {
		$response['status'] = 1;
		$response['source'] = $source;

		// dapatkan sumber views
		$response['source']['view']['home']                    = MinifySourceView('home.html');
		$response['source']['view']['wizard']                  = MinifySourceView('wizard.html');
		$response['source']['view']['globalConnection']        = MinifySourceView('globalconnection.html');
		$response['source']['view']['globalConnectionData']    = MinifySourceView('globalconnection.data.html');
		$response['source']['view']['globalConnectionNoData']  = MinifySourceView('globalconnection.nodata.html');
		$response['source']['view']['globalConnectionNew']     = MinifySourceView('globalconnection.new.html');
		$response['source']['view']['globalConnectionEdit']    = MinifySourceView('globalconnection.edit.html');
		$response['source']['view']['globalConnectionDetails'] = MinifySourceView('globalconnection.details.html');
		$response['source']['view']['servicesAccount']         = MinifySourceView('servicesaccount.html');
		$response['source']['view']['servicesAccountData']     = MinifySourceView('servicesaccount.data.html');
		$response['source']['view']['servicesAccountNoData']   = MinifySourceView('servicesaccount.nodata.html');
		$response['source']['view']['servicesAccountNew']      = MinifySourceView('servicesaccount.new.html');
		$response['source']['view']['servicesAccountDetails']  = MinifySourceView('servicesaccount.details.html');
		$response['source']['view']['viewerAccount']           = MinifySourceView('vieweraccount.html');
		$response['source']['view']['viewerAccountNoData']     = MinifySourceView('vieweraccount.nodata.html');
		$response['source']['view']['viewerAccountData']       = MinifySourceView('vieweraccount.data.html');
	}

} else {
	$response['status'] = 0;
}

echo json_encode($response);

function MinifySourceView($file) {
	return @trim(preg_replace('/\s+/', ' ', file_get_contents('../services/' . $file)));
}

?>