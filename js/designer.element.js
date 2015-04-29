/**
 * Element Class
 */
function Element() {
	this.id;                  // string
	this.name;                // string
	this.width;               // float
	this.type;                // string
	this.height;              // float
	this.posX;                // int
	this.posY;                // int
	this.fillColor;           // string
	this.padding;             // int
	this.horizontalPadding;   // int
	this.verticalPadding;     // int
	this.borderAllEnable;     // bool
	this.borderAllWidth;      // int
	this.borderAllStyle;      // string
	this.borderAllColor;      // string
	this.borderTopEnable;     // bool
	this.borderTopWidth;      // int
	this.borderTopStyle;      // string
	this.borderTopColor;      // string
	this.borderBottomEnable;  // bool
	this.borderBottomWidth;   // int
	this.borderBottomStyle;   // string
	this.borderBottomColor;   // string
	this.borderLeftEnable;    // bool
	this.borderLeftWidth;     // int
	this.borderLeftStyle;     // string
	this.borderLeftColor;     // string
	this.borderRightEnable;   // bool
	this.borderRightWidth;    // int
	this.borderRightStyle;    // string
	this.borderRightColor;    // string
	this.elem;                // jquery object
	this.parentBand;          // jquery object
	this.treeIcon;            // string

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
		designer.propertiesGrid.hide();
	};

	Element.prototype.Draw = function(area){
		this.elem = $('<div class="element '+ this.type +'" style="'+ this.GenerateStyle() +'"></div>');
		this.elem.uniqueId();
		this.elem.appendTo(area);

		// id
		this.id = this.elem.attr('id');

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
		var tbody = $('#properties table tbody.label');
		tbody.show();
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
	this.fontColor = '#333333';     //string
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
}