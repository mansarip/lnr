<?php

error_reporting(0);
date_default_timezone_set('Asia/Kuala_Lumpur');
$source = json_decode($_POST['data'], true);

/*=============================================
                 INIT PROCESS
=============================================*/

// libs and classes
include('../php/viewer.error.php');
include('../php/class.connection.php');
include('../php/class.query.php');
include('../php/class.group.php');
include('../php/class.parameter.php');
include('../php/class.lnre.php');
include('../libs/tcpdf/tcpdf.php');

/*-----  End of Section Init Process  ------*/



/*=============================================
                 DATA PROCESS
=============================================*/

// sumber data
$data = $source['data'];

// root query
$rootQueryName = null;

// create parameter object(s)
if (!empty($data['parameter'])) {
	foreach ($data['parameter'] as $paramName => $paramDetails) {
		$paramDetails['name'] = $paramName;
		$parameter[$paramName] = new Parameter($paramDetails);
		$parameter[$paramName]->GetValue();
	}
}

// create connection object(s)
if (!empty($data['connection'])) {
	foreach ($data['connection'] as $connName => $connDetails) {
		$connDetails['name'] = $connName;
		$connection[$connName] = new Connection($connDetails);

		// connect (for active connection)
		if ($connection[$connName]->active) {
			$connection[$connName]->Connect();
		}
	}
}

// create query object(s)
if (!empty($data['query'])) {
	foreach ($data['query'] as $queryName => $queryDetails) {
		$queryDetails['name'] = $queryName;
		$query[$queryName] = new Query($queryDetails);
		$query[$queryName]->connection = $connection[$connName];
		$query[$queryName]->ParameterBinding($parameter);
		$query[$queryName]->Execute();

		// "main query" akan jadi root query
		if ($query[$queryName]->main) $rootQueryName = $queryName;
	}
}

// group objects
if (!empty($data['group'])) {
	foreach ($data['group'] as $groupName => $groupDetails) {
		$group[$groupName] = new Group();
		$group[$groupName]->name = $groupName;
		$group[$groupName]->sourceQuery = $groupDetails['sourceQuery'];
		$group[$groupName]->columns = $groupDetails['column'];
	}
}

// close connections
foreach ($connection as $conn) {
	$conn->Close();
}

/*-----  End of Section Data Process  ------*/



/*=============================================
                LAYOUT PROCESS
=============================================*/

include('../php/class.pdf.page.php');
include('../php/class.pdf.band.php');
include('../php/class.pdf.box.php');
include('../php/class.pdf.textcontainer.php');
include('../php/class.pdf.label.php');
include('../php/class.pdf.field.php');
include('../php/class.pdf.rectangle.php');
include('../php/class.pdf.image.php');
include('../php/class.pdf.qrcode.php');
include('../php/class.pdf.barcode.php');
include('../php/class.pdf.lnrpdf.php'); // extend class TCPDF

// layout source
$layout = $source['layout'];

// main result
$result = $query[$rootQueryName]->result;

// band source
$bands  = $layout['band'];

// band object collection
$bandObjects = array();
$bandObjectsDynamic = array();


/*==========  PDF Printing  ==========*/

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
$margin['bottomBreak'] = $pdf->getPageHeight() - $margin['bottom'];

$pdf->SetMargins($margin['left'], $margin['top'], $margin['right'], $keepmargins=false);
$pdf->SetAutoPageBreak(false, $margin['bottom']);
$pdf->AddPage();

/*-------------- STATIC BANDS START ---------------*/

// static band
$staticBands = array(
		'reportHeader' => $bands['reportHeader'],
		'pageHeader' => $bands['pageHeader'],
		'pageFooter' => $bands['pageFooter'],
		'reportFooter' => $bands['reportFooter']
	);

// process static bands
foreach ($staticBands as $bandName => $bandDetails) {
	$band = new Band($bandDetails);
	$band->name = $bandName;
	$band->RegisterElements();
	$bandObjects[$bandName] = $band;
}

/*-------------- STATIC BANDS END ---------------*/


$pdf->PrintBand('reportHeader');
$pdf->PrintBand('pageHeader');


/*-------------- DYNAMIC BANDS START ---------------*/

// dynamic band, pisahkan dengan yg static
$dynamicBands = $bands;
$dynamicBands = array_splice($dynamicBands, 2);
$dynamicBands = array_splice($dynamicBands, 0, -2);
$dynamicBandsName = array_keys($dynamicBands);

// group
$groups = $query[$rootQueryName]->group;
$groupsReversed = array_reverse($groups);
$totalGroup = count($groups);
$groupIndex = array_keys($groups);
$groupsReversedIndex = array_keys($groupsReversed);
$currentGroupIndex = 0;

// process dynamic bands
// loop setiap data
foreach ((array)$result as $index => $res) {

	// statement collection (reset)
	// *statement ini yang akan memisahkan group lain dengan group lain
	$statements = array();

	$currentUpperValue = '';
	$previousValue = '';
	$nextValue = '';

	$footerCurrentValues = array();
	$footerNextValues = array();

	// headers
	for ($g = 0; $g < $totalGroup; $g++) {
		$currentValue = '';

		foreach ($groups[$groupIndex[$g]]['column'] as $columnName => $columnDetail) {
			$currentValue .= $result[$index][$columnName];
			$previousValue .= $result[$index-1][$columnName];
			$nextValue .= $result[$index+1][$columnName];
		}

		// concat value upper dengan current value
		$currentValue = $currentUpperValue . $currentValue;
		$currentUpperValue = $currentValue;

		// untuk kegunaan footer
		$footerCurrentValues[] = $currentValue;
		$footerNextValues[] = $nextValue;

		$statements[] = ($currentValue != $previousValue);
	}

	// reverse value footer, supaya bermula dengan yg paling detail
	$footerCurrentValues = array_reverse($footerCurrentValues);
	$footerNextValues = array_reverse($footerNextValues);

	// detail band
	$statements[] = true;

	// footers
	for ($g = 0; $g < $totalGroup; $g++) {
		$statements[] = ($footerCurrentValues[$g] != $footerNextValues[$g]);
	}

	for ($s = 0; $s < count($statements); $s++) {
		if ($statements[$s]) {
			$bandName = $dynamicBandsName[$s];
			$bandNameModded = $bandName . '_' . uniqid();
			
			$band = new Band($bands[$bandName]);
			$band->name = $bandNameModded;
			$band->RegisterElements();
			//$bandObjectsDynamic[$bandNameModded] = $band;
			$bandObjects[$bandNameModded] = $band;

			// sebelum print band, buat satu checkpoint
			$pdf->startTransaction();

			// print band
			$pdf->PrintBand($bandNameModded);

			// jika band yang telah diprint itu melebihi dari bottom margin, patah balik ke checkpoint tadi
			if ($pdf->lastBandPrintedPosY2 > $margin['bottomBreak']) {
				$pdf->rollbackTransaction(true);

				// print page footer sebelum add new page
				$pdf->PrintBandPageFooter();

				$pdf->AddPage();

				$pdf->lastBandPrintedPosY2 = 0;

				$pdf->PrintBand('reportHeader');
				$pdf->PrintBand('pageHeader');

				$pdf->PrintBand($bandNameModded);
			}
			// jika tidak ada apa2 masalah, terus commit
			else {
				$pdf->commitTransaction();
			}
		}
	}
}

$pdf->PrintBand('reportFooter');
$pdf->PrintBandPageFooter();

/*-------------- DYNAMIC BANDS END ---------------*/

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