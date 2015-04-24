function Label() {

	this.width = 90; //px
	this.height = 20; //px
	this.name = 'Label'; // tak unique (user boleh rename)
	this.style = 'border:1px solid #333; width:'+ this.width +'px; height:'+ this.height +'px;';
	this.elem = null;
	this.id = null;
	this.parentBand;
	this.type = "label";
	this.uniqueName = "";
	this.zIndex = 0;
	this.posY = 0; //px
	this.posX = 0; //px
	this.backgroundColor = "";
	this.borderStyleTop = "";
	this.borderWidthTop = 0;
	this.borderColorTop = "";
	this.borderStyleBottom = "";
	this.borderWidthBottom = 0;
	this.borderColorBottom = "";
	this.borderStyleLeft = "";
	this.borderWidthLeft = 0;
	this.borderColorLeft = "";
	this.borderStyleRight = "";
	this.borderWidthRight = 0;
	this.borderColorRight = "";
	this.fontSize = 10;
	this.fontFamily = "";
	this.fontStyleBold = false;
	this.fontStyleItalic = false;
	this.fontStyleUnderline = false;
	this.textAlign = "";
	this.verticalAlign = "";
	this.textColor = "";
	this.verticalElasticity = "";
	this.horizontalElasticity = "";
	this.text = "TEST";

	Label.prototype.SetPosition = function(x, y){
		this.style += 'top:'+ y +'px; left:'+ x +'px;';
	};

	Label.prototype.Draw = function(area){
		this.elem = $('<div class="element label" style="'+ this.style +'"></div>');
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

	Label.prototype.Select = function() {
		designer.currentSelectedElement = this;
		designer.tree.structure.selectItem(this.id);
		this.elem.addClass('selected');
		this.ShowProperties();
	};

	Label.prototype.Deselect = function() {
		designer.currentSelectedElement = null;
		this.elem.removeClass('selected');
		designer.propertiesGrid.hide();
	};

	Label.prototype.RegisterTree = function(){
		var self = this;
		var treeParentId = this.parentBand.treeStructureId;
		var treeChildId = this.id;
		var treeText = 'Label';

		designer.tree.structure.insertNewChild(treeParentId, treeChildId, treeText, function(id){
			// event.stopPropagation();
			designer.currentTreeSelected = this.span;
			self.Select();
		}, 'ui-label.png');

		designer.tree.structure.selectItem(treeChildId, false);
	};

	Label.prototype.UpdatePosition = function() {
		this.posY = this.elem.position().top;
		this.posX = this.elem.position().left;
	};

	Label.prototype.UpdateSize = function() {
		this.width = this.elem.width();
		this.height = this.elem.height();
	};

	Label.prototype.ApplyDrag = function(){
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

	Label.prototype.ApplyResize = function(){
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

	Label.prototype.AttachToParent = function(){
		this.parentBand.element.push(this);
	};

	Label.prototype.ShowProperties = function(){
		designer.propertiesGrid.show();
	};
}

function Field() {

	this.width = 90; //px
	this.height = 20; //px
	this.name = 'Field'; // tak unique (user boleh rename)
	this.style = 'border:1px solid #333; width:'+ this.width +'px; height:'+ this.height +'px;';
	this.elem = null;
	this.id = null;
	this.parentBand;
	this.type = "field";
	this.uniqueName = "";
	this.zIndex = 0;
	this.posY = 0; //px
	this.posX = 0; //px
	this.backgroundColor = "";
	this.borderStyleTop = "";
	this.borderWidthTop = 0;
	this.borderColorTop = "";
	this.borderStyleBottom = "";
	this.borderWidthBottom = 0;
	this.borderColorBottom = "";
	this.borderStyleLeft = "";
	this.borderWidthLeft = 0;
	this.borderColorLeft = "";
	this.borderStyleRight = "";
	this.borderWidthRight = 0;
	this.borderColorRight = "";
	this.fontSize = 10;
	this.fontFamily = "";
	this.fontStyleBold = false;
	this.fontStyleItalic = false;
	this.fontStyleUnderline = false;
	this.textAlign = "";
	this.verticalAlign = "";
	this.textColor = "";
	this.verticalElasticity = "";
	this.horizontalElasticity = "";
	this.text = "";

	Field.prototype.SetPosition = function(x, y){
		this.style += 'top:'+ y +'px; left:'+ x +'px;';
	};

	Field.prototype.Draw = function(area){
		this.elem = $('<div class="element field" style="'+ this.style +'"></div>');
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

	Field.prototype.Select = function() {
		designer.currentSelectedElement = this;
		designer.tree.structure.selectItem(this.id);
		this.elem.addClass('selected');
	};

	Field.prototype.Deselect = function() {
		designer.currentSelectedElement = null;
		this.elem.removeClass('selected');
	};

	Field.prototype.RegisterTree = function(){
		var self = this;
		var treeParentId = this.parentBand.treeStructureId;
		var treeChildId = this.id;
		var treeText = 'Field';

		designer.tree.structure.insertNewChild(treeParentId, treeChildId, treeText, function(id){
			event.stopPropagation();
			self.Select();
		}, 'ui-text-field.png');

		designer.tree.structure.selectItem(treeChildId, false);
	};

	Field.prototype.UpdatePosition = function() {
		this.posY = this.elem.position().top;
		this.posX = this.elem.position().left;
	};

	Field.prototype.UpdateSize = function() {
		this.width = this.elem.width();
		this.height = this.elem.height();
	};

	Field.prototype.ApplyDrag = function(){
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

	Field.prototype.ApplyResize = function(){
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

	Field.prototype.AttachToParent = function(){
		this.parentBand.element.push(this);
	};
}