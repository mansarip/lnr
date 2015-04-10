<?php

class Connection
{
	public $conn;

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

				// init connection
				$this->conn = mysqli_connect($this->host, $this->user, $this->pass, $this->dbname, $this->port, $this->socket);

				if (mysqli_connect_errno()) {
					die('<b>MySQL Unable to connect</b> : (' . mysqli_connect_errno() .') '. mysqli_connect_error());
				}

			// jika tiada mysqli_connect
			} else {

				die('<b>Error :</b> mysqli_connect is not available.');

			}

		}

	}

	public function Close() {
		if ($this->type == 'mysql') {
			mysqli_close($this->conn);
		}
	}
}

?>