<?php

session_start();

if ($_SESSION['logged']) {

	include('class.lnre.php');

	$content = $_POST['content'];
	$tempFolder = '../designer/temp/';
	$temporaryFileName = 'temp_' . $_SESSION['designerId'];
	$file = $tempFolder.$temporaryFileName;

	// check folder temp wujud ke tak
	if (!file_exists($tempFolder)) {
		$response['status'] = 0;
		$response['message'] = 'Unable to save. Temporary folder not found.';
		echo json_encode($response);
		exit;
	}

	// check folder temp tulis baca ke tak
	if (!is_writable($tempFolder)) {
		$response['status'] = 0;
		$response['message'] = 'Permission denied. Unable to write save file.';
		echo json_encode($response);
		exit;	
	}

	LNRE::Create($content, $tempFolder, $temporaryFileName, $_SESSION['designerKey']);

	$response['status'] = 1;
	$response['message'] = 'Successfully saved.';
	echo json_encode($response);
	exit;
}

?>