<?php

session_start();

if (isset($_SESSION['logged']) && $_SESSION['logged']) {
	
	$response['status'] = 1;

	// load source file
	// $source = file_get_contents('../services/services.src');

	// return decrypted source
	

} else {
	$response['status'] = 0;
	echo json_encode($response);
}

?>