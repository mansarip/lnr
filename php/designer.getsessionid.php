<?php

session_start();

if ($_SESSION['logged']) {
	echo $_SESSION['designerId'];
	exit;
}

?>