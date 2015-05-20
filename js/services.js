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

		services.NewGlobalConnection();
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
	this.currentWindowOpen = null;
	this.icon = {
		error : '<img src="../img/icons/exclamation-red-frame.png"/>'
	};

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
			else if (id === '1') {
				services.NewGlobalConnection();
			}
		});

		this.layout.cells('b').showToolbar();

		var html = this.LoadView('globalConnection');
		this.layout.cells('b').attachHTMLString(html);
	};

	Services.prototype.NewGlobalConnection = function() {
		var win = new dhtmlXWindows();
		win.attachViewportTo('app');

		var connectionWin = win.createWindow({
			id:"newConnection",
			width:550,
			height:450,
			center:true,
			modal:true,
			resize:false
		});
		connectionWin.button('minmax').hide();
		connectionWin.button('park').hide();
		connectionWin.setText('Add New Connection');

		// register current window open
		this.currentWindowOpen = connectionWin;

		connectionWin.attachHTMLString(this.LoadView('globalConnectionNew'));
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

		// global connection > new > next
		$('body').on('click', '#globalConnectionNew .buttons input.next', function(){
			var wrapper = $('#globalConnectionNew');
			var parts = wrapper.find('.part');
			var currentNumber = Number(wrapper.find('.content').attr('data-current'));
			var pageNumber = currentNumber + 1;
			parts.hide();

			wrapper.find('.part[data-number="'+ pageNumber +'"]').show();

			// update current number
			wrapper.find('.content').attr('data-current', pageNumber);

			if (pageNumber === 2) {
				wrapper.find('.buttons input.back').css('visibility','visible');
				wrapper.find('.buttons input.test').css('visibility','visible');
				wrapper.find('input[data-key="host"]').focus();

			} else if (pageNumber === 3) {
				wrapper.find('.buttons input.save').css('visibility','visible');
				wrapper.find('.buttons input.next').css('visibility','hidden');
				wrapper.find('.buttons input.test').css('visibility','hidden');
				wrapper.find('input[data-key="name"]').focus();
			}
		})

		// global connection > new > back
		$('body').on('click', '#globalConnectionNew .buttons input.back', function(){
			var wrapper = $('#globalConnectionNew');
			var parts = wrapper.find('.part');
			var currentNumber = Number(wrapper.find('.content').attr('data-current'));
			var pageNumber = currentNumber - 1;
			parts.hide();

			wrapper.find('.part[data-number="'+ pageNumber +'"]').show();

			// update current number
			wrapper.find('.content').attr('data-current', pageNumber);

			if (pageNumber === 1) {
				wrapper.find('.buttons input.next').css('visibility','visible');
				wrapper.find('.buttons input.back').css('visibility','hidden');
				wrapper.find('.buttons input.test').css('visibility','hidden');
				wrapper.find('.buttons input.save').css('visibility','hidden');

			} else if (pageNumber === 2) {
				wrapper.find('.buttons input.save').css('visibility','hidden');
				wrapper.find('.buttons input.next').css('visibility','visible');
				wrapper.find('.buttons input.test').css('visibility','visible');
				wrapper.find('input[data-key="host"]').focus();
			}
		})

		// global connection > edit details
		$('body').on('click', '#globalConnectionDetailsButton input.edit', function(){
			// dapatkan current window open
			var connectionWin = services.currentWindowOpen;

			var connName = $(this).attr('data-connection');

			// view
			var viewEditConnection = (function(connName){
				return services.LoadView('globalConnectionEdit', connName);
			})(connName);

			connectionWin.attachHTMLString(viewEditConnection);
		});

		// global connection > edit details > button > save
		$('body').on('click', '#globalConnectionEditButton input.save', function(){
			var form = $(services.currentWindowOpen.cell).find('table.windowForm');
			var oldConnName = $(this).attr('data-connection');
			var newConnName = form.find('input.connectionName').val();
			var detail = {};
			detail[newConnName] = {};

			// preloader
			services.currentWindowOpen.progressOn();

			// reload source
			services.ReloadSource(function(){

				// preloader off
				services.currentWindowOpen.progressOff();

				// jika name tak berubah
				if (newConnName === oldConnName) {

					form.find('input, select').each(function(){
						var key = $(this).attr('data-key');
						var value = $(this).val();

						if (key !== 'name') {
							detail[newConnName][key] = value;
						}
					});

					delete services.source.globalConnection[newConnName];
					services.source.globalConnection[newConnName] = detail[newConnName]; // write pada memory

					//services.WriteSourceFile('saveGlobalConnection', detail); // write source file
					services.WriteSourceFile();
				}

				// jika nama berubah DAN jika name dah ada
				else if (newConnName !== oldConnName && services.source.globalConnection[newConnName] !== undefined) {
					dhtmlx.alert({
						title : 'Error',
						text : services.icon.error + '<p>Name already exist!</p>'
					});

					return false;
				}

				// jika nama berubah DAN nama masih available
				else if (newConnName !== oldConnName && services.source.globalConnection[newConnName] === undefined) {

				}

			});
		});

		// global connection > edit details > button > cancel
		$('body').on('click', '#globalConnectionEditButton input.cancel', function(){
			services.currentWindowOpen.close();
			services.currentWindowOpen = null;
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

			// register current window open
			services.currentWindowOpen = connectionWin;

			// connection details string
			var viewConnectionDetails = (function(connectionName){
				return services.LoadView('globalConnectionDetails', connectionName);
			})(connName);

			connectionWin.attachHTMLString(viewConnectionDetails);
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

		// view > global connection new
		else if (viewId === 'globalConnectionNew') {
			return services.source.view[viewId];
		}

		// view > global connection details
		else if (viewId === 'globalConnectionDetails') {

			var conn = services.source.globalConnection[objectName];
			var detail = {
				'connectionName' : objectName,
				'connectionType' : conn.type,
				'connectionDbType' : conn.dbType,
				'connectionHost' : conn.host,
				'connectionUsername' : conn.username,
				'connectionDbName' : conn.dbName,
				'connectionPort' : conn.port,
				'connectionSID' : conn.sid,
				'connectionServiceName' : conn.serviceName,
				'connectionSocket' : conn.socket
			};

			return services._ReplaceVariableView(services.source.view[viewId], detail);
		}

		// view > global connection edit
		else if (viewId === 'globalConnectionEdit') {
			var conn = services.source.globalConnection[objectName];
			var detail = {
				'connectionName' : objectName,
				'connectionType' : conn.type,
				'connectionHost' : conn.host,
				'connectionUsername' : conn.username,
				'connectionPassword' : conn.password,
				'connectionDbName' : conn.dbName,
				'connectionPort' : conn.port,
				'connectionSID' : conn.sid,
				'connectionServiceName' : conn.serviceName,
				'connectionSocket' : conn.socket
			};

			return services._ReplaceVariableView(services.source.view[viewId], detail);
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

	Services.prototype.ReloadSource = function(callback) {
		$.ajax({
			url:this.phpPath + 'services.reload.php'
		})
		.done(function(data){
			try {
				var source = JSON.parse(data);
			} catch(e) {
				dhtmlx.alert({
					title : 'Reload Error',
					text : services.icon.error + '<p>Corrupted source file!<br/>"' + e.message + '"</p>'
				});
				return false;
			}

			// simpan view
			var view = $.extend({}, true, services.source.view);
			services.source = source;
			services.source.view = view;

			if (callback) callback();
		});
	};

	Services.prototype.WriteSourceFile = function(task, data) {
		if (this.currentWindowOpen !== null) this.currentWindowOpen.progressOn();

		var data = $.extend({}, true, services.source);
		delete data.view;

		$.ajax({
			url:this.phpPath + 'services.write.php',
			data:{data:JSON.stringify(data)},
			type:'post',
			dataType:'json'
		})
		.done(function(response){
			if (services.currentWindowOpen !== null) services.currentWindowOpen.progressOff();
			console.log(response);
		});


		/*if (this.currentWindowOpen !== null) this.currentWindowOpen.progressOn();

		$.ajax({
			url : this.phpPath + 'services.write.php',
			data : {
				task : task,
				data : data
			},
			type : 'post'
		})
		.done(function(response){
			if (services.currentWindowOpen !== null) services.currentWindowOpen.progressOff();

			console.log(response);
		});*/
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