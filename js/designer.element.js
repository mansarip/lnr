/**
 * Element Class
 */
function Element() {
	this.id;                               // string
	this.name;                             // string
	this.width;                            // float
	this.type;                             // string
	this.height;                           // float
	this.posX;                             // int
	this.posY;                             // int
	this.fillColorEnable    = false;       // bool
	this.fillColor          = '#ffffff';   // string
	this.padding            = 0;           // int
	this.horizontalPadding;                // int
	this.verticalPadding;                  // int
	this.borderAllEnable    = true;        // bool
	this.borderAllWidth     = 1;           // int
	this.borderAllStyle     = 'solid';     // string
	this.borderAllColor     = '#000000';   // string
	this.borderTopEnable    = true;        // bool
	this.borderTopWidth     = 1;           // int
	this.borderTopStyle     = 'solid';     // string
	this.borderTopColor     = '#000000';   // string
	this.borderBottomEnable = true;        // bool
	this.borderBottomWidth  = 1;           // int
	this.borderBottomStyle  = 'solid';     // string
	this.borderBottomColor  = '#000000';   // string
	this.borderLeftEnable   = true;        // bool
	this.borderLeftWidth    = 1;           // int
	this.borderLeftStyle    = 'solid';     // string
	this.borderLeftColor    = '#000000';   // string
	this.borderRightEnable  = true;        // bool
	this.borderRightWidth   = 1;           // int
	this.borderRightStyle   = 'solid';     // string
	this.borderRightColor   = '#000000';   // string

	this.elem;                             // jquery object
	this.parentBand;                       // jquery object
	this.treeIcon;                         // string
	this.propertiesItems;                  // jquery object

	Element.prototype.ApplyDrag = function(){
		var self = this;
		var parent = this.elem.closest('.area');
		this.elem.draggable({
			containment:parent,
			stop:function(event, ui){
				var bandName = $(this).closest('.band').attr('data-name');
				var band = designer.details.app.band[bandName];
				designer.UpdateBandMinHeight(band);
				self.UpdatePosition();
				 $( event.toElement ).one('click', function(e){ e.stopImmediatePropagation(); } );
			}
		});
	};

	Element.prototype.ApplyResize = function(){
		var self = this;
		var parent = this.elem.closest('.area');
		this.elem.resizable({
			containment:parent,
			handles:'all',
			stop:function(event, ui){
				var bandName = ui.element.closest('.band').attr('data-name');
				var band = designer.details.app.band[bandName];
				designer.UpdateBandMinHeight(band);
				self.UpdateSize();
				 $( event.toElement ).one('click', function(e){ e.stopImmediatePropagation(); } );
			}
		});
	};

	Element.prototype.AttachToParent = function(){
		this.parentBand.element.push(this);
	};

	Element.prototype.Deselect = function(){
		designer.currentSelectedElement = null;
		this.elem.removeClass('selected');
		this.propertiesItems.hide();
		designer.propertiesGrid.hide();
	};

	Element.prototype.Draw = function(area){
		this.elem = $('<div class="element '+ this.type +'" style="'+ this.GenerateStyle() +'"></div>');
		this.elem.uniqueId();
		this.elem.appendTo(area);

		if (this.type === 'label') {
			this.elem.append('<span class="content"></span>');
		}

		// id
		this.id = this.elem.attr('id');
		this.name = this.type + '-' + this.id;

		// events
		var self = this;

		this.elem.on('mousedown', function(event){
			event.stopPropagation();
			designer.DeselectCurrentElement();
			self.Select();
		});

		this.elem.on('click', function(event){
			event.stopPropagation();
			self.elem.trigger('mousedown');
		});
	};

	Element.prototype.GenerateStyle = function(){
		var style = 'border:1px solid #333; width:'+ this.width +'px; height:'+ this.height +'px; top:'+ this.posY +'px; left:'+ this.posX +'px;';
		return style;
	};

	Element.prototype.RegisterTree = function(){
		var self = this;
		var treeParentId = this.parentBand.treeStructureId;
		var treeChildId = this.id;
		var treeText = this.type.charAt(0).toUpperCase() + this.type.slice(1);

		designer.tree.structure.insertNewChild(treeParentId, treeChildId, treeText, function(id){
			designer.DeselectCurrentElement();
			designer.currentTreeSelected = this.span;
			self.Select();
		}, self.treeIcon);

		designer.tree.structure.selectItem(treeChildId, false);
	};

	Element.prototype.Select = function(){
		designer.currentSelectedElement = this;
		designer.tree.structure.selectItem(this.id);
		this.elem.addClass('selected');
		this.ShowProperties();
	};

	Element.prototype.SetPosition = function(x, y){
		this.posX = x;
		this.posY = y;
	};

	Element.prototype.ShowProperties = function(){
		var propertiesElem = $('#properties');

		// #getter
		propertiesElem.find('span.id').text(this.id);
		propertiesElem.find('span.type').text(this.type);
		propertiesElem.find('input.name').val(this.name);
		propertiesElem.find('input.width').val(this.width);
		propertiesElem.find('input.height').val(this.height);
		propertiesElem.find('input.left').val(this.posX);
		propertiesElem.find('input.top').val(this.posY);
		propertiesElem.find('input.ishtml').prop('checked', this.isHTML);
		propertiesElem.find('input.lineHeight').val(this.lineHeight);
		propertiesElem.find('input.textColor').val(this.textColor);
		propertiesElem.find('input.fillColorEnable').prop('checked', this.fillColorEnable);
		propertiesElem.find('input.fillColor').val(this.fillColor);
		propertiesElem.find('input.padding').val(this.padding);
		propertiesElem.find('select.elasticity').val(this.elasticity);

		propertiesElem.find('input.borderAllEnable').prop('checked', this.borderAllEnable);
		propertiesElem.find('input.borderAllWidth').val(this.borderAllWidth);
		propertiesElem.find('input.borderAllStyle').val(this.borderAllStyle);
		propertiesElem.find('input.borderAllColor').val(this.borderAllColor);

		propertiesElem.find('input.borderTopEnable').prop('checked', this.borderTopEnable);
		propertiesElem.find('input.borderTopWidth').val(this.borderTopWidth);
		propertiesElem.find('input.borderTopStyle').val(this.borderTopStyle);
		propertiesElem.find('input.borderTopColor').val(this.borderTopColor);

		propertiesElem.find('input.borderBottomEnable').prop('checked', this.borderBottomEnable);
		propertiesElem.find('input.borderBottomWidth').val(this.borderBottomWidth);
		propertiesElem.find('input.borderBottomStyle').val(this.borderBottomStyle);
		propertiesElem.find('input.borderBottomColor').val(this.borderBottomColor);

		propertiesElem.find('input.borderRightEnable').prop('checked', this.borderRightEnable);
		propertiesElem.find('input.borderRightWidth').val(this.borderRightWidth);
		propertiesElem.find('input.borderRightStyle').val(this.borderRightStyle);
		propertiesElem.find('input.borderRightColor').val(this.borderRightColor);

		propertiesElem.find('input.borderLeftEnable').prop('checked', this.borderLeftEnable);
		propertiesElem.find('input.borderLeftWidth').val(this.borderLeftWidth);
		propertiesElem.find('input.borderLeftStyle').val(this.borderLeftStyle);
		propertiesElem.find('input.borderLeftColor').val(this.borderLeftColor);

		this.propertiesItems.show();
		designer.propertiesGrid.show();
	};

	Element.prototype.UpdatePosition = function(){
		this.posY = this.elem.position().top;
		this.posX = this.elem.position().left;
	};

	Element.prototype.UpdateSize = function(){
		this.width = this.elem.width();
		this.height = this.elem.height();
	};
}

