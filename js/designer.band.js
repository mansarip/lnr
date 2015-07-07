function Band(source) {

	this.elem = null; //jquery object
	this.height = 50;
	this.width = designer.details.default.bandWidth[designer.details.app.format.paper][designer.details.app.format.orientation];
	this.title = source.title;
	this.minHeight = null;
	this.treeStructureId;
	this.element = []; // koleksi children

	Band.prototype.Init = function() {
		var title = '<div class="title"><p>'+ this.title +'</p></div>';
		var area = '<div class="area"></div>';

		// width tolak margin
		this.width -= (designer.details.app.margin.left * 3);
		this.width -= (designer.details.app.margin.right * 3);

		this.title = source.title;
		this.elem = $('<div class="band" data-name="'+ this.title +'" style="width:'+ this.width +'px">'+ title + area +'</div>');
	};

	Band.prototype.ApplyResize = function(){
		var self = this;
		this.elem.find('.area').resizable({
			handles:'s',
			stop:function(){
				self.height = $(this).height();
			}
		});
	};

	Band.prototype.RegisterTreeId = function(id){
		this.treeStructureId = id;
	};

	this.Init();
}