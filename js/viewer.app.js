function Viewer() {

	this.phpPath = '../php/';
	this.layout;
	this.toolbar;
	this.statusBar;
	this.username;
	this.get;

	Viewer.prototype.GetUrlParameter = function(){
		var match,
			pl     = /\+/g,  // Regex for replacing addition symbol with a space
			search = /([^&=]+)=?([^&]*)/g,
			decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
			query  = window.location.search.substring(1);

		urlParams = {};
		while (match = search.exec(query))
		urlParams[decode(match[1])] = decode(match[2]);
		this.get = urlParams;
	};

	Viewer.prototype.CheckSession = function(){
		$.ajax({
			url: this.phpPath + 'viewer.checksession.php',
			dataType: 'json',
			type: 'post'
		})
		.done(function(response){
			if (response.logged) {
				viewer.username = response.username;
				viewer.statusBar.setText('Logged as : ' + response.username);
			}
		})
		.fail(function(error){
			alert('Error : ' + error.status);
		});
	};

	Viewer.prototype.InitFrame = function() {
		var layout = new dhtmlXLayoutObject({
			parent : 'frame',
			pattern : '1C'
		});

		layout.cells('a').setText('L&R Report Viewer : <span id="reportTitle">[Unknown File]</span>');

		this.toolbar =  layout.cells('a').attachToolbar();
		this.statusBar = layout.cells('a').attachStatusBar();
		this.statusBar.setText('Ready');
		this.toolbar.loadStruct('../viewer/button.json', function(){
			//viewer.DirectLinkShowPopup();
		});
		this.toolbar.attachEvent('onClick', function(id){
			if (id === 'btnDirectLink') viewer.DirectLinkShowPopup();
		});

		this.layout = layout;
	};

	Viewer.prototype.DirectLinkShowPopup = function() {
		var dhxWin = new dhtmlXWindows();
		dhxWin.attachViewportTo('frame');

		var directLinkWindow = dhxWin.createWindow({
			id:'directLinkWindow',
			width:400,
			height:200,
			center:true,
			modal:true
		});
		directLinkWindow.setText('Direct Link');
		directLinkWindow.attachHTMLString('<div> <p>Link<br/><input type="text"/></p> <input type="checkbox" id="hoho"/><label for="hoho">AAA</label> </div>');
	};

	Viewer.prototype.Output = function() {
		if (this.get.output === undefined) this.get.output = 'pdf';

		var outputType = this.get.output;
		var url = this.phpPath + 'viewer.output.'+ outputType +'.php';
		var queryString = '';

		for (var key in this.get) {
			queryString += key;
			queryString += '=';
			queryString += this.get[key];
			queryString += '&';
		}

		url += '?' + queryString;

		this.layout.cells('a').attachURL(url, null, {paramkey:'paramvalue'});
	};

	// constructor
	this.GetUrlParameter();
}