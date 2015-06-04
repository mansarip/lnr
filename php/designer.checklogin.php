<?php

session_start();

if (isset($_SESSION['logged']) && $_SESSION['logged']) {
	$response['status'] = 1;

	// dapatkan sumber views
	$response['view']['connectionAddNew'] = MinifySourceView('connection.new.html');
	$response['view']['connectionEdit'] = MinifySourceView('connection.edit.html');

} else {
	$response['status'] = 0;
}

echo json_encode($response);

function MinifySourceView($file) {
	return @trim(preg_replace('/\s+/', ' ', file_get_contents('../designer/' . $file)));
}

?>