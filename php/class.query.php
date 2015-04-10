<?php

class Query
{
	public function __construct($source) {
		foreach ($source as $key => $value) {
			$this->{$key} = $value;
		}
	}

	public function ParameterBinding($parameter) {
		if ($parameter) {
			$sql = $this->sql;

			foreach ($parameter as $param) {
				switch ($param->method) {
					case 'GET'    : $sql= str_replace('{GET|'.$param->name.'}', $param->value, $sql); break;
					case 'POST'   : $sql= str_replace('{POST|'.$param->name.'}', $param->value, $sql); break;
					case 'SESSION': $sql= str_replace('{SESSION|'.$param->name.'}', $param->value, $sql); break;
					case 'SERVER' : $sql= str_replace('{SERVER|'.$param->name.'}', $param->value, $sql); break;
				}
			}

			$this->sql = $sql;
		}
	}

	public function Execute() {
		// jika ia active
		if ($this->active) {

			// mysql
			if ($this->connection->type == 'mysql') {
				$this->_ExecuteMySQL();
			}

		}
	}

	private function _ExecuteMySQL() {
		if ($result = mysqli_query($this->connection->conn, $this->sql)) {
			
			// jika mysqlnd (native driver) ada
			if (function_exists('mysqli_fetch_all')) {
				$this->result = mysqli_fetch_all($result, MYSQLI_ASSOC);
			}

			// jika mysqlnd tiada
			else {

				while ($row = mysqli_fetch_assoc($result)) {
					$records[] = $row;
				}
				$this->result = $records;
			}
		}
		else {
			$message = '<p>'. mysqli_error($this->connection->conn) .'</p>';
			die($message);
		}	
	}
}

?>