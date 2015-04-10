<?php

$key = 'limenrose_user';
$string = '[{"admin":"123","penghulu":"panglima"}]';

$encrypted = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($key), $string, MCRYPT_MODE_CBC, md5(md5($key))));
$decrypted = rtrim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, md5($key), base64_decode($encrypted), MCRYPT_MODE_CBC, md5(md5($key))), "\0");

$h = fopen('user.key', 'w');
fwrite($h, $encrypted);
fclose($h);

?>