<?php

// test connect mysqli dengan user yang salah

$link = mysqli_connect('localhost', '', '', '');

if (mysqli_connect_errno()) {
	echo '<br/><br/>';
	echo mysqli_connect_errno() . ' ' . mysqli_connect_error();
} else {
	echo 'EH?!';
}

?>