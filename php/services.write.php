<?php

/**
 * PENTING : Hanya untuk yang dah logged in sahaja
 */
session_start();

if ($_SESSION['logged']) {
	$task = $_POST['task'];
	$data = $_POST['data'];

	switch ($task) {
		case 'saveGlobalConnection':
			
		break;
	}

} else {
	http_response_code(403);
}

?>