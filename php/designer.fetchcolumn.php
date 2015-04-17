<?php

error_reporting(0);

// sebelum cek pastikan ada valid session
session_start();

if (isset($_SESSION['logged']) && $_SESSION['logged']) {

	include('../php/class.connection.php');
	include('../php/class.query.php');

	$connection = json_decode($_POST['connection'], true);
	$detail = json_decode($_POST['detail'], true);
	
	$conn = new Connection($connection);
	$conn->Connect();
	$query = array(
			'connection' => $conn,
			'sql' => $detail['query'],
			'active' => true
		);
	$query = new Query($query);
	$column = $query->FetchColumn();

	echo json_encode($column);
	exit;
}

?>