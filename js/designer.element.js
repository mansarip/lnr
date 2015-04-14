function Label() {

	this.width = 90; //px
	this.height = 20; //px
	this.name = 'Label'; // tak unique (user boleh rename)
	this.style = 'border:1px solid #333; width:'+ this.width +'px; height:'+ this.height +'px;';
	this.elem = null;

	Label.prototype.SetPosition = function(x, y){
		this.style += 'top:'+ y +'px; left:'+ x +'px;';
	};

	Label.prototype.Draw = function(area){
		this.elem = $('<div class="element label" style="'+ this.style +'"></div>');
		this.elem.appendTo(area);

		// events
		var self = this;

		this.elem.on('mousedown', function(event){
			event.stopPropagation();
			self.Select();
		});

		this.elem.on('click', function(event){
			event.stopPropagation();
			self.elem.trigger('mousedown');
		});
	};

	Label.prototype.Select = function() {
		designer.currentSelectedElement = this;
		this.elem.addClass('selected');
	};

	Label.prototype.Deselect = function() {
		designer.currentSelectedElement = null;
		this.elem.removeClass('selected');
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