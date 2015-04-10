<?php

//error_reporting(0);

/*=============================================
                 INIT PROCESS
=============================================*/

require('../php/viewer.initprocess.php');

/*-----  End of Section Init Process  ------*/



/*=============================================
                 DATA PROCESS
=============================================*/

require('../php/viewer.dataprocess.php');

/*-----  End of Section Data Process  ------*/

//temp
/*$result = $query['Q1']->result;
foreach ($result as $index => $res) {
	
	// header
	if ($result[$index]['NEGERI'] != $result[$index-1]['NEGERI']) {
		echo '<pre>';
		print_r('detail : '.$res['NEGERI']);
		echo '</pre>';	
	}

	if ($result[$index]['JANTINA'] != $result[$index-1]['JANTINA']) {
		echo '<pre>';
		print_r('group1detail : '.$res['JANTINA']);
		echo '</pre>';
	}

	if ($result[$index]['ID'] != $result[$index-1]['ID']
		&& $result[$index]['NAMA'] != $result[$index-1]['NAMA']) {
		echo '<pre>';
		print_r('group2detail : 	'.$res['NAMA']);
		echo '</pre>';
	}

}*/

/*=============================================
                LAYOUT PROCESS
=============================================*/

include('../php/class.pdf.page.php');
include('../php/class.pdf.band.php');
include('../php/class.pdf.box.php');
include('../php/class.pdf.textcontainer.php');
include('../php/class.pdf.label.php');
include('../php/class.pdf.field.php');

// extend class TCPDF
class LNRPDF extends TCPDF
{
	public function Header(){}
	public function Footer(){}
}

// layout source
$layout = $source['layout'];

// pdf init
$orientation = $layout['general']['orientation'];
$unit        = $layout['general']['unit'];
$format      = $layout['general']['format'];
$unicode     = true;
$encoding    = 'UTF-8';
$diskcache   = false;
$pdfa        = false;
$pdf = new LNRPDF($orientation, $unit, $format, $unicode, $encoding, $diskcache, $pdfa);

// margin
$margin = $layout['general']['margin'];
$pdf->SetMargins($margin['left'], $margin['top'], $margin['right'], $keepmargins=false);
$pdf->SetAutoPageBreak(false, $margin['bottom']);

// collection of band objects
// dalam band, boleh ada band lain
// dalam band juga, boleh ada element
// jadi function ini akan terus proses kesemua sekali
// ini untuk mengelakkan berlaku looping banyak kali
$bands = CreateBandObjects($layout['band']);

echo '<pre>';
print_r(array_keys($bands));
echo '</pre>';

/*$temporaryBands = array();
$temporaryBands['A'] = array_splice($bands, 0, 3);
$temporaryBands['B'] = array_splice($bands, 0, -3);
$temporaryBands['Z'] = $bands;
$bands = $temporaryBands['B'];*/

/*// temporary bands : untuk menyusun semula semua band
$temporaryBands = array();
$temporaryBands['A'] = array_splice($bands, 0, 3);
$temporaryBands['B'] = array_splice($bands, 0, 1);
$temporaryBands['C'] = array_splice($bands, 0, 3);

// gandakan band yang terikat dengan result set mengikut jumlah result set tersebut
foreach ($temporaryBands['B'] as $band) {
	$totalRecord = count($query[$band->groupQuery]->result);
	for ($r=0; $r<$totalRecord; $r++) {
		$temporaryBands['B1']['detail'.$r] = clone $band;
		$temporaryBands['B1']['detail'.$r]->name = 'detail'.$r;
	}
}

// kembalikan semua band dalam satu array
$bands = array_merge($temporaryBands['A'], $temporaryBands['B1'], $temporaryBands['C']);*/

// gandakan band yang terikat dengan result set mengikut jumlah result set tersebut
// dan mengikut group2 tertentu
/*foreach ($bands as $band) {
	if ($band->groupSet) {
		echo '<pre>';
		print_r($band);
		echo '</pre>';
	}
}*/


/*echo '<pre>';
print_r(array_keys($bands));
echo '</pre>';
*/
$pdf->AddPage();

