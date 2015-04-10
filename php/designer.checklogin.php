<?php

session_start();

if (isset($_SESSION['logged']) && $_SESSION['logged']) {
	echo '1';
} else {
	echo '0';
}

?>