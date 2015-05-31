<?php

error_reporting(0);
session_start();

// ajax call only
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && ($_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest')) {

	$username = $_POST['user'];
	$password = $_POST['pass'];

	// jika username atau password tak diisi
	if ($username == '' || $password == '') {
		$return['success'] = 0;
		$return['message'] = 'Empty username or password.';
		echo json_encode($return);
		exit;
	}

	require 'class.servicessource.php';
	$data = ServicesSource::Read('../services/services.src');
	$data = json_decode($data, true);

	if (!$data) {
		$return['success'] = 0;
		$return['message'] = 'Unable to proceed.<br/>Corrupted source file.';
		echo json_encode($return);
		exit;
	}

	// jika valid
	if ($data['servicesAccount']['account'][$username] && $data['servicesAccount']['account'][$username]['password'] == $password) {
		$return['success'] = 1;
		$return['message'] = 'Successfully login.';
		$_SESSION['logged'] = true;
		$_SESSION['username'] = $username;
		$_SESSION['designerId'] = uniqid();
	}

	// jika tak valid
	else {
		$return['success'] = 0;
		$return['message'] = 'Invalid credentials!';	
	}

	echo json_encode($return);
}

?>