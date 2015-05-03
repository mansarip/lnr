<?php

error_reporting(0);
session_start();

// ajax call only
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && ($_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest')) {

	// decrypt key
	$key = 'limenrose_user';

	// baca file user
	$encrypted = file_get_contents('../_/user.key');

	// decrypt process
	$decrypted = rtrim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, md5($key), base64_decode($encrypted), MCRYPT_MODE_CBC, md5(md5($key))), "\0");

	// convert ke array
	$users = json_decode($decrypted, true);
	$users = $users[0];

	// authenticate
	$username = $_POST['user'];
	$password = $_POST['pass'];

	// jika username atau password tak diisi
	if ($username == '' || $password == '') {
		$return['success'] = 0;
		$return['message'] = 'Empty username or password.';
	}
	// jika salah password
	elseif ($users[$username] != $password) {
		$return['success'] = 0;
		$return['message'] = 'Wrong password.';	
	}
	// jika berjaya
	else {
		$return['success'] = 1;
		$return['message'] = 'Successfully login.';
		$_SESSION['logged'] = true;
		$_SESSION['username'] = $username;
		$_SESSION['designerId'] = uniqid();
	}

	echo json_encode($return);
}

?>