/**
 * TextContainer Class (extend Element)
 */
TextContainer.prototype = new Element();
TextContainer.prototype.constructor = Label;
function TextContainer() {
	this.lineHeight = 1.0;          //float
	this.fontFamily = 'Helvetica';  //string
	this.fontSize = 10;             //int
	this.fontItalic = false;        //bool
	this.fontBold = false;          //bool
	this.fontUnderline = false;     //bool
	this.fontStriketrough = false;  //bool
	this.textColor = '#333333';     //string
	this.textAlign = 'L';           //string
	this.verticalAlign = 'T';       //string
	this.elasticity = 'fixed';      //string
}

/**
 * Label Class (extend TextContainer)
 */
Label.prototype = new TextContainer();
Label.prototype.constructor = Label;
function Label() {
	this.width = 90;
	this.height = 20;
	this.type = 'label';
	this.treeIcon = 'ui-label.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
	this.text = '';
	this.isHTML = false;
}

/**
 * Field Class (extend TextContainer)
 */
Field.prototype = new TextContainer();
Field.prototype.constructor = Field;
function Field() {
	this.width = 90;
	this.height = 20;
	this.type = 'field';
	this.treeIcon = 'ui-text-field.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
}

/**
 * Rectangle Class (extend Element)
 */
Rectangle.prototype = new Element();
Rectangle.prototype.constructor = Rectangle;
function Rectangle() {
	this.width = 60;
	this.height = 60;
	this.type = 'rectangle';
	this.treeIcon = 'layer-shape.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
}

/**
 * Image Class (extend Element)
 */
Image.prototype = new Element();
Image.prototype.constructor = Image;
function Image() {
	this.width = 80;
	this.height = 60;
	this.type = 'image';
	this.treeIcon = 'picture.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
	this.source;
	this.dpi;
}

/**
 * Svg Class (extend Element)
 */
Svg.prototype = new Element();
Svg.prototype.constructor = Svg;
function Svg() {
	this.width = 80;
	this.height = 60;
	this.type = 'svg';
	this.treeIcon = 'document-text-image.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
	this.source;
}

/**
 * QRCode Class (extend Element)
 */
QRCode.prototype = new Element();
QRCode.prototype.constructor = QRCode;
function QRCode() {
	this.width = 40;
	this.height = 40;
	this.type = 'qrcode';
	this.treeIcon = 'barcode-2d.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
	this.code;
	this.color;
	this.distort;
	this.barType;
}

/**
 * Barcode Class (extend Element)
 */
Barcode.prototype = new Element();
Barcode.prototype.constructor = Barcode;
function Barcode() {
	this.width = 40;
	this.height = 40;
	this.type = 'barcode';
	this.treeIcon = 'barcode-2d.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
	this.code;
	this.color;
	this.distort;
	this.barType;
}