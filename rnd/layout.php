<?php

// include files
include('layout.error.php');

// init global variables
$repoPath = 'publish/';

// check file string
$fileName = isset($_GET['file']) ? $_GET['file'] : DisplayError(1);
$fileName .= '.lnre';

// check file exist
if (!file_exists($repoPath.$fileName)) DisplayError(2);


?>