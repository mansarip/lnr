<?php

// sebelum cek pastikan ada valid session
session_start();

if (isset($_SESSION['logged']) && $_SESSION['logged']) {

	include('class.connection.php');

	$detail = array(
		'host'        => $_POST['host'],
		'user'        => $_POST['username'],
		'pass'        => $_POST['password'],
		'port'        => $_POST['port'],
		'serviceName' => $_POST['serviceName'],
		'sid'         => $_POST['sid'],
		'socket'      => $_POST['socket'],
		'type'        => $_POST['dbType'],
		'dbname'      => $_POST['dbName']
	);

	$conn = new Connection($detail);

	if ($conn->TestConnect()) {
		$result['status'] = 1;
		$result['message'] = 'OK';
		$conn->Close();
	} else {
		$result['status'] = 0;
		$result['message'] = $conn->ErrorMessage();
	}

	echo json_encode($result);
	exit;

} else {
	echo json_encode(array('message' => 'Access Denied!'));
	exit;
}

?>