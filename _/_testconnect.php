<?php

// test connect mysqli dengan user yang salah

$link = mysqli_connect('localhost', 'rozzzsot', '');

if (mysqli_connect_errno()) {
	echo mysqli_connect_errno() . ' ' . mysqli_connect_error();
}

?>