<?php

// sebelum cek pastikan ada valid session
session_start();

if (isset($_SESSION['logged']) && $_SESSION['logged']) {

	include('../php/class.connection.php');
	include('../php/class.query.php');

	$connection = json_decode($_POST['connection'], true);
	
	$conn = new Connection($connection);
	$conn->Connect();
	$query = array(
			'connection' => $conn,
			'sql' => $_POST['query'],
			'active' => true
		);
	$query = new Query($query);
	$query->Execute();
}
?>

<!DOCTYPE html>
<html>
<head>
	<title>Preview Records</title>
	<style>
	body{
		margin: 0;
		font-family: 'Montserrat', sans-serif;
		font-size: 11px;
	}
	table{
		border-collapse: collapse;
		width: 100%;
		border:1px solid #fff;
	}
	table th{
		-moz-box-shadow:inset 0px 1px 0px 0px #ffffff;
		-webkit-box-shadow:inset 0px 1px 0px 0px #ffffff;
		background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #ededed), color-stop(1, #dfdfdf));
		background:-moz-linear-gradient(top, #ededed 5%, #dfdfdf 100%);
		background:-webkit-linear-gradient(top, #ededed 5%, #dfdfdf 100%);
		background:-o-linear-gradient(top, #ededed 5%, #dfdfdf 100%);
		background:-ms-linear-gradient(top, #ededed 5%, #dfdfdf 100%);
		background:linear-gradient(to bottom, #ededed 5%, #dfdfdf 100%);
		filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#ededed', endColorstr='#dfdfdf',GradientType=0);
		background-color:#ededed;
		padding: 5px;
		border:1px solid #fff;
	}
	table td{
		padding: 3px;
		border:1px solid #fff;
	}
	table tr:nth-child(even){
		background-color: #FBFBFB;
	}
	table tr:nth-child(odd){
		background-color: #F0F0F0;
	}
	</style>
</head>
<body>
	<?php

	echo '<table border="1">';

	// table header
	echo '<tr>';
	foreach ((array)$query->result[0] as $key => $value) {
		echo '<th>'. $key .'</th>';
	}
	echo '</tr>';

	// data
	foreach ((array)$query->result as $result) {
		echo '<tr>';
		foreach ($result as $key => $value) {
			echo '<td>'. $value .'</td>';
		}
		echo '</tr>';
	}

	echo '</table>';

	?>
</body>
</html>