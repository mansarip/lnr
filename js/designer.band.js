function Band(source) {

	this.elem = null; //jquery object
	this.height = 100;
	this.width = 700;
	this.title = source.title;

	Band.prototype.Init = function() {
		this.title = source.title;
		var title = '<div class="title"><p>'+ this.title +'</p></div>';
		var area = '<div class="area" style="height:'+ this.height +'px; width:'+ this.width +'px;"></div>';
		this.elem = $('<div class="band">'+ title + area +'</div>');
	};

	this.Init();
}