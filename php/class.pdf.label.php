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

		// width
		$width = $this->Width();

		// line height
		$this->SetLineHeight($this->lineHeight);

		// font style
		$fontStyle = $this->ApplyFontStyle();

		// text color
		$this->ApplyTextColor();

		// fill color
		$this->ApplyFillColor();

		// font
		$this->SetFont();

		// padding
		$this->SetCellPadding();

		// elasticity
		if ($this->elasticity == 'fixed' || $this->elasticity == 'vertical') {
			$maxh = $this->ApplyElasticity();
		} elseif ($this->elasticity == 'horizontal') {
			$width = $this->ApplyElasticity();
		}

		// border
		$border = $this->ApplyBorder();

		// text align
		$textAlign = $this->ApplyTextAlign();

		// vertical align
		$vAlign = $this->ApplyVerticalAlign();

		$pdf->MultiCell(
			$width,
			$this->height,
			$this->text,
			$border,
			$textAlign,
			$fill=$this->fillColorEnable,
			$ln=1,
			$this->posX,
			$this->posY,
			$reseth=true,
			$stretch=0,
			$this->isHTML,
			$autopadding=true,
			$maxh,
			$vAlign
		);
	}
}

?>