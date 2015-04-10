<?php

class ErrorMessage
{
	public static function DisplayMessage($code) {
		switch ($code) {
			case 1:
				$message = 'No file name given';
				break;

			case 2:
				$message = 'Source file does not exists';
				break;

			case 3:
				$message = 'Corrupted source, invalid array format';
				break;
		}

		die('<b>Viewer Error ('.$code.') : </b>' . $message);
	}
}

?>