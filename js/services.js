$(function(){
	window.services = new Services();
	
	services.CheckLogin(function(){
		services.InitUI();
		services.InitEvent();
		//services.LoadServicesAccount();
		// services.LoadHome();
		services.LoadWizard();
	});
});

function Services() {

	this.phpPath = '../php/';
	this.fugueIconPath = '../img/icons/';
	this.dhtmlxImagePath = '../libs/dhtmlx/imgs/';
	this.layout;
	this.toolbar;
	this.currentView;

	Services.prototype.InitUI = function() {
		this.layout = new dhtmlXLayoutObject({
			parent : 'app',
			pattern : '2U'
		});

		var toolbar = this.layout.attachToolbar();
		$(toolbar.cont).append('<div id="logo"></div>');

		this.layout.cells('a').setWidth(220);
		this.layout.cells('a').setText('Menu');
		this.layout.cells('b').setText('Home');
		this.layout.cells('b').hideArrow();

		this.toolbar = this.layout.cells('b').attachToolbar();
		this.toolbar.setIconsPath(this.fugueIconPath);

		var menu = this.layout.cells('a').attachTree();
		menu.setImagesPath(this.dhtmlxImagePath +'dhxtree_skyblue/');
		menu.setIconsPath(this.fugueIconPath);
		menu.loadJSONObject({
			id:0,
			item:[
				{id:1, text:'Report Services', im0:'gear.png', im1:'gear.png', im2:'gear.png', item:[
					{id:'Home', text:'Home', im0:'home.png'},
					{id:'Wizard', text:'Wizard', im0:'wand.png'},
					{id:'Global Connection', text:'Global Connection', im0:'globe-network.png', im1:'globe-network.png', im2:'globe-network.png'},
					{id:'Configuration', text:'Configuration', im0:'wrench-screwdriver.png'},
					{id:'Services Account', text:'Services Account', im0:'user-worker.png'},
					{id:'Viewer Account', text:'Viewer Account', im0:'users.png'},
					{id:'Encryption Key', text:'Encryption Key', im0:'key.png'},
					{id:'LNRE Source Reader', text:'LNRE Source Reader', im0:'application-search-result.png'},
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
			if (services.currentView !== id) {
				if ((id !== 'Exit without Logout') && (id !== 'Logout') && (id !== 1)) {
					services.layout.cells('b').setText(id);
					services.currentView = id;
				}
				
				if (id === 'Home') {
					services.LoadHome();
				} else if (id === 'Global Connection') {
					services.LoadGlobalConnection();
				} else if (id === 'Configuration') {

				} else if (id === 'Services Account') {
					services.LoadServicesAccount();
				} else if (id === 'Viewer Account') {

				} else if (id === 'Encryption Key') {

				} else if (id === 'Exit without Logout') {
					
				} else if (id === 'Logout') {

				} else if (id === 'Wizard') {
					services.LoadWizard();
				}
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
		\n\
		<div class="panel">\n\
			<h2 class="title">Source</h2>\n\
			<div class="content">\n\
				Reload configuration data from source file.<br/>\n\
				<input type="button" class="reloadSource" value="Reload Source"/>\n\
			</div>\n\
		</div>\n\
		\n\
		</div>\n\
		';

		this.layout.cells('b').hideToolbar();
		this.layout.cells('b').attachHTMLString(home);
	};

	Services.prototype.LoadWizard = function() {
		this.layout.cells('b').hideToolbar();

		var html = '<div id="wizard" class="content">\n\
			<h3>Report Configuration Wizard</h3>\n\
			<div class="step" style="display:block" data-step="1">\n\
				<h4>1. Select Report Files</h4>\n\
				Step 1 of 4 &nbsp;&nbsp;&nbsp; \n\
				<input type="button" disabled="disabled" value="&#171; Previous"/>\n\
				<input type="button" class="next" value="Next &#187;"/><hr/>\n\
				<p>Select report files you want to configure. You can choose one or more files.<br/>Note that, this wizard will overwrite configuration you have made on a particular files.</p>\n\
				<div class="reportFiles" style="width:400px; height:200px; border:1px solid #bbb; position:relative; overflow-y:scroll"></div>\n\
			</div>\n\
			\n\
			<div class="step" style="display:none" data-step="2">\n\
				<h4>2. Connection</h4>\n\
				Step 2 of 4 &nbsp;&nbsp;&nbsp; \n\
				<input type="button" class="prev" value="&#171; Previous"/>\n\
				<input type="button" class="next" value="Next &#187;"/><hr/>\n\
				<p>\n\
					<input type="radio" name="connection" checked="checked"/> Native connection \n\
					<input type="radio" name="connection"/> Global Connection \n\
					<input type="radio" name="connection"/> New Global Connection \n\
				</p>\n\
			</div>\n\
			\n\
			<div class="step" style="display:none" data-step="3">\n\
				<h4>3. Decryption Key</h4>\n\
				Step 3 of 4 &nbsp;&nbsp;&nbsp; \n\
				<input type="button" class="prev" value="&#171; Previous"/>\n\
				<input type="button" class="next" value="Next &#187;"/><hr/>\n\
				<p>Every single report file is encrypted with a key. In order to view actual report, the key<br/>will be used to decrypt and read the source file. If the key is invalid, an error will appear<br/>when you run the report via Report Viewer.</p>\n\
				Key : <input type="text"/>\n\
			</div>\n\
			\n\
			<div class="step" style="display:none" data-step="4">\n\
				<h4>4. View Permission</h4>\n\
				Step 4 of 4 &nbsp;&nbsp;&nbsp; \n\
				<input type="button" class="prev" value="&#171; Previous"/>\n\
				<input type="button" disabled="disabled" value="Next &#187;"/>\n\
				<input type="button" value="Finish"/><hr/>\n\
			</div>\n\
		</div>';

		this.layout.cells('b').attachHTMLString(html);
	};

	Services.prototype.LoadServicesAccount = function() {
		this.toolbar.clearAll();
		this.toolbar.loadStruct([
			{id:1, type:"button", text:"New Account", img:"plus.png", imgdis:"plus.png"},
			{id:2, type:"separator"},
			{id:3, type:"button", text:"Remove", img:"cross.png", imgdis:"cross.png"},
			{id:4, type:"separator"}
		]);
		this.layout.cells('b').showToolbar();

		var html = '<div id="servicesAccount" class="content">\n\
			<div class="content">\n\
				<h3>Services User</h3>\n\
				<table border="1">\n\
					<col style="width:30px"></col>\n\
					<col></col>\n\
					<col></col>\n\
					<col style="width:30px"></col>\n\
					<col></col>\n\
					<tr>\n\
						<th>#</th>\n\
						<th>Connection Name</th>\n\
						<th>Source Type</th>\n\
						<th><input type="checkbox" class="selectAll"/></th>\n\
						<th>Details</th>\n\
					</tr>\n\
					<tr>\n\
						<td>1.</td>\n\
						<td>%Nama Connection%</td>\n\
						<td class="center">Database</td>\n\
						<td class="center"><input type="checkbox" class="select"/></td>\n\
						<td class="center"><input type="button" class="details" value="View"/></td>\n\
					</tr>\n\
					<tr>\n\
						<td>2.</td>\n\
						<td>%Nama Connection%</td>\n\
						<td class="center">Database</td>\n\
						<td class="center"><input type="checkbox" class="select"/></td>\n\
						<td class="center"><input type="button" class="details" value="View"/></td>\n\
					</tr>\n\
					<tr>\n\
						<td>3.</td>\n\
						<td>%Nama Connection%</td>\n\
						<td class="center">Database</td>\n\
						<td class="center"><input type="checkbox" class="select"/></td>\n\
						<td class="center"><input type="button" class="details" value="View"/></td>\n\
					</tr>\n\
				</table>\n\
			</div>\n\
		</div>\n\
		';

		this.layout.cells('b').attachHTMLString(html);
	};

	Services.prototype.LoadGlobalConnection = function(){
		this.toolbar.clearAll();
		this.toolbar.loadStruct([
			{id:1, type:"button", text:"New Connection", img:"plus.png", imgdis:"plus.png"},
			{id:2, type:"separator"},
			{id:3, type:"button", text:"Remove", img:"cross.png", imgdis:"cross.png"},
			{id:4, type:"separator"}
		]);
		this.layout.cells('b').showToolbar();

		var html = '<div id="globalConnection" class="content">\n\
			<div class="content">\n\
				<table border="1">\n\
					<col style="width:30px"></col>\n\
					<col></col>\n\
					<col></col>\n\
					<col style="width:30px"></col>\n\
					<col></col>\n\
					<tr>\n\
						<th>#</th>\n\
						<th>Connection Name</th>\n\
						<th>Source Type</th>\n\
						<th><input type="checkbox" class="selectAll"/></th>\n\
						<th>Details</th>\n\
					</tr>\n\
					<tr>\n\
						<td>1.</td>\n\
						<td>%Nama Connection%</td>\n\
						<td class="center">Database</td>\n\
						<td class="center"><input type="checkbox" class="select"/></td>\n\
						<td class="center"><input type="button" class="details" value="View"/></td>\n\
					</tr>\n\
					<tr>\n\
						<td>2.</td>\n\
						<td>%Nama Connection%</td>\n\
						<td class="center">Database</td>\n\
						<td class="center"><input type="checkbox" class="select"/></td>\n\
						<td class="center"><input type="button" class="details" value="View"/></td>\n\
					</tr>\n\
					<tr>\n\
						<td>3.</td>\n\
						<td>%Nama Connection%</td>\n\
						<td class="center">Database</td>\n\
						<td class="center"><input type="checkbox" class="select"/></td>\n\
						<td class="center"><input type="button" class="details" value="View"/></td>\n\
					</tr>\n\
				</table>\n\
			</div>\n\
		</div>\n\
		';

		this.layout.cells('b').attachHTMLString(html);
	};

	Services.prototype.InitEvent = function() {
		$('body').on('change', 'input.selectAll', function(){
			var value = $(this).prop('checked');
			var table = $(this).closest('table');
			table.find('td input.select').prop('checked', value);

			if (value) {
				table.find('td').css('background-color', '#F3FFDB');
			} else {
				table.find('td').css('background-color', '');
			}
		});

		$('body').on('change', 'input.select', function(){
			var value = $(this).prop('checked');

			if (value) {
				$(this).closest('tr').find('td').css('background-color', '#F3FFDB');
			} else {
				$(this).closest('tr').find('td').css('background-color', '');
			}
		});

		// wizard next
		$('body').on('click', '#wizard input.next', function(){
			var stepElem = $(this).closest('div.step');
			var step = stepElem.attr('data-step');
			step = Number(step);

			stepElem.hide();
			$('#wizard div.step[data-step="'+ (step+1) +'"]').show();
		});

		// wizard previous
		$('body').on('click', '#wizard input.prev', function(){
			var stepElem = $(this).closest('div.step');
			var step = stepElem.attr('data-step');
			step = Number(step);

			stepElem.hide();
			$('#wizard div.step[data-step="'+ (step-1) +'"]').show();
		});
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