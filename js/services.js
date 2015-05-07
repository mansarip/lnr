$(function(){
	window.services = new Services();
	
	services.CheckLogin(function(){
		services.InitUI();
		services.LoadHome();
		//services.LoadGlobalConnection();
	});
});

function Services() {

	this.phpPath = '../php/';
	this.fugueIconPath = '../img/icons/';
	this.dhtmlxImagePath = '../libs/dhtmlx/imgs/';
	this.layout;

	Services.prototype.InitUI = function() {
		this.layout = new dhtmlXLayoutObject({
			parent : 'app',
			pattern : '2U'
		});

		var toolbar = this.layout.attachToolbar();
		$(toolbar.cont).append('<div id="logo"></div>');

		this.layout.cells('a').setWidth(200);
		this.layout.cells('a').setText('Menu');
		this.layout.cells('b').setText('Home');
		this.layout.cells('b').hideArrow();

		var menu = this.layout.cells('a').attachTree();
		menu.setImagesPath(this.dhtmlxImagePath +'dhxtree_skyblue/');
		menu.setIconsPath(this.fugueIconPath);
		menu.loadJSONObject({
			id:0,
			item:[
				{id:1, text:'Report Services', im0:'gear.png', im1:'gear.png', im2:'gear.png', item:[
					{id:'Home', text:'Home', im0:'home.png'},
					{id:'Global Connection', text:'Global Connection', im0:'globe-network.png', im1:'globe-network.png', im2:'globe-network.png', item:[
						{id:'zzz', text:'Add New Connection', im0:'document-globe.png'},
					]},
					{id:'Configuration', text:'Configuration', im0:'wrench-screwdriver.png'},
					{id:'Services Account', text:'Services Account', im0:'user-worker.png'},
					{id:'Viewer Account', text:'Viewer Account', im0:'users.png'},
					{id:'Encryption Key', text:'Encryption Key', im0:'key.png'},
					{id:'Exit without Logout', text:'Exit without Logout', im0:'door-open.png'},
					{id:'Logout', text:'Logout', im0:'door-open-out.png'}
				]}
			]
		}, function(){
			//menu.openItem(1);
			menu.openAllItemsDynamic();
			menu.selectItem('Home');
		});

		menu.attachEvent('onClick', function(id){
			if ((id !== 'Exit without Logout') && (id !== 'Logout') && (id !== 1)) {
				services.layout.cells('b').setText(id);
				
			}
			
			if (id === 'Home') {
				services.LoadHome();
			} else if (id === 'Global Connection') {
				services.LoadGlobalConnection();
			} else if (id === 'Configuration') {

			} else if (id === 'Services Account') {

			} else if (id === 'Viewer Account') {

			} else if (id === 'Encryption Key') {

			} else if (id === 'Exit without Logout') {

			} else if (id === 'Logout') {

			}
		});
	};

	Services.prototype.LoadHome = function() {
		var home = '<div id="home" class="content">\n\
		<h3>Welcome to Lime & Rose Report Services</h3>\n\
		<div class="panel">\n\
			<h2 class="title">Application</h2>\n\
			<div class="content">\n\
				<table border="0" style="border:none">\n\
					<col style="width:150px"></col>\n\
					<col></col>\n\
					<tr><td><b>Version</b></td><td>0.1 (Unstable)</td></tr>\n\
					<tr><td><b>Release Date</b></td><td>May 2015</td></tr>\n\
					<tr><td><b>Server-side Language</b></td><td>PHP</td></tr>\n\
				</table>\n\
			</div>\n\
		</div>\n\
		\n\
		<div class="panel">\n\
			<h2 class="title">Global Connection</h2>\n\
			<div class="content">\n\
				<table border="0" style="border:none">\n\
					<col style="width:150px"></col>\n\
					<col></col>\n\
					<tr><td><b>Total Available</b></td><td>42  (40 Active, 2 Inactive)</td></tr>\n\
				</table>\n\
			</div>\n\
		</div>\n\
		\n\
		<div class="panel">\n\
			<h2 class="title">Services Account</h2>\n\
			<div class="content">\n\
				<table border="0" style="border:none">\n\
					<col style="width:150px"></col>\n\
					<col></col>\n\
					<tr><td><b>Total Available</b></td><td>2</td></tr>\n\
					<tr><td><b>Table Binding</b></td><td>No</td></tr>\n\
					<tr><td><b>Table Name</b></td><td>-</td></tr>\n\
					<tr><td><b>Column for Username</b></td><td>-</td></tr>\n\
					<tr><td><b>Column for Password</b></td><td>-</td></tr>\n\
					<tr><td><b>Connection</b></td><td>%Conn Name% (MySQL)</td></tr>\n\
				</table>\n\
			</div>\n\
		</div>\n\
		\n\
		\n\
		<div class="panel">\n\
			<h2 class="title">Viewer Account</h2>\n\
			<div class="content">\n\
				<table border="0" style="border:none">\n\
					<col style="width:150px"></col>\n\
					<col></col>\n\
					<tr><td><b>Total Available</b></td><td>30</td></tr>\n\
					<tr><td><b>Table Binding</b></td><td>Yes</td></tr>\n\
					<tr><td><b>Table Name</b></td><td>corrad.PRUSER</td></tr>\n\
					<tr><td><b>Column for Username</b></td><td>USERNAME</td></tr>\n\
					<tr><td><b>Column for Password</b></td><td>USERPASSWORD</td></tr>\n\
					<tr><td><b>Connection</b></td><td>%Conn Name% (MySQL)</td></tr>\n\
				</table>\n\
			</div>\n\
		</div>\n\
		\n\
		</content>\n\
		';

		this.layout.cells('b').attachHTMLString(home);
	};

	Services.prototype.LoadGlobalConnection = function(){
		this.layout.cells('b').attachHTMLString('');

		/*this.toolbar.clearAll();
		this.toolbar.loadStruct([
			{id:1, type:'button', text:'Add Connection', img:"document.png"},
			{id:2, type:'button', text:'Remove', img:"document.png"}
		]);*/
		
		/*var html = '<div class="content">\n\
		<p>Global Connection allows multiple report files to connect to the data source using a single connection, without having to change or remove any connection stored in the report files.</p>\n\
		</div>';*/
		/*var html = '<div class="content landing">\n\
		<h1 class="title">Connection Available</h1>\n\
		<table border="1">\n\
		<col style="width:40px;"></col>\n\
		<col></col>\n\
		<col></col>\n\
		<col style="width:30px;"></col>\n\
		<col style="width:130px;"></col>\n\
		<tr>\n\
			<th>#</th>\n\
			<th>Name</th>\n\
			<th>Source Type</th>\n\
			<th><input type="checkbox" class="selectAll"/></th>\n\
			<th>Details</th>\n\
		</tr>\n\
		<tr>\n\
			<td>1.</td>\n\
			<td>Server Tingkat 4</td>\n\
			<td class="center">Database</td>\n\
			<td class="center"><input type="checkbox"/></td>\n\
			<td class="center"><input type="button" value="Show Details"/></td>\n\
		</tr>\n\
		</table>\n\
		</div>';
		this.layout.cells('b').attachHTMLString(html);*/
	};

	Services.prototype.CheckLogin = function(proceedFunction) {
		var request = $.ajax({
			url : this.phpPath + 'services.checklogin.php'/*,
			dataType : 'json'*/
		});

		// jika butiran login tiada, patah balik ke landing page
		request.done(function(response){
			if (response.status === 0) {
				services.GoBackHomeWithError();
			} else {
				proceedFunction();
			}
		});
	};

	Services.prototype.GoBackHomeWithError = function() {
		window.location.href = '../?error=permission&page=services';
	};
}