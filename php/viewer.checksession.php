<?php

error_reporting(0);
session_start();

if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && ($_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest')) {
	$return['logged'] = $_SESSION['logged'];
	$return['username'] = $_SESSION['username'];

	echo json_encode($return);
}

?>