<?php

class Connection
{
	public $conn;
	public $errorMessage;

	public function __construct($connection) {
		
		foreach ($connection as $key => $value) {
			$this->{$key} = $value;
		}

	}

	public function Connect() {
		
		if ($this->type == 'mysql') {
			
			// kita akan connect guna mysqli
			// tapi sebelum itu, pastikan function tersebut ada
			if (function_exists('mysqli_connect')) {

				// port to proper data type
				if ($this->port == '') $this->port = null;

				// init connection
				$this->conn = @mysqli_connect($this->host, $this->user, $this->pass, $this->dbname, $this->port, $this->socket);

				if (mysqli_connect_errno()) {
					die('<b>MySQL Unable to connect</b> : (' . mysqli_connect_errno() .') '. mysqli_connect_error());
				}

			// jika tiada mysqli_connect
			} else {

				die('<b>Error :</b> mysqli_connect is not available.');

			}

		}

	}

	/**
	 * Digunakan oleh designer
	 * untuk test connection
	 */
	public function TestConnect() {

		error_reporting(0);

		if ($this->type == 'mysql') {
			
			// kita akan connect guna mysqli
			// tapi sebelum itu, pastikan function tersebut ada
			if (function_exists('mysqli_connect')) {

				// jika host tak dinyatakan
				if ($this->host == '') {
					$this->errorMessage = 'Invalid host';
					return false;
				}

				// jika user tak dinyatakan
				if ($this->user == '') {
					$this->errorMessage = 'Invalid user';
					return false;
				}

				// init connection
				$this->conn = mysqli_connect($this->host, $this->user, $this->pass, $this->dbname, (int)$this->port, $this->socket);

				if (mysqli_connect_errno()) {
					$this->errorMessage = mysqli_connect_errno() . ' ' . mysqli_connect_error();
					return false;
				} else {
					return true;
				}

			// jika tiada mysqli_connect
			} else {
				$this->errorMessage = 'mysqli_connect is not available';
				return false;
			}

		}

		$this->errorMessage = ':(';
		return false;
	}

	public function ErrorMessage() {
		return $this->errorMessage;
	}

	public function Close() {
		if ($this->type == 'mysql') {
			mysqli_close($this->conn);
		}
	}
}

?>