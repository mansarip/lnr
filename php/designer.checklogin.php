<?php

session_start();

if (isset($_SESSION['logged']) && $_SESSION['logged']) {
	$response['status'] = 1;

	// dapatkan sumber views
	$response['view']['connectionAddNew'] = MinifySourceView('connection.new.html');
	$response['view']['connectionEdit'] = MinifySourceView('connection.edit.html');
	$response['view']['parameterAddNew'] = MinifySourceView('parameter.new.html');
	$response['view']['preferencesGeneral'] = MinifySourceView('preferences.general.html');
	$response['view']['preferencesFormat'] = MinifySourceView('preferences.format.html');
	$response['view']['preferencesMargin'] = MinifySourceView('preferences.margin.html');
	$response['view']['groupNoMain'] = MinifySourceView('group.nomain.html');
	$response['view']['groupInfo'] = MinifySourceView('group.info.html');

} else {
	$response['status'] = 0;
}

echo json_encode($response);

function MinifySourceView($file) {
	return @trim(preg_replace('/\s+/', ' ', file_get_contents('../designer/' . $file)));
}

?>