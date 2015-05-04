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

		$this->StoreOriginalPosition($this->posX, $this->posY);
	}

	public function Display() {
		global $pdf, $layout, $source, $query, $res;

		// replace source dengan real data
		switch ($this->source) {
			case 'SYS11': $text = $source['general']['name']; break;
			case 'SYS12': $text = $source['general']['author']; break;
			case 'SYS21': $text = $layout['general']['format']; break;
			case 'SYS22': $text = $layout['general']['orientation']; break;
			case 'SYS31': $text = $layout['general']['margin']['top']; break;
			case 'SYS32': $text = $layout['general']['margin']['bottom']; break;
			case 'SYS33': $text = $layout['general']['margin']['right']; break;
			case 'SYS34': $text = $layout['general']['margin']['left']; break;
			case 'SYS35': $text = $layout['general']['margin']['footer']; break;
			case 'SYS41': $text = $pdf->PageNo(); break;

			case 'DATE11': $text = date('dmY'); break;
			case 'DATE12': $text = date('d m Y'); break;
			case 'DATE13': $text = date('d-m-Y'); break;
			case 'DATE14': $text = date('d/m/Y'); break;
			case 'DATE15': $text = date('d F Y'); break;
			case 'DATE16': $text = date('j m Y'); break;
			case 'DATE17': $text = date('j-m-Y'); break;
			case 'DATE18': $text = date('j/m/Y'); break;
			case 'DATE19': $text = date('j F Y'); break;
			case 'DATE21': $text = date('mdY'); break;
			case 'DATE22': $text = date('m d Y'); break;
			case 'DATE23': $text = date('m-d-Y'); break;
			case 'DATE24': $text = date('m/d/Y'); break;
			case 'DATE25': $text = date('F d Y'); break;
			case 'DATE26': $text = date('m j Y'); break;
			case 'DATE27': $text = date('m-j-Y'); break;
			case 'DATE28': $text = date('m/j/Y'); break;
			case 'DATE29': $text = date('F j Y'); break;
			case 'DATE31': $text = date('d'); break;
			case 'DATE32': $text = date('j'); break;
			case 'DATE41': $text = date('F'); break;
			case 'DATE42': $text = date('m'); break;
			case 'DATE51': $text = date('Y'); break;
			case 'DATE52': $text = date('y'); break;

			case 'TIME11': $text = date('g:i'); break;
			case 'TIME12': $text = date('g:iA'); break;
			case 'TIME13': $text = date('g:ia'); break;
			case 'TIME14': $text = date('g:i A'); break;
			case 'TIME15': $text = date('g:i a'); break;
			case 'TIME21': $text = date('h:i'); break;
			case 'TIME22': $text = date('h:iA'); break;
			case 'TIME23': $text = date('h:ia'); break;
			case 'TIME24': $text = date('h:i A'); break;
			case 'TIME25': $text = date('h:i a'); break;
			case 'TIME31': $text = date('Hi'); break;
			case 'TIME32': $text = date('H:i'); break;

			default:
				$text = $res[$this->source];
			break;
		}

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
			$text,
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