// dapatkan band index
// supaya match dengan nama
$bandIndex = array_keys($bands);
$currentBandIndex = 0;

foreach ($bands as $band) {

	// skip page footer
	//if ($band->name == 'pageFooter') { continue; }

	// jika dalam band ada element, teruskan print
	if (!empty($band->elementObjects)) {

		// new page detect
		$newPage = ($pdf->GetY() == $margin['top'] && $pdf->GetX() == $margin['left']) ? true : false;

		// jika page baru, band yang atas perlu tambah margin
		if ($newPage) {
			$band->posY += $margin['top'];
		}

		// tambah margin tepi
		$band->posX += $margin['left'];

		// titik mula posisi Y untuk band mula print
		$band->posY += $highestElementPosY2Before;

		// report footer
		// hanya untuk last page
		
		// footer
		/*if ($band->name == 'pageFooter') {
			$band->posY = $pdf->getPageHeight() - $margin['bottom'];
		}*/

		// element posY2 collection
		$elementPosY2 = array();
		
		// elements
		foreach ($band->elementObjects as $element) {
			$element->posX += $band->posX;
			$element->posY += $band->posY;
			$element->Display();
			$elementPosY2[] = $pdf->GetY();
		}

		// bawa highest posisi y2 elemen
		$band->highestElementPosY2 = max($elementPosY2);
		$highestElementPosY2Before = $band->highestElementPosY2;
	}

	// update band index
	$currentBandIndex++;
}

// page object
//$page = new Page();

//$pdf->MultiCell(100,5,'xxx');

// first page
// $pdf->AddPage();

/*
// printing
foreach ($bands as $band) {

	// elements
	foreach ($band->elementObjects as $element) {
		$element->Display();
	}
}
*/

// pdf output
$name        = $source['general']['name'].'.pdf';
$destination = 'I';
$pdf->Output($name, $destination);

/*----- End of Section Layout Process  ------*/



/*=============================================
                   FUNCTIONS
=============================================*/

function CreateBandObjects($bands, $groupOrder=0) {

	global $rootQueryName;
	$band = array();

	// band
	foreach ($bands as $bandName => $bandDetail) {

		$band[$bandName] = new Band($bandDetail);
		$band[$bandName]->name = $bandName;
		$band[$bandName]->groupOrder = $groupOrder;

		// group set root (header, detail, footer)
		if ($bandName == 'header' || $bandName == 'detail' || $bandName == 'footer') {
			$band[$bandName]->groupSet = true;
			$band[$bandName]->groupSetOrder = 0;
			$band[$bandName]->groupQuery = $rootQueryName;
		}

		echo '<pre>';
		print_r($band);
		echo '</pre>';

		// position
		//$band[$bandName]->InitPosition();

		// mod position Y berdasarkan element terakhir (y2) dalam band sebelumnya
		// $band[$bandName]->posY += $highestElementPosY2Before;

		// proses element yang ada dalam band
		// element property ditetapkan dalam band constructor
		if ($band[$bandName]->elements) {
			ElementObjectProcessing($band[$bandName]);
		}
		
		// jika dalam band tersebut, ada group set (bands) yang lain
		if (!empty($bandDetail['children'])) {
			$children = CreateBandObjects($bandDetail['children'], $groupOrder+1);
			foreach ($children as $chidlName => $chidlDetails) {
				$band[$chidlName] = $chidlDetails;
			}
		}

		// clear source
		unset($band[$bandName]->elements);

		// untuk kegunaan band selepasnya
		// simpan butiran highestElementPosY2
		// $highestElementPosY2Before = $band[$bandName]->highestElementPosY2;
	}

	return $band;
}


function ElementObjectProcessing($band) {

	global $pdf;

	$elements = $band->elements;
	foreach ((array)$elements as $elem) {

		if ($elem['type'] == 'label') {
			$label = new Label($elem);
			$label->AttachToBand($band);
		}
		elseif ($elem['type'] == 'field') {
			$field = new Field($elem);
			$field->AttachToBand($band);
		}

	}

}

/*-------- End of Section Functions  ---------*/


?>