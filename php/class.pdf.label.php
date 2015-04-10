<?php

class Label extends TextContainer
{
	// properties
	public $text;

	public function __construct($details) {
		foreach ($details as $key => $value) {
			$this->{$key} = $value;
		}

		$this->StoreOriginalPosition($this->posX, $this->posY);

		//$this->ModPositionBasedOnMargin();
	}

	public function Display() {
		global $pdf;
		$pdf->MultiCell($this->width, $this->height, $this->text, $border=1, $align='L', $fill=false, $ln=1, $this->posX, $this->posY);
	}
}

?>