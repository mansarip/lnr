<?php

class Parameter
{
	public $value;

	public function __construct($source) {
		foreach ($source as $key => $value) {
			$this->{$key} = $value;
		}
	}

	public function GetValue() {
		switch ($this->method) {
			case 'GET' : $this->value = $_GET[$this->name]; break;
			case 'POST': $this->value = $_POST[$this->name]; break;
			case 'SESSION': $this->value = $_SESSION[$this->name]; break;
			case 'SERVER': $this->value = $_SERVER[$this->name]; break;
		}
	}
}

?>