<?php

/*echo '<pre>';
print_r($_FILES);
echo '</pre>';
*/
session_start();

function BytesToKiloBytes($bytes) {
	$result = ($bytes / 1000);
	$result = ceil($result);
	return $result;
}

if (isset($_SESSION['logged']) && $_SESSION['logged']) {

	$image = $_FILES['image'];
	$maxSize = $_SESSION['imageUploadMaxSize']; //KB
	
	// jika ada error
	if ($image['error'] != 0) {
		$response['status'] = 0;
		$response['message'] = 'Error while uploading image';
		echo json_encode($response);
		exit;
	}

	$info = getimagesize($image['tmp_name']);

	if ($info === FALSE) {
		$response['status'] = 0;
		$response['message'] = 'Unable to determine image type of uploaded file';
		echo json_encode($response);
		exit;
	}

	// cek type
	if (
		($info[2] !== IMAGETYPE_GIF) &&
		($info[2] !== IMAGETYPE_JPEG) &&
		($info[2] !== IMAGETYPE_PNG)
		) {

		$response['status'] = 0;
		$response['message'] = 'Invalid format';
		echo json_encode($response);
		exit;
	}

	// jika file besar sangat
	if (BytesToKiloBytes($image['size']) > $maxSize) {
		$response['status'] = 0;
		$response['message'] = 'File exceeds size limit';
		echo json_encode($response);
		exit;
	}

	$uploadDirectory = '../uploads';

	// cek upload folder wujud ke tak
	if (!file_exists($uploadDirectory)) {
		$response['status'] = 0;
		$response['message'] = 'Directory not found';
		echo json_encode($response);
		exit;
	}

	// cek upload folder permission
	if (!is_writable($uploadDirectory)) {
		$response['status'] = 0;
		$response['message'] = 'Cannot access upload directory';
		echo json_encode($response);
		exit;
	}

	// pindahkan ke upload folder
	$filename = $_SESSION['designerId'].'__'.$image['name'];
	if (move_uploaded_file($image['tmp_name'], "$uploadDirectory/$filename")) {
		$response['status'] = 1;
		$response['message'] = 'Success';
		$response['file'] = "$uploadDirectory/$filename";
		echo json_encode($response);
		exit;
	}

} else {
	
	// session tak valid
	$response['status'] = 0;
	$response['message'] = 'Access denied';
	echo json_encode($response);
	exit;

}

?>