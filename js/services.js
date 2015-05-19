$(function(){
	window.services = new Services();
	
	services.CheckLogin(function(response){
		services.source = response.source;
		services.InitUI();
		services.InitEvent();
		services.LoadGlobalConnection();
		//services.LoadServicesAccount();
		//services.LoadHome();
		//services.LoadWizard();
	});
});

function Services() {

	this.phpPath = '../php/';
	this.fugueIconPath = '../img/icons/';
	this.dhtmlxImagePath = '../libs/dhtmlx/imgs/';
	this.layout;
	this.toolbar;
	this.currentView;
	this.source = null;
	this.toolbarEvent = null;

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
					services.GoBackHome();
				} else if (id === 'Logout') {

				} else if (id === 'Wizard') {
					services.LoadWizard();
				}
			}
		});
	};

	Services.prototype.LoadHome = function() {
		this.layout.cells('b').hideToolbar();

		// load view home
		var home = this.LoadView('home');
		this.layout.cells('b').attachHTMLString(home);
	};

	Services.prototype.LoadWizard = function() {
		this.layout.cells('b').hideToolbar();

		// load view wizard
		var wizard = this.LoadView('wizard');
		this.layout.cells('b').attachHTMLString(wizard);
	};

	Services.prototype.LoadServicesAccount = function() {
		this.toolbar.clearAll();
		this.toolbar.loadStruct([
			{id:1, type:"button", text:"New Account", img:"plus.png", imgdis:"plus.png"},
			{id:2, type:"separator"},
			{id:3, type:"button", text:"Remove", img:"cross.png", imgdis:"cross.png"},
			{id:4, type:"separator"},
			{id:5, type:"button", text:"Table Binding", img:"application-table.png", imgdis:"application-table.png"}
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
						<th>Username</th>\n\
						<th>Type</th>\n\
						<th><input type="checkbox" class="selectAll"/></th>\n\
						<th>Details</th>\n\
					</tr>\n\
					<tr>\n\
						<td>1.</td>\n\
						<td>admin</td>\n\
						<td class="center">Native</td>\n\
						<td class="center"><input type="checkbox" class="select"/></td>\n\
						<td class="center"><input type="button" class="details" value="View"/></td>\n\
					</tr>\n\
					<tr>\n\
						<td>2.</td>\n\
						<td>penghulu</td>\n\
						<td class="center">Native</td>\n\
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
		this.ToolbarReset();
		this.toolbar.loadStruct([
			{id:1, type:"button", text:"New Connection", img:"plus.png", imgdis:"plus.png"},
			{id:2, type:"separator"},
			{id:3, type:"button", text:"Remove", img:"cross.png", imgdis:"cross.png"},
			{id:4, type:"separator"}
		]);

		this.toolbarEvent = this.toolbar.attachEvent('onClick', function(id){
			if (id === '3') {
				$('#globalConnection tr input.select').each(function(){
					var isChecked = $(this).prop('checked');
					var row = $(this).closest('tr');
					if (isChecked) {
						row.remove();
					}
				});

				$('#globalConnection input.selectAll').prop('checked', false);
			}
		});

		this.layout.cells('b').showToolbar();

		var html = this.LoadView('globalConnection');
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

		// global connection > view details
		$('body').on('click', '#globalConnection input.viewDetails', function(){
			// connection name
			var connName = $(this).closest('tr').attr('data-connection');

			// connection details
			var conn = services.source.globalConnection[connName];

			var win = new dhtmlXWindows();
			win.attachViewportTo('app');

			var connectionWin = win.createWindow({
				id:"connection",
				width:550,
				height:380,
				center:true,
				modal:true,
				resize:false
			});
			connectionWin.button('minmax').hide();
			connectionWin.button('park').hide();
			connectionWin.setText('Connection');

			// buttons
			var closingButton = (function(){
				return services.LoadView('globalConnectionDetailsClosingButton')
			})();

			// connection details string
			var viewConnectionDetails = (function(connectionName){
				return services.LoadView('globalConnectionDetails', connectionName);
			})(connName);

			/*var editConnection = '\n\
			<table border="0" class="windowForm">\n\
			<col style="width:120px"></col>\n\
			<col style="width:10px"></col>\n\
			<col></col>\n\
			<tr>\n\
				<td colspan="3"><b>Connection Details</b></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Connection Name</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="connectionName fullwidth" data-key="name" value="" autofocus="autofocus"/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Type</td>\n\
				<td>:</td>\n\
				<td>\n\
					<select class="type" data-key="type">\n\
						<option value="database">Database</option>\n\
					</select>\n\
				</td>\n\
			</tr>\n\
			<tr>\n\
				<td>Host</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="host fullwidth" data-key="host" value=""/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Username</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="username fullwidth" data-key="user" value=""/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Password</td>\n\
				<td>:</td>\n\
				<td><input type="password" class="password fullwidth" data-key="pass" value=""/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Database Name</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="host fullwidth" data-key="dbname" value=""/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Port</td>\n\
				<td>:</td>\n\
				<td><input type="number" class="port" data-key="port" value=""/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>SID</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="sid fullwidth" data-key="sid" value=""/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Service Name</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="serviceName fullwidth" data-key="serviceName" value=""/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Socket</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="socket fullwidth" data-key="socket" value=""/></td>\n\
			</tr>\n\
			</table>\n\
			';*/

			connectionWin.attachHTMLString(viewConnectionDetails + closingButton);
		});

		// global connection > show password
		$('body').on('click', '#showConnectionPassword', function(){
			var connName = $(this).attr('data-connection');
			var password = services.source.globalConnection[connName].password;
			$(this).closest('td').text(password);
		});
	};

	Services.prototype.LoadView = function(viewId, objectName) {

		// view > home
		if (viewId === 'home') {
			return services.source.view[viewId];
		}

		// view > wizard
		else if (viewId === 'wizard') {
			return services.source.view[viewId];
		}

		// view > global connection
		else if (viewId === 'globalConnection') {
			var dataHtml = '';

			// jika ada connection
			if (!$.isEmptyObject(services.source.globalConnection)) {
				var number = 1;

				for (var connName in services.source.globalConnection) {
					var conn = services.source.globalConnection[connName];
					var detail = {
						'number' : number,
						'connectionName' : connName,
						'connectionType' : conn.type
					};

					dataHtml += services._ReplaceVariableView(services.source.view['globalConnectionData'], detail);
					number++;
				}
			}
			// jika tiada
			else {
				dataHtml += services._ReplaceVariableView(services.source.view['globalConnectionNoData']);
			}

			return services._ReplaceVariableView(services.source.view['globalConnection'], {data:dataHtml});
		}

		// view > global connection details
		else if (viewId === 'globalConnectionDetails') {

			var conn = services.source.globalConnection[objectName];
			var detail = {
				'connectionName' : objectName,
				'connectionType' : conn.type,
				'connectionHost' : conn.host,
				'connectionUsername' : conn.username,
				'connectionDbName' : conn.dbName,
				'connectionPort' : conn.port,
				'connectionSID' : conn.sid,
				'connectionServiceName' : conn.serviceName,
				'connectionSocket' : conn.socket
			};

			return services._ReplaceVariableView(services.source.view['globalConnectionDetails'], detail);
		}

		// view > global connection details button
		else if (viewId === 'globalConnectionDetailsClosingButton') {
			return services.source.view[viewId];
		}
	};

	Services.prototype._ReplaceVariableView = function(view, variables) {
		for (var key in variables) {
			var find = '{{'+ key +'}}';
			var re = new RegExp(find, 'g');
			view = view.replace(re, variables[key]);
		}
		return view;
	};

	Services.prototype.ToolbarReset = function() {
		this.toolbar.clearAll();
		this.toolbar.detachEvent(this.toolbarEvent);
	};

	Services.prototype.CheckLogin = function(proceedFunction) {
		var request = $.ajax({
			url : this.phpPath + 'services.checklogin.php',
			dataType : 'json'
		});

		// jika butiran login tiada, patah balik ke landing page
		request.done(function(response){
			console.log(response);
			if (response.status === 0) {
				services.GoBackHomeWithError();
			} else if (response.status === 1) {
				proceedFunction(response);
			}
		});
	};

	Services.prototype.GoBackHome = function() {
		window.location.href = '../';
	};

	Services.prototype.GoBackHomeWithError = function() {
		window.location.href = '../?error=permission&page=services';
	};
}