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

		// border
		if ($this->borderAllEnable) {

			$color = $pdf->HexToRGB($this->borderAllColor);
			$border = '{
				"TBRL":{
					"width":'. ($this->borderAllWidth * 0.25) .',
					"cap":"butt",
					"join":"miter",
					"dash":'. ($this->borderAllStyle === 'solid' ? '0' : ($this->borderAllStyle === 'dashed' ? ($this->borderAllWidth * 3) : ($this->borderAllWidth * 0.9) )) .',
					"color":['. $color[0] .', '. $color[1] .', '. $color[2] .']
				}
			}';

			$border = json_decode($border, true);

		} elseif ($this->borderTopEnable || $this->borderBottomEnable || $this->borderRightEnable || $this->borderLeftEnable) {
			
			$border = '{';

			if ($this->borderTopEnable) {
				$border .= '
				"T":{
					"width":0.2,
					"cap":"butt",
					"join":"miter",
					"dash":0,
					"color":[0,0,0]
				}';
			}

			$border .= '}';
			$border = json_decode($border, true);

		} else {
			$border = 0;
		}

		$pdf->MultiCell(
			$width,
			$this->height,
			$this->text,
			$border,
			$align='L',
			$fill=$this->fillColorEnable,
			$ln=1,
			$this->posX,
			$this->posY,
			$reseth=true,
			$stretch=0,
			$this->isHTML,
			$autopadding=true,
			$maxh
		);
	}
}

?>