<?php

class LNRE
{
	private static function _Decrypt($source, $key) {
		return rtrim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, md5($key), base64_decode($source), MCRYPT_MODE_CBC, md5(md5($key))), "\0");
	}

	private static function _Encrypt($source, $key) {
		$source = trim($source);
		$source = preg_replace('/\s+/', ' ', $source);
		return base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($key), $source, MCRYPT_MODE_CBC, md5(md5($key))));
	}

	public static function Create($source, $path, $filename, $key) {
		// cek path, wujud ke tidak
		if (!file_exists($path)) {
			die('<b>LNRE Error : </b>Path not exist.');
		}

		// cek path, adakah ia writable
		if (!is_writable($path)) {
			die('<b>LNRE Error : </b>Unable to write.');
		}

		// sediakan content
		$content = self::_Encrypt($source, $key);

		// write content
		$handler = fopen($path.$filename.'.lnre', 'w');
		if (!$handler) {
			die('<b>LNRE Error : </b>Unable to write.');
		}
		fwrite($handler, $content);
		fclose($handler);

		return true;
	}

	public static function Open($file, $key) {
		// cek file wujud ke tidak
		if (!file_exists($file)) {
			die('<b>LNRE Error : </b>File not found.');
		}

		// cek file boleh dibaca ke tidak
		if (!is_readable($file)) {
			die('<b>LNRE Error : </b>Unable to read file.');
		}

		$rawContent = file_get_contents($file);
		$data = self::_Decrypt($rawContent, $key);

		return $data;
	}
}

?>