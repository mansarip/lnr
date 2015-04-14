function Band(source) {

	this.elem = null; //jquery object
	this.height = 100;
	this.width = designer.details.default.bandWidth[designer.details.app.format.paper][designer.details.app.format.orientation];
	this.title = source.title;
	this.minHeight = null;

	Band.prototype.Init = function() {
		this.title = source.title;
		var title = '<div class="title"><p>'+ this.title +'</p></div>';
		var area = '<div class="area"></div>';
		this.elem = $('<div class="band" data-name="'+ this.title +'" style="width:'+ this.width +'px">'+ title + area +'</div>');
	};

	Band.prototype.ApplyResize = function(){
		this.elem.find('.area').resizable({
			handles:'s'
		});
	};

	this.Init();
}