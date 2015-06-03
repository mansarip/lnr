<?php

error_reporting(0);
session_start();

// ajax call only
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && ($_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest')) {

	$username = $_POST['user'];
	$password = $_POST['pass'];
	$configFile = '../config.json';
	$sourceFile = '../services/services.src';

	// jika username atau password tak diisi
	if ($username == '' || $password == '') {
		$return['success'] = 0;
		$return['message'] = 'Empty username or password.';
		echo json_encode($return);
		exit;
	}

	// jika file config tak wujud
	if (!file_exists($configFile)) {
		$return['success'] = 0;
		$return['message'] = 'Missing config file.';
		echo json_encode($return);
		exit;
	}

	// jika file config tak boleh dibaca
	if (!is_readable($configFile)) {
		$return['success'] = 0;
		$return['message'] = 'Unable to read config file.';
		echo json_encode($return);
		exit;
	}

	// untuk mengelakkan i/o yang kerap
	// simpan semua value dalam session
	$config = file_get_contents('../config.json');
	$config = json_decode($config, true);
	foreach ($config as $key => $value) {
		$_SESSION[$key] = $config[$key];
	}

	require 'class.servicessource.php';
	$data = ServicesSource::Read($sourceFile, $_SESSION['servicesKey']);
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