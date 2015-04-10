<?php

class LNRPDF extends TCPDF
{	
	public $lastBandPrintedPosY2 = 0;

	public function Header(){}
	public function Footer(){}


	public function PrintBandPageFooter() {
		global $margin;
		$this->lastBandPrintedPosY2 = $margin['bottomBreak'];
		$this->PrintBand('pageFooter');
	}


	public function PrintBand($bandName) {
		global $bandObjects, $margin;

		$band = $bandObjects[$bandName];
		
		$band->posX += (int)$margin['left'];
		
		// position Y mana nak start print band
		if ($this->lastBandPrintedPosY2 == 0) {

			// reset semua static band yang ada
			$bandObjects['reportHeader']->Reset();
			$bandObjects['pageHeader']->Reset();

			// reset band (selain static band)
			// * letak if statement supaya static band tidak berulang lakukan proses reset
			if ($bandName != 'reportHeader' && $bandName != 'pageHeader') {
				$band->Reset();
			}

			// kemudian tambah dengan margin top
			$band->posY += (int)$margin['top'];
			$band->posX += (int)$margin['left'];

			// setkan flag new page
			$isNewPage = true;
		} else {
			$band->Reset();
			$band->posX += (int)$margin['left'];
			$band->posY = $this->lastBandPrintedPosY2;
		}

		// print setiap element
		foreach ($band->elementObjects as $elem) {

			// mod position element berdasarkan band
			$elem->ModPositionBasedOnBand($band);

			// paparkan element
			$elem->Display();

			if ($this->GetY() > $this->lastBandPrintedPosY2) $this->lastBandPrintedPosY2 = $this->GetY();
		}
	}
}

?>