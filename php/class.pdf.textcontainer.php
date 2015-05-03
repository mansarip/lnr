<?php

class TextContainer extends Box
{
	// properties
	public $fontSize;
	public $fontFamily;
	public $fontStyleBold;
	public $fontStyleItalic;
	public $fontStyleUnderline;
	public $textAlign;
	public $verticalAlign;
	public $textColor;
	public $verticalElasticity;
	public $horizontalElasticity;

	public function Width() {
		return $this->width;
	}

	public function SetLineHeight() {
		global $pdf;
		$pdf->setCellHeightRatio($this->lineHeight);
	}

	public function ApplyFontStyle() {
		$fontStyle = '';
		if ($this->fontBold) $fontStyle .= 'B';
		if ($this->fontItalic) $fontStyle .= 'I';
		if ($this->fontUnderline) $fontStyle .= 'U';
		return $fontStyle;
	}

	public function ApplyTextColor() {
		global $pdf;
		if (!$pdf->colorLibrary[$this->textColor]) {
			$pdf->colorLibrary[$this->textColor] = $pdf->HexToRGB($this->textColor);
		}
		$textColor = $pdf->colorLibrary[$this->textColor];
		$pdf->SetTextColor($textColor[0], $textColor[1], $textColor[2]);
	}

	public function ApplyFillColor() {
		global $pdf;
		if ($this->fillColorEnable) {
			if (!$pdf->colorLibrary[$this->fillColor]) {
				$pdf->colorLibrary[$this->fillColor] = $pdf->HexToRGB($this->fillColor);
			}
			$fillColor = $pdf->colorLibrary[$this->fillColor];
			$pdf->SetFillColor($fillColor[0], $fillColor[1], $fillColor[2]);
		}
	}

	public function SetFont() {
		global $pdf;
		$pdf->SetFont($this->fontFamily, $fontStyle, $this->fontSize);
	}

	public function SetCellPadding() {
		global $pdf;
		$pdf->SetCellPadding($this->padding / 2.5);
	}

	public function ApplyElasticity() {
		global $pdf;
		if ($this->elasticity == 'fixed') {
			return $this->height;
		
		} elseif ($this->elasticity == 'vertical') {
			return 0;
		} elseif ($this->elasticity == 'horizontal') {
			$width = $pdf->GetStringWidth($this->text, $this->fontFamily, $this->fontStyle, $this->fontSize);
			$line = $pdf->getNumLines($this->text, $width, true, false, $this->padding, $border=1);

			while ($line > 1) {
				$line = $pdf->getNumLines($this->text, $width++, true, false, $this->padding, $border=1);
			}

			return $width;
		}
	}

	public function ApplyBorder() {
		global $pdf;
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
				$color = $pdf->HexToRGB($this->borderTopColor);
				$border .= '
					"T":{
						"width":'. ($this->borderTopWidth * 0.25) .',
						"cap":"butt",
						"join":"miter",
						"dash":'. ($this->borderTopStyle === 'solid' ? '0' : ($this->borderTopStyle === 'dashed' ? ($this->borderTopWidth * 3) : ($this->borderTopWidth * 0.9) )) .',
						"color":['. $color[0] .', '. $color[1] .', '. $color[2] .']
					},
				';
			}

			if ($this->borderBottomEnable) {
				$color = $pdf->HexToRGB($this->borderBottomColor);
				$border .= '
					"B":{
						"width":'. ($this->borderBottomWidth * 0.25) .',
						"cap":"butt",
						"join":"miter",
						"dash":'. ($this->borderBottomStyle === 'solid' ? '0' : ($this->borderBottomStyle === 'dashed' ? ($this->borderBottomWidth * 3) : ($this->borderBottomWidth * 0.9) )) .',
						"color":['. $color[0] .', '. $color[1] .', '. $color[2] .']
					},
				';
			}

			if ($this->borderRightEnable) {
				$color = $pdf->HexToRGB($this->borderRightColor);
				$border .= '
					"R":{
						"width":'. ($this->borderRightWidth * 0.25) .',
						"cap":"butt",
						"join":"miter",
						"dash":'. ($this->borderRightStyle === 'solid' ? '0' : ($this->borderRightStyle === 'dashed' ? ($this->borderRightWidth * 3) : ($this->borderRightWidth * 0.9) )) .',
						"color":['. $color[0] .', '. $color[1] .', '. $color[2] .']
					},
				';
			}

			if ($this->borderLeftEnable) {
				$color = $pdf->HexToRGB($this->borderLeftColor);
				$border .= '
					"L":{
						"width":'. ($this->borderLeftWidth * 0.25) .',
						"cap":"butt",
						"join":"miter",
						"dash":'. ($this->borderLeftStyle === 'solid' ? '0' : ($this->borderLeftStyle === 'dashed' ? ($this->borderLeftWidth * 3) : ($this->borderLeftWidth * 0.9) )) .',
						"color":['. $color[0] .', '. $color[1] .', '. $color[2] .']
					},
				';
			}

			// buang koma last
			$border = trim($border);
			$border = rtrim($border, ',');

			$border .= '}';

			$border = json_decode($border, true);

		} else {
			$border = 0;
		}

		return $border;
	}

	public function ApplyTextAlign() {
		if     ($this->textAlign === 'left')    { $textAlign = 'L'; }
		elseif ($this->textAlign === 'center')  { $textAlign = 'C'; }
		elseif ($this->textAlign === 'right')   { $textAlign = 'R'; }
		elseif ($this->textAlign === 'justify') { $textAlign = 'J'; }
		else   { $textAlign = 'L'; }
		return $textAlign;
	}

	public function ApplyVerticalAlign() {
		if     ($this->verticalAlign === 'top')    { $vAlign = 'T'; }
		elseif ($this->verticalAlign === 'middle') { $vAlign = 'M'; }
		elseif ($this->verticalAlign === 'bottom') { $vAlign = 'B'; }
		else   { $vAlign = 'T'; }
		return $vAlign;
	}
}

?>