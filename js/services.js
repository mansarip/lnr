$(function(){
	window.services = new Services();
	
	services.CheckLogin(function(response){
		services.source = response.source;
		services.InitUI();
		services.InitEvent();
		//services.LoadGlobalConnection();
		//services.LoadServicesAccount();
		services.LoadHome();
		//services.LoadWizard();

		//services.NewGlobalConnection();
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
		error : '<img src="../img/icons/exclamation-red-frame.png"/>',
		success : '<img src="../img/icons/tick.png"/>',
		warning : '<img src="../img/icons/exclamation.png"/>'
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
					services.LoadViewerAccount();
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
		this.ToolbarReset();
		this.toolbar.loadStruct([
			{id:1, type:"button", text:"New Account", img:"plus.png", imgdis:"plus.png"},
			{id:2, type:"separator"},
			{id:3, type:"button", text:"Remove", img:"cross.png", imgdis:"cross.png"},
			{id:4, type:"separator"}
		]);

		this.toolbarEvent = this.toolbar.attachEvent('onClick', function(id){
			if (id === '3') {
				services.RemoveServicesAccount();
			}
			else if (id === '1') {
				services.NewServicesAccount();
			}
		});

		this.layout.cells('b').showToolbar();
		this.layout.cells('b').attachHTMLString(services.LoadView('servicesAccount'));
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
				services.RemoveGlobalConnection();
			}
			else if (id === '1') {
				services.NewGlobalConnection();
			}
		});

		this.layout.cells('b').showToolbar();

		var html = this.LoadView('globalConnection');
		this.layout.cells('b').attachHTMLString(html);
	};

	Services.prototype.RemoveGlobalConnection = function() {
		dhtmlx.confirm({
			title:'Remove',
			text:services.icon.warning + "<br/>Confirm remove?",
			callback:function(answer){
				if (answer) {
					var removeFlag = false;

					$('#globalConnection tr input.select').each(function(){
						var isChecked = $(this).prop('checked');
						var row = $(this).closest('tr');
						var connName = row.attr('data-connection');

						if (isChecked) {
							removeFlag = true;
							row.remove();

							// buang dari memory
							delete services.source.globalConnection[connName];

							// write source
							services.WriteSourceFile(function(){
								services.ReloadSource(function(){
									services.LoadGlobalConnection();
								});
							});
						}
					});

					// jika user tak select apa2 untuk di-remove
					if (!removeFlag) {
						dhtmlx.message({
							text:'Nothing was removed'
						});
					}

					// reset
					$('#globalConnection input.selectAll').prop('checked', false);
				}
			}
		});
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

	Services.prototype.NewServicesAccount = function() {
		var win = new dhtmlXWindows();
		win.attachViewportTo('app');

		var accountWin = win.createWindow({
			id:"newServicesAccount",
			width:550,
			height:450,
			center:true,
			modal:true,
			resize:false
		});
		accountWin.button('minmax').hide();
		accountWin.button('park').hide();
		accountWin.setText('Add New Account');

		// register current window open
		this.currentWindowOpen = accountWin;

		accountWin.attachHTMLString(this.LoadView('servicesAccountNew'));
	};

	Services.prototype.RemoveServicesAccount = function() {
		// todo - user tidak boleh remove diri sendiri

		var currentUsername;

		this.layout.cells('b').progressOn();
		$.ajax({
			url: this.phpPath + 'services.getusername.php'
		})
		.done(function(name){
			services.layout.cells('b').progressOff();
			currentUsername = name;
			
			dhtmlx.confirm({
				title:'Remove',
				text:services.icon.warning + "<br/>Confirm remove?",
				callback:function(answer){
					if (answer) {
						var removeFlag = false;

						$('#servicesAccount tr input.select').each(function(){
							var isChecked = $(this).prop('checked');
							var row = $(this).closest('tr');
							var username = row.attr('data-name');

							if (isChecked && username !== currentUsername) {
								removeFlag = true;
								row.remove();

								// buang dari memory
								delete services.source.servicesAccount.account[username];

								// write source
								services.WriteSourceFile(function(){
									services.ReloadSource(function(){
										services.LoadServicesAccount();
									});
								});
							}
						});

						// jika user tak select apa2 untuk di-remove
						if (!removeFlag) {
							dhtmlx.message({
								text:'Nothing was removed'
							});
						}

						// reset
						$('#servicesAccount input.selectAll').prop('checked', false);
					}
				}
			});
		})
		.fail(function(response){
			services.layout.cells('b').progressOff();
		});
	};

	Services.prototype.LoadViewerAccount = function() {
		this.ToolbarReset();
		this.toolbar.loadStruct([
			{id:1, type:"button", text:"New Account", img:"plus.png", imgdis:"plus.png"},
			{id:2, type:"separator"},
			{id:3, type:"button", text:"Remove", img:"cross.png", imgdis:"cross.png"},
			{id:4, type:"separator"}
		]);

		this.toolbarEvent = this.toolbar.attachEvent('onClick', function(id){
			if (id === '3') {
				//services.RemoveServicesAccount();
			}
			else if (id === '1') {
				//services.NewServicesAccount();
			}
		});

		this.layout.cells('b').showToolbar();
		this.layout.cells('b').attachHTMLString(services.LoadView('viewerAccount'));
	};

	Services.prototype.InitEvent = function() {
		$('body').on('change', 'input.selectAll', function(){
			var value = $(this).prop('checked');
			var table = $(this).closest('table');
			table.find('td input.select').prop('checked', value);

			if (value) {
				table.find('td').css('background-color', '#C7E4FF');
			} else {
				table.find('td').css('background-color', '');
			}
		});

		$('body').on('change', 'input.select', function(){
			var value = $(this).prop('checked');

			if (value) {
				$(this).closest('tr').find('td').css('background-color', '#C7E4FF');
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
		});

		// global connection > new > cancel
		$('body').on('click', '#globalConnectionNew .buttons input.cancel', function(){
			services.currentWindowOpen.close();
			services.currentWindowOpen = null;
		});

		// global connection > new > test connection
		$('body').on('click', '#globalConnectionNew .buttons input.test', function(){
			var details = {};

			$('#globalConnectionNew input, #globalConnectionNew select').each(function(){
				var key = $(this).attr('data-key');
				var value = $(this).val();

				if (key) {
					details[key] = value;
				}
			});

			services.TestConnection(details);
		});

		// global connection > new > save
		$('body').on('click', '#globalConnectionNew .buttons input.save', function(){
			var details = {};
			var connName;

			$('#globalConnectionNew input, #globalConnectionNew select').each(function(){
				var key = $(this).attr('data-key');
				var value = $(this).val();

				if (key) {
					details[key] = value;
				}
			});

			connName = details.name;
			delete details.name;

			// jika nama empty string
			if (connName === '') {
				dhtmlx.alert({
					title : 'Error',
					text : services.icon.error + '<p>Connection name can\'t be empty!</p>'
				});
				return false;
			}
			else {
				services.currentWindowOpen.progressOn();
				services.ReloadSource(function(){
					services.currentWindowOpen.progressOff();

					// jika nama dah ada
					if (services.source.globalConnection[connName] !== undefined) {
						dhtmlx.alert({
							title : 'Error',
							text : services.icon.error + '<p>Connection name already exist!</p>'
						});
						return false;
					}
					else {
						services.source.globalConnection[connName] = details;

						services.WriteSourceFile(function(response){
							if (response.status === 1) {
								services.DisplaySuccessMessage('New connection successfully added.', 3000);
							}
							services.currentWindowOpen.close();
							services.currentWindowOpen = null;

							services.ReloadSource(function(){
								services.LoadGlobalConnection();
							});
						});
					}
				});
			}
		});

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

		// global connection > edit details > button > test
		$('body').on('click', '#globalConnectionEdit input.test', function(){
			var details = {};

			$('#globalConnectionEdit input[data-key], #globalConnectionEdit select[data-key]').each(function(){
				var value = $(this).val();
				var key = $(this).attr('data-key');
				details[key] = value;
			});

			services.TestConnection(details);
		});

		// global connection > edit details > button > save
		$('body').on('click', '#globalConnectionEdit input.save', function(){
			var wrapper = $('#globalConnectionEdit');
			var oldConnName = $(this).attr('data-connection');
			var newConnName = wrapper.find('input[data-key="name"]').val();
			var detail = {};
			detail[newConnName] = {};

			services.currentWindowOpen.progressOn();
			services.ReloadSource(function(){
				services.currentWindowOpen.progressOff();

				// jika nama tak berubah
				if (newConnName === oldConnName) {
					wrapper.find('input[data-key], select[data-key]').each(function(){
						var value = $(this).val();
						var key = $(this).attr('data-key');
						detail[newConnName][key] = value;
					});

					delete services.source.globalConnection[newConnName];
					services.source.globalConnection[newConnName] = detail[newConnName]; // write pada memory

					services.WriteSourceFile(function(response){
						if (response.status === 1) {
							services.DisplaySuccessMessage('Connection successfully saved!');
							services.currentWindowOpen.close();
							services.currentWindowOpen = null;
							services.layout.cells('b').attachHTMLString(services.LoadView('globalConnection'));
						}
					});
				}

				// jika nama berubah DAN nama dah ada
				else if (newConnName !== oldConnName && services.source.globalConnection[newConnName] !== undefined) {
					dhtmlx.alert({
						title : 'Error',
						text : services.icon.error + '<p>Name already exist!</p>'
					});
					return false;	
				}

				// jika nama berubah DAN nama masih available
				else if (newConnName !== oldConnName && services.source.globalConnection[newConnName] === undefined) {
					wrapper.find('input[data-key], select[data-key]').each(function(){
						var value = $(this).val();
						var key = $(this).attr('data-key');
						detail[newConnName][key] = value;
					});

					delete services.source.globalConnection[oldConnName];
					services.source.globalConnection[newConnName] = detail[newConnName]; // write pada memory

					services.WriteSourceFile(function(response){
						if (response.status === 1) {
							services.DisplaySuccessMessage('Connection successfully saved!');
							services.currentWindowOpen.close();
							services.currentWindowOpen = null;
							services.layout.cells('b').attachHTMLString(services.LoadView('globalConnection'));
						}
					});
				}
			});
		});

		// global connection > edit details > button > cancel
		$('body').on('click', '#globalConnectionEdit input.cancel', function(){
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
				height:490,
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

		// global connection > view details > test connection
		$('body').on('click', '#globalConnectionDetailsButton input.test', function(){
			var connName = $(this).attr('data-connection');
			var details = services.source.globalConnection[connName];
			services.TestConnection(details);
		});

		// global connection > view details > close
		$('body').on('click', '#globalConnectionDetailsButton input.close', function(){
			services.currentWindowOpen.close();
			services.currentWindowOpen = null;
		});

		// global connection > show password
		$('body').on('click', '#showConnectionPassword', function(){
			var connName = $(this).attr('data-connection');
			var password = services.source.globalConnection[connName].password;
			$(this).closest('td').text(password);
		});

		// services account > new > cancel
		$('body').on('click', '#servicesAccountNew input.cancel', function(){
			services.currentWindowOpen.close();
			services.currentWindowOpen = null;
		});

		// services account > new > save
		$('body').on('click', '#servicesAccountNew input.save', function(){
			var wrapper = $('#servicesAccountNew');
			var username = wrapper.find('input.name').val();
			var password = wrapper.find('input.password').val();

			// jika nama kosong
			if (username === '') {
				dhtmlx.alert({
					title : 'Error',
					text : services.icon.error + '<p>Username cannot be empty!</p>'
				});
				return false;
			}

			// jika nama dah ada
			else if (services.source.servicesAccount.account[username] !== undefined) {
				dhtmlx.alert({
					title : 'Error',
					text : services.icon.error + '<p>Username already exists!</p>'
				});
				return false;
			}

			// jika password kosong
			else if (password === '') {
				dhtmlx.alert({
					title : 'Error',
					text : services.icon.error + '<p>Password cannot be empty!</p>'
				});
				return false;
			}

			// jika ok
			else {
				services.currentWindowOpen.progressOn();
				services.ReloadSource(function(){
					services.currentWindowOpen.progressOn();
					var details = {};
					details['privileges'] = {};
					details['password'] = password;

					wrapper.find('input[type="checkbox"]').each(function(){
						var key = $(this).attr('data-key');
						var value = $(this).prop('checked');
						details['privileges'][key] = value;
					});

					services.source.servicesAccount.account[username] = details;
					services.WriteSourceFile(function(response){
						if (response.status === 1) {
							services.DisplaySuccessMessage('New account successfully added.', 3000);
						}
						services.currentWindowOpen.close();
						services.currentWindowOpen = null;

						services.ReloadSource(function(){
							services.LoadServicesAccount();
						});
					});
				});
			}
		});

		// services account > new > check all privileges
		$('body').on('change', '#servicesAccountNew input.checkAll', function(){
			var value = $(this).prop('checked');
			$('#servicesAccountNew input[type="checkbox"]').each(function(){
				$(this).prop('checked', value);
			});
		});

		// services account > view details
		$('body').on('click', '#servicesAccount input.viewDetails', function(){
			var username = $(this).closest('tr').attr('data-name');

			var win = new dhtmlXWindows();
			win.attachViewportTo('app');

			var accountWin = win.createWindow({
				id:"servicesAccount",
				width:550,
				height:400,
				center:true,
				modal:true,
				resize:false
			});
			accountWin.button('minmax').hide();
			accountWin.button('park').hide();
			accountWin.setText('Account Details');

			// register current window open
			services.currentWindowOpen = accountWin;

			// account details string
			var viewAccountDetails = (function(username){
				return services.LoadView('servicesAccountDetails', username);
			})(username);

			accountWin.attachHTMLString(viewAccountDetails);
		});

		// services account > details > edit
		$('body').on('click', '#servicesAccountDetails input.edit', function(){
			var wrapper = $('#servicesAccountDetails');
			wrapper.find('h1.title').text('Edit Account Details');
			wrapper.find('input').each(function(){
				$(this).prop('disabled', false);
				$(this).prop('readonly', false);
			});

			wrapper.find('input.name').focus();

			// buttons
			$(this).hide();
			wrapper.find('input.close').hide();
			wrapper.find('input.save, input.cancel, input.checkAll').show();
		});

		// services account > details > check all privileges
		$('body').on('change', '#servicesAccountDetails input.checkAll', function(){
			var value = $(this).prop('checked');
			$('#servicesAccountDetails input[type="checkbox"]').each(function(){
				$(this).prop('checked', value);
			});
		});

		// services account > details > close
		$('body').on('click', '#servicesAccountDetails input.close, #servicesAccountDetails input.cancel', function(){
			services.currentWindowOpen.close();
			services.currentWindowOpen = null;
		});

		// Init Event End ::
	};

	Services.prototype.LoadView = function(viewId, objectName) {

		// view > global connection
		if (viewId === 'globalConnection') {
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

		// view > services account
		else if (viewId === 'servicesAccount') {
			var dataHtml = '';

			// jika ada data
			if (!$.isEmptyObject(services.source.servicesAccount.account)) {
				var number = 1;

				for (var user in services.source.servicesAccount.account) {
					var detail = {
						'number' : number,
						'userName' : user,
						'type' : 'Native'
					};

					dataHtml += services._ReplaceVariableView(services.source.view['servicesAccountData'], detail);
					number++;
				}
			}
			// jika tiada
			else {
				dataHtml += services._ReplaceVariableView(services.source.view['servicesAccountNoData']);
			}

			return services._ReplaceVariableView(services.source.view['servicesAccount'], {data:dataHtml});
		}

		// view > services account > details
		else if (viewId === 'servicesAccountDetails') {
			//var details = services.source.servicesAccount.account[objectName];
			var detail = {
				'username' : objectName,
				'password' : services.source.servicesAccount.account[objectName].password,
				'reportDesigner' : (services.source.servicesAccount.account[objectName].privileges.reportDesigner ? 'checked="checked"' : ''),
				'servicesConfiguration' : (services.source.servicesAccount.account[objectName].privileges.servicesConfiguration ? 'checked="checked"' : ''),
				'servicesGlobalConnection' : (services.source.servicesAccount.account[objectName].privileges.servicesGlobalConnection ? 'checked="checked"' : ''),
				'servicesLNRESourceReader' : (services.source.servicesAccount.account[objectName].privileges.servicesLNRESourceReader ? 'checked="checked"' : ''),
				'servicesServicesAccount' : (services.source.servicesAccount.account[objectName].privileges.servicesServicesAccount ? 'checked="checked"' : ''),
				'servicesViewerAccount' : (services.source.servicesAccount.account[objectName].privileges.servicesViewerAccount ? 'checked="checked"' : ''),
				'servicesWizard' : (services.source.servicesAccount.account[objectName].privileges.servicesWizard ? 'checked="checked"' : '')
			};
			return services._ReplaceVariableView(services.source.view[viewId], detail);
		}

		// view > viewer account
		else if (viewId === 'viewerAccount') {
			var dataHtml = '';

			// jika ada data
			if (!$.isEmptyObject(services.source.viewerAccount.account)) {
				var number = 1;

				for (var user in services.source.viewerAccount.account) {
					var total = services.source.viewerAccount.account[user].report.length;
					var detail = {
						'number' : number,
						'userName' : user,
						'total' : total
					};

					dataHtml += services._ReplaceVariableView(services.source.view['viewerAccountData'], detail);
					number++;
				}
			}
			// jika tiada
			else {
				dataHtml += services._ReplaceVariableView(services.source.view['viewerAccountNoData']);
			}

			return services._ReplaceVariableView(services.source.view[viewId], {data:dataHtml});
		}

		// else (directly amik dari html)
		else {
			return services.source.view[viewId];
		}
	};

	Services.prototype._ReplaceVariableView = function(view, variables) {
		for (var key in variables) {
			var find = '{{'+ key +'}}';
			var re = new RegExp(find, 'g');
			view = view.replace(re, variables[key]);
		}

		// dropdown default value
		var jqObj = $(view);
		jqObj.find('select[data-default]').each(function(){
			$(this).find('option[value="'+ ($(this).attr('data-default')) +'"]').attr('selected','selected');
		});

		return jqObj.prop('outerHTML');
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

	Services.prototype.WriteSourceFile = function(callback) {
		if (this.currentWindowOpen !== null) this.currentWindowOpen.progressOn();

		var data = $.extend({}, true, services.source);
		delete data.view;

		console.log(data);

		$.ajax({
			url:this.phpPath + 'services.write.php',
			data:{data:JSON.stringify(data)},
			type:'post',
			dataType:'json'
		})
		.done(function(response){
			if (services.currentWindowOpen !== null) services.currentWindowOpen.progressOff();
			if (callback) callback(response);
		});
	};

	Services.prototype.TestConnection = function(data) {
		if (this.currentWindowOpen !== null) this.currentWindowOpen.progressOn();

		$.ajax({
			url:this.phpPath + 'services.testconnection.php',
			data:data,
			type:'post',
			dataType:'json'
		})
		.done(function(response){
			if (services.currentWindowOpen !== null) services.currentWindowOpen.progressOff();

			if (response.status === 0) {
				dhtmlx.alert({
					title : 'Error',
					text : services.icon.error + '<p>'+ response.message +'</p>'
				});
			} else if (response.status === 1) {
				dhtmlx.alert({
					title : 'Success',
					text : services.icon.success + '<p>Successfully connected!</p>'
				});
			}
		});
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
			} else if (response.status === 2) {
				document.write('<b>Error : </b> Unable to read source file');
			}
		});
	};

	Services.prototype.DisplaySuccessMessage = function(message, timer) {
		if (!timer) timer = 2000;
		dhtmlx.message({
			text:'<table border="0"><col style="width:30px"><col><tr><td><img src="../img/icons/tick.png"></td><td>'+ message +'</td></tr></table>',
			expire:timer
		});
	};

	Services.prototype.GoBackHome = function() {
		window.location.href = '../';
	};

	Services.prototype.GoBackHomeWithError = function() {
		window.location.href = '../?error=permission&page=services';
	};
}