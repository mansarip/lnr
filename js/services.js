$(function(){
	window.services = new Services();
});

function Services() {

	Services.prototype.InitUI = function() {
		var layout = new dhtmlXLayoutObject({
			parent : 'app',
			pattern : '4L'
		});

	};

	this.InitUI();
}