<?php

class Box
{
	// properties
	public $uniqueName;
	public $width;
	public $height;
	public $posX;
	public $posY;
	public $originalPosX;
	public $originalPosY;
	public $zIndex;
	public $backgroundColor;
	public $borderStyleTop;
	public $borderWidthTop;
	public $borderColorTop;
	public $borderStyleBottom;
	public $borderWidthBottom;
	public $borderColorBottom;
	public $borderStyleLeft;
	public $borderWidthLeft;
	public $borderColorLeft;
	public $borderStyleRight;
	public $borderWidthRight;
	public $borderColorRight;

	public function AttachToBand($band) {
		$band->elementObjects[] = $this;
		// $this->_ModPositionBasedOnBand($band);
		// $this->_RegisterPositionY2ForBand($band);
	}

	public function StoreOriginalPosition($posX, $posY) {
		$this->originalPosY = $posY;
		$this->originalPosX = $posX;
	}

	public function ModPositionBasedOnBand($band) {
		// mod position
		$this->posY += $band->posY;
		$this->posX += $band->posX;
	}

	private function _RegisterPositionY2ForBand($band) {
		global $margin;

		$posY2 = $this->posY + $this->height + $margin['top'];
		if ($posY2 > $band->highestElementPosY2) $band->highestElementPosY2 = $posY2;
	}
}

?>