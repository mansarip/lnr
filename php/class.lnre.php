<?php

class LNRE
{
	private static $key = 'limenrose';

	private static function _Decrypt($source) {
		return rtrim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, md5(self::$key), base64_decode($source), MCRYPT_MODE_CBC, md5(md5(self::$key))), "\0");
	}

	private static function _Encrypt($source) {
		$source = trim($source);
		$source = preg_replace('/\s+/', ' ', $source);
		return base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5(self::$key), $source, MCRYPT_MODE_CBC, md5(md5(self::$key))));
	}

	public static function Create($source, $path, $filename) {
		// cek path, wujud ke tidak
		if (!file_exists($path)) {
			die('<b>LNRE Error : </b>Path not exist.');
		}

		// cek path, adakah ia writable
		if (!is_writable($path)) {
			die('<b>LNRE Error : </b>Unable to write.');
		}

		// sediakan content
		$content = self::_Encrypt($source);

		// write content
		$handler = fopen($path.$filename.'.lnre', 'w');
		if (!$handler) {
			die('<b>LNRE Error : </b>Unable to write.');
		}
		fwrite($handler, $content);
		fclose($handler);

		return true;
	}

	public static function Open($file) {
		// cek file wujud ke tidak
		if (!file_exists($file)) {
			die('<b>LNRE Error : </b>File not found.');
		}

		// cek file boleh dibaca ke tidak
		if (!is_readable($file)) {
			die('<b>LNRE Error : </b>Unable to read file.');
		}

		$rawContent = file_get_contents($file);
		$data = self::_Decrypt($rawContent);

		return $data;
	}
}

?>