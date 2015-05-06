<?php

class Rectangle extends Box
{
	public function __construct($details) {
		foreach ($details as $key => $value) {
			$this->{$key} = $value;
		}

		$this->StoreOriginalPosition($this->posX, $this->posY);
	}

	public function Width() {
		return $this->width;
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

	public function Display() {
		global $pdf;

		// border
		$border = $this->ApplyBorder();

		// fill color
		if ($this->fillColorEnable) {
			$fillColor = $pdf->HexToRGB($this->fillColor);
		} else {
			$fillColor = null;
		}

		$pdf->Rect($this->posX, $this->posY, $this->width, $this->height, $style='F', $border, $fillColor);
	}
}

?>