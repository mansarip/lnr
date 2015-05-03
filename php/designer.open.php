<?php

session_start();

if ($_SESSION['logged']) {

	include('class.lnre.php');

	$ext = substr($_FILES['source']['name'], -5);

	// validation
	if ($_FILES['source']['type'] == 'application/octet-stream' && $ext == '.lnre' && $_FILES['source']['error'] == 0) {
		$content = LNRE::Open($_FILES['source']['tmp_name']);
		echo '<div id="loadedContent">'.$content.'</div>';
	}
}

?>