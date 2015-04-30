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
	}

	public function Display() {
		global $pdf;

		// line height
		$pdf->setCellHeightRatio($this->lineHeight);

		// font
		$pdf->SetFont($this->fontFamily, '', $this->fontSize);

		$pdf->MultiCell(
			$this->width,
			$this->height,
			$this->text,
			$border=1,
			$align='L',
			$fill=false,
			$ln=1,
			$this->posX,
			$this->posY,
			$reseth=true,
			$stretch=0,
			$this->isHTML
		);
	}
}

?>