<?php

session_start();

if (isset($_SESSION['logged']) && $_SESSION['logged']) {
	$arr['username'] = $_SESSION['username'];
	$arr['code'] = 1;
	echo json_encode($arr);
	exit;
	
} else {
	echo '0';
}

?>