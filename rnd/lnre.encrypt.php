<?php

/*
 * Convert JSON kepada .lnre
 * author : Luqman B. Shariffudin (luqman.shariffudin@nc.com.my)
 * copyright : ANSI System Sdn Bhd
 */

$_POST['file'] = 'report';

// includes
include('inc.conf.php');
include('inc.error.php');

// cek
if (!isset($_POST['file'])) DisplayError(301);

// parameter
$file = $_POST['file'];
$sourceFolder = 'source/';
$outputFolder = 'publish/';
$fullSourcePath = $sourceFolder . $file . '.lnr';
$key = md5('limenrose');

// baca content file
$source = file_get_contents($fullSourcePath);

// encrypt
$ivSize = mcrypt_get_iv_size(MCRYPT_GOST, MCRYPT_MODE_CFB);
$iv = mcrypt_create_iv($ivSize, MCRYPT_RAND);
$cipherText = mcrypt_encrypt(MCRYPT_GOST, $key, $source, MCRYPT_MODE_CFB, $iv);

// write output file
$handler = fopen($outputFolder . $file . '.lnre', 'w');
if (!$handler) DisplayError(302);
fwrite($handler, $cipherText);
fclose($handler);


?>