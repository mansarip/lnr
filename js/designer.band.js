function Band(source) {

	this.elem = null; //jquery object
	this.height = 100;
	this.width = designer.details.default.bandWidth[designer.details.app.format.paper][designer.details.app.format.orientation];
	this.title = source.title;

	Band.prototype.Init = function() {
		this.title = source.title;
		var guide = '\n\
			<div class="guide left" style="left:'+ (designer.details.app.margin.left * 3) +'px"></div>\n\
			<div class="guide right" style="right:'+ (designer.details.app.margin.right * 3) +'px"></div>\n\
			';
		var title = '<div class="title"><p>'+ this.title +'</p></div>';
		var area = '<div class="area"></div>';
		this.elem = $('<div class="band" data-name="'+ this.title +'" style="width:'+ this.width +'px">'+ guide + title + area +'</div>');
	};

	this.Init();
}