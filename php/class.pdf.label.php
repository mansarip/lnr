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
		$width = $this->width;

		// line height
		$pdf->setCellHeightRatio($this->lineHeight);

		// font style
		$fontStyle = '';
		if ($this->fontBold) $fontStyle .= 'B';
		if ($this->fontItalic) $fontStyle .= 'I';
		if ($this->fontUnderline) $fontStyle .= 'U';

		// text color
		if (!$pdf->colorLibrary[$this->textColor]) {
			$pdf->colorLibrary[$this->textColor] = $pdf->HexToRGB($this->textColor);
		}
		$textColor = $pdf->colorLibrary[$this->textColor];
		$pdf->SetTextColor($textColor[0], $textColor[1], $textColor[2]);

		// fill color
		if ($this->fillColorEnable) {
			if (!$pdf->colorLibrary[$this->fillColor]) {
				$pdf->colorLibrary[$this->fillColor] = $pdf->HexToRGB($this->fillColor);
			}
			$fillColor = $pdf->colorLibrary[$this->fillColor];
			$pdf->SetFillColor($fillColor[0], $fillColor[1], $fillColor[2]);
		}

		// font
		$pdf->SetFont($this->fontFamily, $fontStyle, $this->fontSize);

		// padding
		$pdf->SetCellPadding($this->padding / 2.5);

		// elasticity
		if ($this->elasticity == 'fixed') {
			$maxh = $this->height;
		
		} elseif ($this->elasticity == 'vertical') {
			$maxh = 0;
		} elseif ($this->elasticity == 'horizontal') {
			$width = $pdf->GetStringWidth($this->text, $this->fontFamily, $this->fontStyle, $this->fontSize);
			$line = $pdf->getNumLines($this->text, $width, true, false, $this->padding, $border=1);

			while ($line > 1) {
				$line = $pdf->getNumLines($this->text, $width++, true, false, $this->padding, $border=1);
			}
		}

		$pdf->MultiCell(
			$width,
			$this->height,
			$this->text,
			$border=1,
			$align='L',
			$fill=$this->fillColorEnable,
			$ln=1,
			$this->posX,
			$this->posY,
			$reseth=true,
			$stretch=0,
			$this->isHTML,
			$autopadding=false,
			$maxh
		);
	}
}

?>