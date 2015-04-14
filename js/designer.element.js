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
	};

	Label.prototype.ApplyDrag = function(){
		var parent = this.elem.closest('.area');
		this.elem.draggable({
			containment:parent,
			stop:function(event, ui){
				var bandName = $(this).closest('.band').attr('data-name');
				var band = designer.details.app.band[bandName];
				designer.UpdateBandMinHeight(band);
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
			}
		});
	};
}