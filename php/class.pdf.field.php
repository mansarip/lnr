<?php

class Field extends TextContainer
{
	// properties
	public $sourceGroup;
	public $sourceColumn;
	public $valueIfNull;

	public function __construct($details) {
		foreach ($details as $key => $value) {
			$this->{$key} = $value;
		}

		//$this->ModPositionBasedOnMargin();
	}

	public function Display() {
		global $pdf;
		$pdf->MultiCell($this->width, $this->height, $this->text, $border=1, $align='L', $fill=false, $ln=1, $this->posX, $this->posY);
	}
}

?>