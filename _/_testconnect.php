<?php

$link = mysqli_connect('127.0.0.1', '', '', '');

// kalau salah keluar error
if (mysqli_connect_errno()) {
	echo mysqli_connect_errno() . ' ' . mysqli_connect_error();
}

$exe = mysqli_query($link, 'select * from corrad_2_13.flc_audit');

if (!$exe) {
	echo mysqli_error($link);
}

$result = mysqli_fetch_all($exe);

echo '<pre>';
print_r($result);
echo '</pre>';

?>