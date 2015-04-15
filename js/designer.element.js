function Label() {

	this.width = 90; //px
	this.height = 20; //px
	this.name = 'Label'; // tak unique (user boleh rename)
	this.style = 'border:1px solid #333; width:'+ this.width +'px; height:'+ this.height +'px;';
	this.elem = null;
	this.id = null;
	this.parentBand;

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
	};

	Label.prototype.Deselect = function() {
		designer.currentSelectedElement = null;
		this.elem.removeClass('selected');
	};

	Label.prototype.RegisterTree = function(){
		var self = this;
		var treeParentId = this.parentBand.treeStructureId;
		var treeChildId = this.id;
		var treeText = 'Label';

		designer.tree.structure.insertNewChild(treeParentId, treeChildId, treeText, function(id){
			event.stopPropagation();
			self.Select();
		}, 'ui-label.png');

		designer.tree.structure.selectItem(treeChildId, false);
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
				 $( event.toElement ).one('click', function(e){ e.stopImmediatePropagation(); } );
			}
		});
	};

	Label.prototype.ApplyResize = function(){
		var parent = this.elem.closest('.area');
		this.elem.resizable({
			containment:parent,
			handles:'all',
			stop:function(event, ui){
				var bandName = ui.element.closest('.band').attr('data-name');
				var band = designer.details.app.band[bandName];
				designer.UpdateBandMinHeight(band);
				 $( event.toElement ).one('click', function(e){ e.stopImmediatePropagation(); } );
			}
		});
	};
}