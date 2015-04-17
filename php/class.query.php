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
	public function FetchColumn() {
		//mysql
		if ($this->connection->type == 'mysql') {

			if ($result = mysqli_query($this->connection->conn, $this->sql)) {
				
				$column = array();
				$finfo = mysqli_fetch_fields($result);
				foreach ((array)$finfo as $detail) {
					$column[] = array(
						'name' => $detail->name,
						'dataType' => $this->_GetMySQLDataType($detail->type, true)
					);
				}
				mysqli_free_result($result);
				return $column;

			}
			else {
				$err['status'] = 0;
				$err['message'] = mysqli_error($this->connection->conn);
				return $err;
			}
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

	private function _GetMySQLDataType($id, $simpleMode=null) {
		$mysql_data_type_hash = array(
			1=>'tinyint',
			2=>'smallint',
			3=>'int',
			4=>'float',
			5=>'double',
			7=>'timestamp',
			8=>'bigint',
			9=>'mediumint',
			10=>'date',
			11=>'time',
			12=>'datetime',
			13=>'year',
			16=>'bit',
			//252 is currently mapped to all text and blob types (MySQL 5.0.51a)
			253=>'varchar',
			254=>'char',
			246=>'decimal'
		);

		if ($simpleMode) {
			switch ($id) {
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 8:
				case 9:
				case 13:
				case 246:
					return 'number';
				break;

				default:
					return 'string';
				break;
			}
		} else {
			return $mysql_data_type_hash[$id];
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