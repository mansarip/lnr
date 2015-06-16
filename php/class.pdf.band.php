<?php

class Band
{
	// properties
	public $name;
	public $childOf;
	public $groupSet = false;
	public $groupSetOrder; //0,1,2...
	public $groupQuery;
	public $originalPosX;
	public $originalPosY;
	public $posX;
	public $posY;
	public $elements;
	public $elementObjects = array();
	public $highestElementPosY2 = 0;
	public $printOnAllPages = false;
	public $isContinueFromPreviousPage = false;

	public function __construct($bandDetail) {
		if (!empty($bandDetail['element'])) $this->elements = $bandDetail['element'];

		// simpan original position
		$this->originalPosX = ($this->posX) ? $this->posX : 0;
		$this->originalPosY = ($this->posY) ? $this->posY : 0;
	}

	public function __clone() {
		// clone elementObjects untuk mengelakkan references
		if (!empty($this->elementObjects)) {
			foreach ($this->elementObjects as &$element) {
				$element = clone $element;
			}
		}
	}

	public function InitPosition() {
		$margins = $this->_GetMargins();

		$this->posX = $margins['left'];
		$this->posY = $margins['top'];
	}

	private function _GetMargins() {
		global $layout;
		return $layout['general']['margin'];
	}

	public function RegisterElements() {
		if (!empty($this->elements)) {
			
			foreach ($this->elements as $elem) {
				$elemType = $elem['type'];

				if ($elemType == 'label') {
					$label = new Label($elem);
					$label->AttachToBand($this);
				}
				elseif ($elemType == 'field') {
					$field = new Field($elem);
					$field->AttachToBand($this);
				}
				elseif ($elemType == 'rectangle') {
					$rect = new Rectangle($elem);
					$rect->AttachToBand($this);
				}
				elseif ($elemType == 'image') {
					$rect = new Image($elem);
					$rect->AttachToBand($this);
				}
			}

			unset($this->elements);
		}
	}

	public function Reset() {

		// reset position
		$this->posX = $this->originalPosX;
		$this->posY = $this->originalPosY;

		// reset kedudukan element
		if (!empty($this->elementObjects)) {
			foreach ($this->elementObjects as $elem) {
				$elem->posX = $elem->originalPosX;
				$elem->posY = $elem->originalPosY;
			}
		}
	}
}

?>