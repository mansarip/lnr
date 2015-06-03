<?php

$config = file_get_contents('../config.json');
$config = json_decode($config, true);

echo '<pre>';
print_r($config);
echo '</pre>';

?>