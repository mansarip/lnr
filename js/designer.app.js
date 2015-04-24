function Designer() {

	this.phpPath = '../php/';
	//this.fugueIconPath = '../libs/fugue_icons/';
	this.fugueIconPath = '../img/icons/';
	this.dhtmlxImagePath = '../libs/dhtmlx/imgs/';
	this.layout = null;
	this.toolbar = null;
	this.statusBar = null;
	this.tabbar = {};
	this.tree = {
		structure : null,
		data : null,
		element : null
	};
	this.details = {
		app : null,
		report : null
	};
	this.propertiesGrid = null;
	this.parameterListGrid;
	this.parameterStatusBarBottom;
	this.mainQuery = null;
	this.currentSelectedElement = null;
	this.currentWindowOpen = null;
	this.currentTreeSelected = null;

	Designer.prototype.CheckLogin = function(proceedFunc) {
		var request = $.ajax({
			url : this.phpPath + 'designer.checklogin.php'
		});

		// jika butiran login tiada, patah balik ke landing page
		request.done(function(response){
			if (response === '0') {
				designer.GoBackHome();
			} else {
				proceedFunc();
			}
		});
	};

	Designer.prototype.InitDetails = function() {
		// (default structure)
		this.details.default = {
			general :{
				"reportTitle" : "Untitled",
				"author" : ""
			},
			format :{
				"paper":"A4",
				"orientation":"P"
			},
			bandWidth : { //*notes : 1mm = 3px
				"A5" : {"P": 444, "L": 630},
				"A4" : {"P": 630, "L": 891},
				"A3" : {"P": 891, "L": 1260},
				"Letter" : {"P": 648, "L": 1068}
			},
			band : {
				"Report Header" : { "treeId":'reportHeader' },
				"Page Header" : { "treeId":'pageHeader' },
				"Header" : { "treeId":'header' },
				"Detail" : { "treeId":'detail' },
				"Footer" : { "treeId":'footer' },
				"Page Footer" : { "treeId":'pageFooter' },
				"Report Footer" : { "treeId":'reportFooter' }
			},
			element : {
				"Label" : {"icon":"ui-label.png"},
				"Field" : {"icon":"ui-text-field.png"},
				"Rectangle" : {"icon":"layer-shape.png"},
				"Image" : {"icon":"picture.png"},
				"SVG" : {"icon":"document-text-image.png"},
				"QR Code" : {"icon":"barcode-2d.png"},
				"Barcode" : {"icon":"barcode.png"}
			},
			margin : {
				"top" : 7,
				"left" : 7,
				"right" : 7,
				"bottom" : 20,
				"footer" : 5
			}
		};

		// application
		// copy values dari default structure
		this.details.app = {
			general : this.details.default.general,
			format : this.details.default.format,
			element : this.details.default.element,
			band : this.details.default.band,
			margin : this.details.default.margin,
			parameter : {}, // declare as object
			connection : {},
			dataSource : {}
		};

		// report (default structure)
		/*
		penting : object ini hanya boleh ditulis sahaja, tidak boleh dibaca.
		bermaksud, application tidak boleh gunakan data2 yang ada dalam object ini
		untuk tujuan pemprosesan dan sebagainya. data2 dalam object ini 
		tidak boleh dijadikan rujukan, tetapi boleh diolah oleh application.
		*/
		this.details.report = {
			general:{
				name:"",
				author:""
			},
			data:{
				connection:{},
				query:{},
				parameter:{},
				businessLogic:{}
			},
			layout:{
				general:{
					unit:"",
					format:"",
					orientation:"",
					margin:{}
				},
				band:{}
			}
		};
	};

	Designer.prototype.InitUI = function() {
		this.layout = new dhtmlXLayoutObject({
			parent : 'app',
			pattern : '4L'
		});

		// hide header
		this.layout.cells('a').hideHeader();

		// ubah header text
		this.layout.cells('b').setText('Workspace');
		this.layout.cells('c').setText('Elements');
		this.layout.cells('d').setText('Properties');

		// setkan saiz cell
		this.layout.cells('a').setWidth(230);
		this.layout.cells('c').setWidth(230);
		this.layout.cells('c').setHeight(200);

		this.layout.cells('b').hideArrow();

		// add tabbar pada cell a
		this.tabbar.cellA = this.layout.cells('a').attachTabbar();
		this.tabbar.cellA.addTab('structure','Structure');
		this.tabbar.cellA.addTab('data','Data');

		// aktifkan tab
		this.tabbar.cellA.cells('structure').setActive();
		
		// attach toolbar dan status bar pada main layout
		this.toolbar = this.layout.attachToolbar();
		this.statusBar = this.layout.attachStatusBar({height:10});

		// init toolbar
		this.InitMainToolbar();

		// init menu
		this.InitMenu();

		// init structure tree
		this.InitStructureTree();

		// init data tree
		this.InitDataTree();

		// init element tree
		this.InitElementTree();

		// init workspace
		this.InitWorkspace();

		// init properties
		this.InitProperties();
	};

	Designer.prototype.InitMenu = function() {
		var menu = this.layout.attachMenu({
			items:[
				{id:1, text:'File', items:[
					{id:1.1, text:'_New'},
					{id:1.2, text:'_Open'},
					{id:1.3, text:'_Save'},
					{id:1.4, type:'separator'},
					{id:1.5, text:'Preview'},
					{id:1.6, text:'_Publish'},
					{id:1.7, type:'separator'},
					{id:1.8, text:'_Back To Home'},
					{id:1.9, text:'Logout'}
				]},
				{id:2, text:'Edit', items:[
					{id:2.1, text:'_Undo'},
					{id:2.2, text:'_Redo'},
					{id:2.3, type:'separator'},
					{id:2.4, text:'_Cut'},
					{id:2.5, text:'_Copy'},
					{id:2.6, text:'_Paste'},
					{id:2.7, type:'separator'},
					{id:2.8, text:'Preferences'}
				]},
				{id:3, text:'View', items:[
					{id:3.1, text:'_Zoom In'},
					{id:3.2, text:'_Zoom Out'},
					{id:3.3, type:'separator'},
					{id:3.4, text:'Refresh'}
				]},
				{id:5, text:'Data', items:[
					{id:5.1, text:'Connection'},
					{id:5.2, text:'Data Source'},
					{id:5.3, text:'Parameter'},
					{id:5.4, text:'Group'}
				]},
				{id:4, text:'Help', items:[
					{id:4.1, text:'_Documentation'},
					{id:4.2, text:'_Report An Issue'},
					{id:4.3, type:'separator'},
					{id:4.4, text:'_About'}
				]}
			]
		});

		menu.attachEvent('onClick', function(id){
			if      (id === '2.8') { designer.OpenPreferencesWindow(); }
			else if (id === '5.1') { designer.OpenConnectionWindow(); }
			else if (id === '5.2') { designer.OpenDataSourceWindow(); }
			else if (id === '5.3') { designer.OpenParameterWindow(); }
			else if (id === '5.4') { designer.OpenGroupWindow(); }
			else if (id === '1.5') { designer.Preview(); }
			else if (id === '1.9') { designer.Logout(); }
			else if (id === '3.4') { designer.Refresh(); }
		});
	};

	Designer.prototype.InitMainToolbar = function() {
		var defaultButton = [
			// general
			{id:1, type:"button", title:"New", img:"document.png"},
			{id:2, type:"button", title:"Open", img:"folder-horizontal-open.png"},
			{id:3, type:"button", title:"Save", img:"disk-return-black.png"},
			{id:4, type:"separator"},

			// data management
			{id:6, type:"button", title:"Connection", img:"lightning.png"},
			{id:9, type:"button", title:"Source", img:"database-network.png"},
			{id:8, type:"button", title:"Parameter", img:"paper-plane.png"},
			{id:5, type:"button", title:"Group", img:"category-group.png"},
			{id:14, type:"separator"},

			// layout
			{id:15, type:"button", title:"Refresh", img:"arrow-circle-045-left.png"},
			{id:16, type:"separator"},

			// viewing & publishing
			{id:10, type:"button", title:"Preview", img:"magnifier.png"},
			{id:7, type:"button", title:"Publish", img:"globe--arrow.png"},
			{id:17, type:"separator"},

			// logout
			{id:18, type:"button", title:"Logout", img:"door-open-out.png"},
		];

		this.toolbar.setIconsPath(this.fugueIconPath);
		this.toolbar.loadStruct(defaultButton);

		// event register
		this.toolbar.attachEvent('onClick', function(id){

			// new
			if (id === '1') {

			}
			// source window
			else if (id === '9') {
				designer.OpenDataSourceWindow();
			}
			// parameter window
			else if (id === '8') {
				designer.OpenParameterWindow();
			}
			// connection window
			else if (id === '6') {
				designer.OpenConnectionWindow();
			}
			// refresh
			else if (id === '15') {
				designer.Refresh();
			}
			// preview
			else if (id === '10') {
				designer.Preview();
			}
			// logout
			else if (id === '18') {
				designer.Logout();
			}
			// group window
			else if (id === '5') {
				designer.OpenGroupWindow();
			}
		});
	};

	Designer.prototype.OpenConnectionWindow = function(selectItemId) {
		var mode = null;
		var editName = null;
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');

		var connectionWin = windows.createWindow({
		    id:"connection",
		    width:550,
		    height:430,
		    center:true,
		    modal:true,
		    resize:false
		});
		connectionWin.button('minmax').hide();
		connectionWin.button('park').hide();
		connectionWin.setText('Connection');

		this.currentWindowOpen = connectionWin;

		var toolbar = connectionWin.attachToolbar();
		var layout = connectionWin.attachLayout({ pattern:'2U' });

		layout.cells('a').hideHeader();
		layout.cells('b').hideHeader();

		layout.cells('a').setWidth(130);

		var button = [
			// general
			{id:1, type:"button", text:"Add New", img:"lightning--plus.png"},
			{id:2, type:"separator"},
			{id:3, type:"button", text:"Remove", img:"cross.png"}
		];

		toolbar.setIconsPath(this.fugueIconPath);
		toolbar.loadStruct(button);
		toolbar.hideItem(3);

		// load connection from details (jika ada)
		var savedConnection = [];
		if (!$.isEmptyObject(designer.details.app.connection)) {
			for (var key in designer.details.app.connection) {
				savedConnection.push({
					id:key,
					text:key,
					im0:'document.png',
					im1:'document.png',
					im2:'document.png'
				});
			}
		}

		// left side
		var tree = layout.cells('a').attachTree();
		tree.setImagesPath(this.dhtmlxImagePath +'dhxtree_skyblue/');
		tree.setIconsPath(this.fugueIconPath);
		tree.loadJSONObject({id:0, item: savedConnection }); //root id 0

		// right side
		var noConnectionAvailable = '<div id="connectionWinMessage"><p>No connection available.</p></div>';
		var noConnectionSelected = '<div id="connectionWinMessage"><p>No connection selected.</p></div>';

		// jika tiada connectionWin
		if ($.isEmptyObject(designer.details.app.connection)) {
			layout.cells('b').attachHTMLString(noConnectionAvailable);
		} else {
			layout.cells('b').attachHTMLString(noConnectionSelected);
		}

		// closing button
		var closingButton = '\n\
		<div class="buttonPlaceholder" style="padding:10px 15px;">\n\
			<input type="button" class="test" style="padding:6px 35px" value="Test"/>\n\
			<input type="button" class="save" style="padding:6px 35px" value="Save"/>\n\
			<input type="button" class="reset" value="Reset"/>\n\
		</div>';

		// event : toolbar onclick
		toolbar.attachEvent('onClick', function(id){

			// add new connection
			if (id === '1') {
				// clear tree selection
				tree.clearSelection();
				toolbar.hideItem(3);

				mode = 'add';
				var addNewConnection = '\n\
				<table border="0" class="windowForm" id="connectionAddNew">\n\
				<col style="width:120px"></col>\n\
				<col style="width:10px"></col>\n\
				<col></col>\n\
				<tr>\n\
					<td colspan="3"><b>Add New Connection</b></td>\n\
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
							<option value="mysql">MySQL</option>\n\
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
				';

				layout.cells('b').attachHTMLString(addNewConnection + closingButton);
			}

			// remove connection
			else if (id === '3') {
				dhtmlx.confirm({
					title: "Remove",
					type:"confirm-info",
					text: "<img src='../img/icons/exclamation.png'/><br/>Remove this connection?",
					callback: function(answer) {
						if (answer === true) {
							var connName = tree.getSelectedItemId();

							layout.cells('a').progressOff();
							layout.cells('b').progressOff();

							designer.tree.data.deleteItem('4:::'+connName, false);
							tree.deleteItem(connName, false);

							// remove from details #setter
							delete designer.details.app.connection[connName];

							if ($.isEmptyObject(designer.details.app.connection)) {
								layout.cells('b').attachHTMLString(noConnectionAvailable);
							} else {
								layout.cells('b').attachHTMLString(noConnectionSelected);
							}

							// hide button remove
							toolbar.hideItem(3);
						}
					}
				});
			}

		});

	 	// test button
		$(layout.base).on('click', '.buttonPlaceholder input.test', function(){

			var connectionForm = (mode === 'add') ? $('#connectionAddNew') : $('#connectionEdit');
			var detail = {};

			connectionForm.find('input, select').each(function(){
				var key = $(this).attr('data-key');
				var value = $(this).val();
				detail[key] = value;
			});

			connectionWin.progressOn();

			if (detail.host === '') {
				connectionWin.progressOff();
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Invalid host'
				});
				return false;

			} else if (detail.user === '') {
				connectionWin.progressOff();
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Invalid user'
				});
				return false;

			} else {
				$.ajax({
					url:designer.phpPath + 'designer.testconnection.php',
					type:'post',
					data:detail,
					dataType:'json'
				})
				.done(function(response){
					connectionWin.progressOff();
					dhtmlx.alert({
						title:(response.status === 0 ? 'Failure' : 'Success'),
						style:"alert-info",
						text:(response.status === 0 ? response.message : 'Successfully connected!')
					});
				})
				.fail(function(){
					connectionWin.progressOff();
					dhtmlx.alert({
						title:'Unexpected Error',
						style:"alert-error",
						text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Failed to connect server'
					});
					return false;
				});
			}
		});

	 	// reset button
		$(layout.base).on('click', '.buttonPlaceholder input.reset', function(){
			var connectionForm = (mode === 'add') ? $('#connectionAddNew') : $('#connectionEdit');
			connectionForm.find('input, select').each(function(){
				$(this).val('');
			});
			connectionForm.find('input.name').focus();
		});

	 	// save button (connection add new)
		$(layout.base).on('click', '.buttonPlaceholder input.save', function(){
			var message = '';
			var connectionForm = (mode === 'add') ? $('#connectionAddNew') : $('#connectionEdit');
			var detail = {};
			
			connectionForm.find('input, select').each(function(){
				var key = $(this).attr('data-key');
				var value = $(this).val();
				detail[key] = value;
			});

			// validate
			if (detail.name === '') {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Unable to save : Empty connection name'
				});
				return false;
			}
			if (detail.type === '') {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Unable to save : Invalid connection type'
				});
				return false;
			}

			// add mode
			if (mode === 'add') {
				// jika nama dah ada
				if (designer.details.app.connection[detail.name] !== undefined) {
					dhtmlx.alert({
						title:'Error',
						style:"alert-info",
						text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Unable to save : Connection name already exist'
					});
					return false;
				}

				// add new connection #setter
				designer.details.app.connection[detail.name] = detail;

				// tambah pada tree
				tree.insertNewItem(0, detail.name, detail.name, null, 'document.png', 'document.png', 'document.png');
				designer.tree.data.insertNewItem(4, '4:::' + detail.name, detail.name, null, 'document.png', 'document.png', 'document.png'); // letak prefix parent id

				// reset right side
				layout.cells('b').attachHTMLString(noConnectionSelected);

				// reset mode
				mode = null;

				message = 'Connection has been successfully added.';
			}

			// edit mode
			else if (mode === 'edit') {

				// jika nama lama tidak sama dengan nama baru
				if (editName !== detail.name) {

					// nama dah wujud
					if (designer.details.app.connection[detail.name] !== undefined) {
						dhtmlx.alert({
							title:'Error',
							style:"alert-info",
							text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Unable to save : Connection name already exist'
						});
						return false;
					}

					// update tree
					tree.changeItemId(editName, detail.name);
					tree.setItemText(detail.name, detail.name);

					designer.tree.data.changeItemId('4:::' + editName, '4:::' + detail.name);
					designer.tree.data.setItemText('4:::' + detail.name, detail.name);
				}

				// remove yang lama
				delete designer.details.app.connection[editName];

				// add new connection #setter
				designer.details.app.connection[detail.name] = detail;

				// clear tree
				tree.clearSelection();

				// reset right side
				layout.cells('b').attachHTMLString(noConnectionSelected);

				// reset mode
				mode = null;
				editName = null;

				message = 'Connection details saved';
			}

			// papar mesej
			dhtmlx.message({
				text:'<table border="0"><col style="width:30px"><col><tr><td><img src="../img/icons/tick.png"></td><td>'+ message +'</td></tr></table>',
				expire:2000
			});
		});

		// tree connection click
		tree.attachEvent('onClick', function(id){
			mode = 'edit';
			editName = id;

			// show remove button
			toolbar.showItem(3);

			// display detail #getter
			var editConnection = '\n\
			<table border="0" class="windowForm" id="connectionEdit">\n\
			<col style="width:120px">\n\
			<col style="width:10px">\n\
			<col>\n\
			<tr>\n\
				<td colspan="3"><b>Edit Connection Details</b></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Connection Name</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="connectionName fullwidth" data-key="name" value="'+ designer.details.app.connection[id].name +'" autofocus/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Type</td>\n\
				<td>:</td>\n\
				<td>\n\
					<select class="type" data-key="type">\n\
						<option value="mysql">MySQL</option>\n\
					</select>\n\
				</td>\n\
			</tr>\n\
			<tr>\n\
				<td>Host</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="host fullwidth" data-key="host" value="'+ designer.details.app.connection[id].host +'"/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Username</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="username fullwidth" data-key="user" value="'+ designer.details.app.connection[id].user +'"/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Password</td>\n\
				<td>:</td>\n\
				<td><input type="password" class="password fullwidth" data-key="pass" value="'+ designer.details.app.connection[id].pass +'"/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Database Name</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="host fullwidth" data-key="dbname" value="'+ designer.details.app.connection[id].dbname +'"/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Port</td>\n\
				<td>:</td>\n\
				<td><input type="number" class="port" data-key="port" value="'+ designer.details.app.connection[id].port +'"/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>SID</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="sid fullwidth" data-key="sid" value="'+ designer.details.app.connection[id].sid +'"/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Service Name</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="serviceName fullwidth" data-key="serviceName" value="'+ designer.details.app.connection[id].serviceName +'"/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Socket</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="socket fullwidth" data-key="socket" value="'+ designer.details.app.connection[id].socket +'"/></td>\n\
			</tr>\n\
			</table>\n\
			';

			layout.cells('b').attachHTMLString(editConnection + closingButton);

			// select dropdown (type)
			$(layout.base).find('select.type').val(designer.details.app.connection[id].type);
		});

		// open window, terus buka detail connection
		if (selectItemId !== undefined) {
			selectItemId = selectItemId.split(':::');
			selectItemId = selectItemId[1];
			tree.selectItem(selectItemId, true);
		}

		//unbind
		connectionWin.attachEvent('onClose', function(){
			$(layout.base).off('click', '.buttonPlaceholder input.test');
			$(layout.base).off('click', '.buttonPlaceholder input.reset');
			$(layout.base).off('click', '.buttonPlaceholder input.save');
			return true;
		});
	};

	Designer.prototype.OpenParameterWindow = function() {
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');

		var parameterWin = windows.createWindow({
		    id:"parameter",
		    width:550,
		    height:430,
		    center:true,
		    modal:true,
		    resize:false
		});
		parameterWin.button('minmax').hide();
		parameterWin.button('park').hide();
		parameterWin.setText('Parameter');

		this.currentWindowOpen = parameterWin;

		var layout = parameterWin.attachLayout({
						pattern : '2E'
					});

		layout.cells('a').setText('Add New');
		layout.cells('b').hideHeader();

		layout.cells('a').setHeight(200);
		layout.cells('a').fixSize(true, true);

		layout.cells('a').hideArrow();
		layout.cells('b').hideArrow();

		var addNewContent = '\n\
		<table border="0" class="windowForm" id="parameterAddNew">\n\
		<col style="width:120px">\n\
		<col style="width:10px">\n\
		<col>\n\
		<tr>\n\
			<td>Parameter Name</td>\n\
			<td>:</td>\n\
			<td><input type="text" class="paramName fullwidth" value=""/></td>\n\
		</tr>\n\
		<tr>\n\
			<td>Default Value</td>\n\
			<td>:</td>\n\
			<td><input type="text" class="defaultValue fullwidth" value=""/></td>\n\
		</tr>\n\
		<tr>\n\
			<td>Data Type</td>\n\
			<td>:</td>\n\
			<td>\n\
				<select class="dataType">\n\
					<option value="string">String</option>\n\
					<option value="number">Number</option>\n\
				</select>\n\
			</td>\n\
		</tr>\n\
		<tr>\n\
			<td>Source Type</td>\n\
			<td>:</td>\n\
			<td>\n\
				<select class="sourceType">\n\
					<option value="get">GET</option>\n\
					<option value="post">POST</option>\n\
					<option value="session">SESSION</option>\n\
				</select>\n\
			</td>\n\
		</tr>\n\
		</table>\n\
		';

		// closing button
		var closingButton = '\n\
		<div class="buttonPlaceholder" style="padding:10px 15px; left:136px">\n\
			<input type="button" class="add" style="padding:6px 35px" value="Add"/>\n\
			<input type="button" class="reset" value="Reset"/>\n\
		</div>';

		layout.cells('a').attachHTMLString(addNewContent + closingButton);
		var statusBar = layout.cells('a').attachStatusBar();
		this.parameterStatusBarBottom = layout.cells('b').attachStatusBar();

		// grid init
		this.parameterListGrid = layout.cells('b').attachGrid();
		this.parameterListGrid.setHeader("Name, Default Value, Data Type, Source, Action");
		this.parameterListGrid.setInitWidths("120,120,90,90,90");
		this.parameterListGrid.setColTypes("ed,ed,coro,coro,img");

		// combo
		this.parameterListGrid.getCombo(2).put('string','String');
		this.parameterListGrid.getCombo(2).put('number','Number');
		this.parameterListGrid.getCombo(3).put('get','GET');
		this.parameterListGrid.getCombo(3).put('post','POST');
		this.parameterListGrid.getCombo(3).put('session','SESSION');

		this.parameterListGrid.init();

		// tag : list of parameter #getter

		if (!$.isEmptyObject(designer.details.app.parameter)) {
			var paramList = [];

			for (var key in designer.details.app.parameter) {

				paramList.push({
					id:key,
					data:[
						key,
						designer.details.app.parameter[key].defaultValue,
						designer.details.app.parameter[key].dataType,
						designer.details.app.parameter[key].sourceType,
						'../img/icons/cross.png^Remove^javascript:designer.PromptRemoveParameter();'
					]
				});
			}

			var paramData = {rows : paramList};
			this.parameterListGrid.parse(paramData,'json');
		}

		// reset button
		$(layout.base).find('input.reset').click(function(){
			var paramAddNew = $('#parameterAddNew');
			var inputParamName = paramAddNew.find('input.paramName');
			var inputParamDefaultValue = paramAddNew.find('input.defaultValue');
			var inputParamDataType = paramAddNew.find('select.dataType');
			var inputParamSourceType = paramAddNew.find('select.sourceType');

			// clear status text
			statusBar.setText('');

			// clear form
			inputParamName.val('').focus();
			inputParamDefaultValue.val('');
			inputParamDataType.val('string');
			inputParamSourceType.val('get');
		});

		// add button
		$(layout.base).find('input.add').click(function(){
			// dapatkan value
			var paramAddNew = $('#parameterAddNew');
			var inputParamName = paramAddNew.find('input.paramName');
			var inputParamDefaultValue = paramAddNew.find('input.defaultValue');
			var inputParamDataType = paramAddNew.find('select.dataType');
			var inputParamSourceType = paramAddNew.find('select.sourceType');

			var paramName = inputParamName.val();
			var paramDefaultValue = inputParamDefaultValue.val();
			var paramDataType = inputParamDataType.val();
			var paramSourceType = inputParamSourceType.val();

			// validation
			// jika param name kosong
			if (paramName == '') {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Empty parameter name'
				});
				return false;
			}
			// jika param name dah ada
			else if (designer.details.app.parameter[paramName] !== undefined) {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Parameter name is already exist'
				});
				return false;
			}
			// jika data type number, tapi default value bukan number
			else if (paramDataType === 'number' && isNaN(Number(paramDefaultValue))) {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Default value is not a number'
				});
				return false;
			}
			else if (paramDataType === 'number' && paramDefaultValue === '') {
				paramDefaultValue = 0;
			}

			// tambah pada list
			designer.parameterListGrid.addRow(paramName, paramName + ',' + paramDefaultValue + ',' + paramDataType + ',' + paramSourceType + ',' + '../img/icons/cross.png^Remove^javascript:designer.PromptRemoveParameter();');

			// clear status text
			statusBar.setText('');

			// clear form
			inputParamName.val('').focus();
			inputParamDefaultValue.val('');
			inputParamDataType.val('string');
			inputParamSourceType.val('get');

			// tag : parameter add new #setter

			designer.details.app.parameter[paramName] = {
				name : paramName,
				defaultValue : paramDefaultValue,
				dataType : paramDataType,
				sourceType : paramSourceType
			}

			// update tree data
			designer.tree.data.insertNewItem(2, '2:::' + paramName, paramName, null, 'document.png', 'document.png', 'document.png');
		});

		// parameter edit #setter
		// edit function
		this.parameterListGrid.attachEvent('onCellChanged', function(rowId, cellIndex, newValue){

			// hanya jika parameter sudah wujud dalam details
			if (designer.details.app.parameter[rowId] !== undefined) {

				// jika param name berubah (param name juga adalah row id)
				if (cellIndex === 0 && newValue !== rowId) {

					// cek dulu ada tak nama sama
					if (designer.details.app.parameter[newValue] === undefined) {
						// change row id
						designer.parameterListGrid.changeRowId(rowId, newValue);

						// update tree data
						designer.tree.data.changeItemId('2:::' + rowId, '2:::' + newValue);
						designer.tree.data.setItemText('2:::' + newValue, newValue);

						// update details
						designer.details.app.parameter[newValue] = $.extend(true, {}, designer.details.app.parameter[rowId]);
						designer.details.app.parameter[newValue].name = newValue;
						delete designer.details.app.parameter[rowId];

					} else {
						// tukar balik value baru ke value lama
						designer.parameterListGrid.cellById(rowId, cellIndex).setValue(rowId);

						// papar error
						dhtmlx.alert({
							title:'Error',
							style:"alert-info",
							text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Parameter name is already exist'
						});
						return false;
					}

				}

				// edit default value
				else if (cellIndex === 1) {

					// jika data type number, tapi user edit value jadikan selain number
					if (designer.details.app.parameter[rowId].dataType === 'number' && isNaN(Number(newValue))) {
						
						var oldValue = designer.details.app.parameter[rowId].defaultValue;
						designer.parameterListGrid.cellById(rowId, cellIndex).setValue(oldValue);

						dhtmlx.alert({
							title:'Error',
							style:"alert-info",
							text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Default value is not a number'
						});
						return false;
					}

					designer.details.app.parameter[rowId].defaultValue = newValue;
				}

				// edit data type
				else if (cellIndex === 2) {
					designer.details.app.parameter[rowId].dataType = newValue;
				}

				// edit source type
				else if (cellIndex === 3) {
					designer.details.app.parameter[rowId].sourceType = newValue;
				}
			}
		});

		// unbind
		parameterWin.attachEvent('onClose', function(){
			$(layout.base).find('input.reset').unbind();
			$(layout.base).find('input.add').unbind();
			return true;
		});
	};

	Designer.prototype.PromptRemoveParameter = function() {
		dhtmlx.confirm({
			title:'Remove',
			type:'alert-info',
			text:"<img src='../img/icons/exclamation.png'/><br/>Confirm remove parameter?",
			callback:function(answer){
				if (answer === true) {
					// tag : parameter remove #setter
					var paramName = designer.parameterListGrid.getSelectedRowId();
					delete designer.details.app.parameter[paramName];

					// update tree data
					designer.tree.data.deleteItem('2:::' + paramName);

					// delete row
					designer.parameterListGrid.deleteSelectedRows();
					designer.parameterListGrid.clearSelection();
					designer.parameterStatusBarBottom.setText('');
				}
			}
		});
	};

	Designer.prototype.OpenPreferencesWindow = function() {
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');
		
		var preferences = windows.createWindow({
		    id:"preferences",
		    width:400,
		    height:400,
		    center:true,
		    modal:true,
		    resize:false
		});
		preferences.button('minmax').hide();
		preferences.button('park').hide();
		preferences.setText('Preferences');

		this.currentWindowOpen = preferences;

		var tabbar = preferences.attachTabbar({
			tabs : [
				{id:1, text:"General", active:true},
				{id:3, text:"Format"},
				{id:2, text:"Margins"}
			]
		});

		// tag : preferences #getter

		// closing button
		var closingButton = '\n\
		<div class="buttonPlaceholder">\n\
			<input type="button" class="save" value="Save"/>\n\
			<input type="button" class="close" value="Close"/>\n\
		</div>';

		// general tab
		var generalContent = '\n\
		<table border="0" class="windowForm" id="preferencesGeneral">\n\
		<col style="width:100px">\n\
		<col style="width:10px">\n\
		<col>\n\
		<tr>\n\
			<td>Report Title</td>\n\
			<td>:</td>\n\
			<td><input type="text" class="reportTitle fullwidth" value="'+ this.details.app.general.reportTitle +'"/></td>\n\
		</tr>\n\
		<tr>\n\
			<td>Author Name</td>\n\
			<td>:</td>\n\
			<td><input type="text" class="authorName fullwidth" value="'+ this.details.app.general.author +'"/></td>\n\
		</tr>\n\
		</table>\n\
		';

		tabbar.tabs(1).attachHTMLString(generalContent + closingButton);

		// format tab
		var formatContent = '\n\
		<table border="0" class="windowForm" id="preferencesFormat">\n\
		<col style="width:100px">\n\
		<col style="width:10px">\n\
		<col>\n\
		<tr>\n\
			<td>Paper</td>\n\
			<td>:</td>\n\
			<td>\n\
				<select class="paper">\n\
					<option '+ (this.details.app.format.paper === 'A5' ? 'selected="selected" ' : '' ) +' value="A5">A5</option>\n\
					<option '+ (this.details.app.format.paper === 'A4' ? 'selected="selected" ' : '' ) +' value="A4">A4</option>\n\
					<option '+ (this.details.app.format.paper === 'A3' ? 'selected="selected" ' : '' ) +' value="A3">A3</option>\n\
					<option '+ (this.details.app.format.paper === 'Letter' ? 'selected="selected" ' : '' ) +' value="Letter">Letter</option>\n\
				</select>\n\
			</td>\n\
		</tr>\n\
		<tr>\n\
			<td>Orientation</td>\n\
			<td>:</td>\n\
			<td>\n\
				<select class="orientation">\n\
					<option '+ (this.details.app.format.orientation === 'P' ? 'selected="selected" ' : '' ) +' value="P">Portrait</option>\n\
					<option '+ (this.details.app.format.orientation === 'L' ? 'selected="selected" ' : '' ) +' value="L">Landscape</option>\n\
				</select>\n\
			</td>\n\
		</tr>\n\
		</table>\n\
		';

		tabbar.tabs(3).attachHTMLString(formatContent + closingButton);

		// margin tab
		var generalContent = '\n\
		<table border="0" class="windowForm" id="preferencesMargin">\n\
		<col style="width:70px">\n\
		<col style="width:10px">\n\
		<col>\n\
		<tr>\n\
			<td colspan="3">Unit in millimeter (mm)</td>\n\
		</tr>\n\
		<tr>\n\
			<td>Top</td>\n\
			<td>:</td>\n\
			<td><input type="number" min="0" class="margin top" value="'+ this.details.app.margin.top +'"/></td>\n\
		</tr>\n\
		<tr>\n\
			<td>Left</td>\n\
			<td>:</td>\n\
			<td><input type="number" min="0" class="margin left" value="'+ this.details.app.margin.left +'"/></td>\n\
		</tr>\n\
		<tr>\n\
			<td>Right</td>\n\
			<td>:</td>\n\
			<td><input type="number" min="0" class="margin right" value="'+ this.details.app.margin.right +'"/></td>\n\
		</tr>\n\
		<tr>\n\
			<td>Bottom</td>\n\
			<td>:</td>\n\
			<td><input type="number" min="0" class="margin bottom" value="'+ this.details.app.margin.bottom +'"/></td>\n\
		</tr>\n\
		<tr>\n\
			<td>Footer</td>\n\
			<td>:</td>\n\
			<td><input type="number" min="0" class="margin footer" value="'+ this.details.app.margin.footer +'"/></td>\n\
		</tr>\n\
		</table>\n\
		';

		tabbar.tabs(2).attachHTMLString(generalContent + closingButton);

		// close window button
		$(tabbar.base).find('input.close').click(function(){
			preferences.close();
			windows.unload();
		});

		// tag : preferences #setter

		// save then close window button
		$(tabbar.base).find('input.save').click(function(){

			var preferencesGeneral = $('#preferencesGeneral');
			var preferencesFormat = $('#preferencesFormat');
			var preferencesMargin = $('#preferencesMargin');
			var reportTitle = preferencesGeneral.find('input.reportTitle').val();
			var author = preferencesGeneral.find('input.authorName').val();
			var reportPaper = preferencesFormat.find('select.paper').val();
			var reportOrietation = preferencesFormat.find('select.orientation').val();
			var bandSize = designer.details.default.bandWidth[reportPaper][reportOrietation];
			var margin = {
				top    : Number(preferencesMargin.find('input.margin.top').val()),
				left   : Number(preferencesMargin.find('input.margin.left').val()),
				right  : Number(preferencesMargin.find('input.margin.right').val()),
				bottom : Number(preferencesMargin.find('input.margin.bottom').val()),
				footer : Number(preferencesMargin.find('input.margin.footer').val())
			}

			// band size
			$('#workspace .band').width(bandSize);

			designer.details.app.general.reportTitle = reportTitle;
			designer.details.app.general.author = author;
			designer.details.app.format.paper = reportPaper;
			designer.details.app.format.orientation = reportOrietation;
			designer.details.app.margin.top = (isNaN(margin.top)) ? 0 : margin.top;
			designer.details.app.margin.left = (isNaN(margin.left)) ? 0 : margin.left;
			designer.details.app.margin.right = (isNaN(margin.right)) ? 0 : margin.right;
			designer.details.app.margin.bottom = (isNaN(margin.bottom)) ? 0 : margin.bottom;
			designer.details.app.margin.footer = (isNaN(margin.footer)) ? 0 : margin.footer;

			preferences.close();
			windows.unload();
		});

		// unbind
		preferences.attachEvent('onClose', function(){
			$(tabbar.base).find('input.close').unbind();
			$(tabbar.base).find('input.save').unbind();
			return true;
		});
	};

	Designer.prototype.OpenGroupWindow = function(){
		var mode = null;
		var editName = null;
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');

		var groupWin = windows.createWindow({
		    id:"group",
		    width:630,
		    height:430,
		    center:true,
		    modal:true
		});
		groupWin.button('park').hide();
		groupWin.setText('Group');

		this.currentWindowOpen = groupWin;

		if (this.mainQuery === null) {

			groupWin.attachHTMLString('<p style="font-family: \'Montserrat\'; font-size: 11px; line-height: 18px; text-align: center;">Unable to proceed. No main data source detected.<br/>Make sure you have one main data source.<br/><br/><img src="../img/app_1.png"/></p>');

		} else {
			var layout = groupWin.attachLayout({
				pattern:'3T'
			});

			layout.cells('a').hideHeader();
			layout.cells('b').hideHeader();
			layout.cells('c').hideHeader();

			layout.cells('a').setHeight(55);
			layout.cells('a').fixSize(true, true);

			layout.cells('b').setWidth(170);

			var info = '\n\
			<table border="0" class="windowForm">\n\
			<col style="width:100px">\n\
			<col style="width:10px">\n\
			<tr>\n\
				<td>Connection</td>\n\
				<td>:</td>\n\
				<td><b>'+ this.mainQuery.connection +'</b></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Query Name</td>\n\
				<td>:</td>\n\
				<td><b>'+ this.mainQuery.name +'</b></td>\n\
			</tr>\n\
			</table>\n\
			';

			layout.cells('a').attachHTMLString(info);

			var groups = [];
			for (var groupName in this.mainQuery.group) {
				var column = [];
				for (var columnName in this.mainQuery.group[groupName].column) {
					column.push({
						id:groupName + ':::' + columnName,
						text:columnName,
						im0:'document.png',
						im1:'document.png',
						im2:'document.png'
					});
				}

				groups.push({
					id:groupName,
					text:groupName,
					im0:'application-document.png',
					im1:'application-document.png',
					im2:'application-document.png',
					item: column
				});	
			}

			var tree = layout.cells('b').attachTree();
			tree.setImagesPath(this.dhtmlxImagePath +'dhxtree_skyblue/');
			tree.setIconsPath(this.fugueIconPath);
			tree.loadJSONObject({id:0, item: groups }); //root id 0
			tree.openAllItems(0);

			var toolbar = layout.cells('c').attachToolbar();
			var button = [
				{id:1, type:"button", text:"New Group", img:"plus.png", imgdis:"plus.png"},
				{id:2, type:"separator"},
				{id:3, type:"button", text:"Remove", img:"cross.png", imgdis:"cross.png"},
				{id:4, type:"separator"},
				{id:5, type:"button", text:"Move Column", img:"arrow-circle-double-135.png", imgdis:"arrow-circle-double-135.png"},
				{id:6, type:"separator"},
				{id:7, type:"button", text:"Sort Group", img:"sort-quantity.png", imgdis:"sort-quantity.png"}
			];
			toolbar.setIconsPath(this.fugueIconPath);
			toolbar.loadStruct(button);
			toolbar.hideItem(3);
			toolbar.hideItem(4);


			// tree event
			tree.attachEvent('onClick', function(id){
				if (tree.getLevel(id) === 1){
					toolbar.showItem(3);
					toolbar.showItem(4);
				} else {
					toolbar.hideItem(3);
					toolbar.hideItem(4);
				}

				toolbar.enableItem(1);
				toolbar.enableItem(3);
				toolbar.enableItem(5);
				toolbar.enableItem(7);

				$('#groupAddNew input.cancel').trigger('click');
				$('#groupMoveColumn input.cancel').trigger('click');

				// papar detail group
				if (tree.getLevel(tree.getSelectedItemId()) === 1) {
					var detailGroup = '<div id="groupDetail"><table border="0" class="windowForm">\n\
					<col style="width:120px">\n\
					<col style="width:10px">\n\
					<col>\n\
					<tr>\n\
						<td colspan="3"><b>Group Detail</b></td>\n\
					</tr>\n\
					<tr>\n\
						<td>Group Name</td>\n\
						<td>:</td>\n\
						<td><input type="text" class="name fullwidth" data-key="name" value="'+ tree.getSelectedItemId() +'" autofocus="autofocus"/></td>\n\
					</tr>\n\
					</table>\n\
					';

					// closing button
					var closingButton = '\n\
					<div class="buttonPlaceholder" style="padding:10px 15px;">\n\
						<input type="button" class="save" style="padding:6px 35px" value="Save"/>\n\
						<input type="button" class="cancel" value="Cancel"/>\n\
					</div></div>';

					layout.cells('c').attachHTMLString(detailGroup + closingButton);
				} else {
					layout.cells('c').attachHTMLString('');
				}
			});

			// toolbar event
			toolbar.attachEvent('onClick', function(id){
				// hide button remove
				if (id !== '3') {
					toolbar.hideItem(3);
					toolbar.hideItem(4);
					tree.clearSelection();
				}

				// disable semua button
				toolbar.disableItem(1);
				toolbar.disableItem(3);
				toolbar.disableItem(5);
				toolbar.disableItem(7);

				// add new group
				if (id === '1') {

					// drop down source group
					var listOfGroup = '';
					for (var groupName in designer.mainQuery.group) {
						listOfGroup += '<option value="'+ groupName +'">'+ groupName +'</option>';	
					}
					listOfGroup += '<option value="___available___">-- Available --</option>';

					// create temporary object untuk store value group baru
					designer.mainQuery.group['___temporary___'] = { column:{} };

					var newGroupForm = '<div id="groupAddNew"><table border="0" class="windowForm">\n\
					<col style="width:120px">\n\
					<col style="width:10px">\n\
					<col>\n\
					<tr>\n\
						<td colspan="3"><b>Add New Group</b></td>\n\
					</tr>\n\
					<tr>\n\
						<td>Group Name</td>\n\
						<td>:</td>\n\
						<td><input type="text" class="name fullwidth" data-key="name" value="" autofocus="autofocus"/></td>\n\
					</tr>\n\
					</table>\n\
					<table border="0" class="windowForm">\n\
					<col style="width:45%">\n\
					<col style="width:10%; text-align:center;">\n\
					<col style="width:45%">\n\
					<tr>\n\
						<td>\n\
							<p>\n\
								<select class="sourceGroup">\n\
									'+ listOfGroup +'\n\
								</select>\n\
							</p>\n\
						</td>\n\
						<td></td>\n\
						<td><p>New Group Fields :</p></td>\n\
					</tr>\n\
					<tr>\n\
						<td>\n\
							<select class="sourceSelection" size="9" style="width:100%" multiple>\n\
							</select>\n\
						</td>\n\
						<td>\n\
							<img class="arrow arrowToTarget" style="display:block; margin:0 auto; cursor:pointer" src="../img/icons/arrow.png"/>\n\
							<br/>\n\
							<img class="arrow arrowToSource" style="display:block; margin:0 auto; cursor:pointer" src="../img/icons/arrow-180.png"/>\n\
						</td>\n\
						<td>\n\
							<select class="targetSelection" size="9" style="width:100%" multiple>\n\
							</select>\n\
						</td>\n\
					</tr>\n\
					</table>\n\
					';

					// closing button
					var closingButton = '\n\
					<div class="buttonPlaceholder" style="padding:10px 15px;">\n\
						<input type="button" class="save" style="padding:6px 35px" value="Save"/>\n\
						<input type="button" class="cancel" value="Cancel"/>\n\
					</div></div>';

					layout.cells('c').attachHTMLString(newGroupForm + closingButton);

					// generate content untuk source selection
					$('body').on('change', '#groupAddNew select.sourceGroup', function(){
						var source = $(this).val();
						var content = '';
						
						if (source === '___available___') {
							
						} else {
							for (var columnName in designer.mainQuery.group[source].column) {
								content += '<option value="'+ columnName +'">'+ columnName +'</option>';
							}
						}

						$('#groupAddNew select.sourceSelection').html(content);
					});

					// buka list terus
					$('#groupAddNew select.sourceGroup').trigger('change');
				}
				// remove
				else if (id === '3') {

				}
				// move column
				else if (id === '5') {
					// drop down group
					var listOfGroup = '';
					for (var groupName in designer.mainQuery.group) {
						listOfGroup += '<option value="'+ groupName +'">'+ groupName +'</option>';	
					}

					var moveColumnForm = '<div id="groupMoveColumn">\n\
					<table border="0" class="windowForm">\n\
					<col style="width:45%">\n\
					<col style="width:10%; text-align:center;">\n\
					<col style="width:45%">\n\
					<tr>\n\
						<td colspan="3"><b>Move column between groups</b></td>\n\
					</tr>\n\
					<tr>\n\
						<td>\n\
							<p>\n\
								<select class="sourceGroup">'+ listOfGroup +'\n\
								</select>\n\
							</p>\n\
						</td>\n\
						<td></td>\n\
						<td>\n\
							<p>\n\
								<select class="targetGroup">'+ listOfGroup +'\n\
								</select>\n\
							</p>\n\
						</td>\n\
					</tr>\n\
					<tr>\n\
						<td>\n\
							<select class="sourceSelection" size="9" style="width:100%" multiple>\n\
							</select>\n\
						</td>\n\
						<td>\n\
							<img class="arrow arrowToTarget" style="display:block; margin:0 auto; cursor:pointer" src="../img/icons/arrow.png"/>\n\
							<br/>\n\
							<img class="arrow arrowToSource" style="display:block; margin:0 auto; cursor:pointer" src="../img/icons/arrow-180.png"/>\n\
						</td>\n\
						<td>\n\
							<select class="targetSelection" size="9" style="width:100%" multiple>\n\
							</select>\n\
						</td>\n\
					</tr>\n\
					</table>\n\
					';

					// closing button
					var closingButton = '\n\
					<div class="buttonPlaceholder" style="padding:10px 15px;">\n\
						<input type="button" class="save" style="padding:6px 35px" value="Save"/>\n\
						<input type="button" class="cancel" value="Cancel"/>\n\
					</div></div>';

					layout.cells('c').attachHTMLString(moveColumnForm + closingButton);

					// generate content untuk source selection
					$('body').on('change', '#groupMoveColumn select.sourceGroup, #groupMoveColumn select.targetGroup', function(){
						var source = $(this).val();
						var content = '';
						
						for (var columnName in designer.mainQuery.group[source].column) {
							content += '<option value="'+ columnName +'">'+ columnName +'</option>';
						}

						// jika source
						if ($(this).hasClass('sourceGroup')) {
							$('#groupMoveColumn select.sourceSelection').html(content);
						// jika target
						} else {
							$('#groupMoveColumn select.targetSelection').html(content);	
						}
						
					});

					// buka list terus
					$('#groupMoveColumn select.sourceGroup').trigger('change');
					$('#groupMoveColumn select.targetGroup').trigger('change');
				}
				// sort group
				else if (id === '7') {
					var groupList = '';
					for (var groupName in designer.mainQuery.group) {
						groupList += '<option value="'+ groupName +'">' + groupName + '</option>';
					}

					var sortGroup = '<div id="groupSort">\n\
					<table border="0" class="windowForm">\n\
						<tr>\n\
							<td><b>Group Arrangement</b></td>\n\
						</tr>\n\
						<tr>\n\
							<td>\n\
							<select class="selection" size="10" style="width:100%">'+ groupList +'\n\
							</select>\n\
							</td>\n\
						</tr>\n\
						<tr>\n\
							<td>\n\
								<img class="arrow up" style="display:block; float:left; margin:0 5px; cursor:pointer" src="../img/icons/arrow-090.png"/>\n\
								<img class="arrow down" style="display:block; float:left; margin:0 5px; cursor:pointer" src="../img/icons/arrow-270.png"/>\n\
							</td>\n\
						</tr>\n\
					</table>\n\
					';

					// closing button
					var closingButton = '\n\
					<div class="buttonPlaceholder" style="padding:10px 15px;">\n\
						<input type="button" class="save" style="padding:6px 35px" value="Save"/>\n\
						<input type="button" class="cancel" value="Cancel"/>\n\
					</div></div>';

					layout.cells('c').attachHTMLString(sortGroup + closingButton);
				}
			});

			// event register
			// save button (group detail)
			$('body').on('click', '#groupDetail input.save', function(){
				var oldGroupName = tree.getSelectedItemId();
				var groupName = $('#groupDetail input.name').val();

				if (groupName !== oldGroupName) {
					// jika kosong
					if (groupName === '') {
						dhtmlx.alert({
							title:'Error',
							style:"alert-info",
							text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Empty group name!'
						});
						return false;
					}

					// jika nama dah ada
					if (designer.mainQuery.group[groupName] !== undefined) {
						dhtmlx.alert({
							title:'Error',
							style:"alert-info",
							text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Name already exist!'
						});
						return false;
					}

					// #setter
					var originalGroups = Object.keys(designer.mainQuery.group);
					var changedGroupIndex = originalGroups.indexOf(oldGroupName);
					var temporaryObject = $.extend(true, {}, designer.mainQuery.group);
					designer.mainQuery.group = {};
					for (var g=0; g<originalGroups.length; g++) {
						if (g === changedGroupIndex) {
							designer.mainQuery.group[groupName] = $.extend(true, {}, temporaryObject[originalGroups[g]]);
						} else {
							designer.mainQuery.group[originalGroups[g]] = $.extend(true, {}, temporaryObject[originalGroups[g]]);
						}
					}

					// update tree
					tree.changeItemId(oldGroupName, groupName);
					tree.setItemText(groupName, groupName);

					// update band title, band data-name
					var groupNameArray = Object.keys(designer.mainQuery.group);
					var groupNumber = groupNameArray.indexOf(groupName);
					var dataNameHeader = (groupNumber === 0) ? 'Header' : 'Group Header : ' + oldGroupName;
					var bandTitleHeader = (groupNumber === 0) ? 'Header : ' + groupName : 'Group Header : ' + groupName;
					var dataNameFooter = (groupNumber === 0) ? 'Footer' : 'Group Footer : ' + oldGroupName;
					var bandTitleFooter = (groupNumber === 0) ? 'Footer : ' + groupName : 'Group Footer : ' + groupName;

					var bandHeader = $('#workspace .band[data-name="'+ dataNameHeader +'"]');
					bandHeader.find('.title p').text(bandTitleHeader);
					if (groupNumber > 0) { // attr data-name untuk header tidak berubah
						bandHeader.attr('data-name', bandTitleHeader);
					}

					var bandFooter = $('#workspace .band[data-name="'+ dataNameFooter +'"]');
					bandFooter.find('.title p').text(bandTitleFooter);
					if (groupNumber > 0) { // attr data-name untuk header tidak berubah
						bandFooter.attr('data-name', bandTitleFooter);
					}

					// update tree structure
					if (groupNumber === 0) {
						designer.tree.structure.setItemText('header', 'Header <small class="grouplabel">'+ groupName +'</small>');
						designer.tree.structure.setItemText('footer', 'Footer <small class="grouplabel">'+ groupName +'</small>');
					} else {
						designer.tree.structure.setItemText('_group' + groupNumber, 'Group <small class="grouplabel">'+ groupName +'</small>');
					}
				}

				layout.cells('c').attachHTMLString('');
				tree.clearSelection();
				toolbar.hideItem(3);
				toolbar.hideItem(4);
			});

			// cancel button (detail)
			$('body').on('click', '#groupDetail input.cancel', function(){
				layout.cells('c').attachHTMLString('');
				tree.clearSelection();
				toolbar.hideItem(3);
				toolbar.hideItem(4);
			});

			// arrow (sort)
			$('body').on('click', '#groupSort img.arrow', function(){
				var value = $('#groupSort .selection').val();
				var elem = $('#groupSort .selection option[value="'+ value +'"]');
				
				if (value === null) {
					return false;
				}
				else {
					// up
					if ($(this).hasClass('up')) {
						elem.prev().insertAfter(elem);
					}
					// down
					else {
						elem.next().insertBefore(elem);
					}
				}
			});

			// cancel button (sort)
			$('body').on('click', '#groupSort input.cancel', function(){
				layout.cells('c').attachHTMLString('');

				// show toolbars item
				toolbar.showItem(1);
				toolbar.showItem(2);
				toolbar.showItem(5);
				toolbar.showItem(6);
				toolbar.showItem(7);

				toolbar.enableItem(1);
				toolbar.enableItem(3);
				toolbar.enableItem(5);
				toolbar.enableItem(7);
			});

			// save button (sort)
			$('body').on('click', '#groupSort input.save', function(){
				var temporaryObject = {};

				$('#groupSort .selection option').each(function(){
					var groupName = $(this).val();
					temporaryObject[groupName] = $.extend(true, {}, designer.mainQuery.group[groupName]);
				});

				designer.mainQuery.group = $.extend(true, {}, temporaryObject);

				// update tree sebelah
				layout.cells('b').progressOn();
				var groups = [];
				for (var groupName in designer.mainQuery.group) {
					var column = [];
					for (var columnName in designer.mainQuery.group[groupName].column) {
						column.push({
							id:groupName + ':::' + columnName,
							text:columnName,
							im0:'document.png',
							im1:'document.png',
							im2:'document.png'
						});
					}

					groups.push({
						id:groupName,
						text:groupName,
						im0:'application-document.png',
						im1:'application-document.png',
						im2:'application-document.png',
						item: column
					});
				}
				tree.deleteChildItems(0, false);
				tree.loadJSONObject({id:0, item: groups }, function(){
					layout.cells('b').progressOff();
					tree.openAllItems(0);
				});

				layout.cells('c').attachHTMLString('');

				// show toolbars item
				toolbar.showItem(1);
				toolbar.showItem(2);
				toolbar.showItem(5);
				toolbar.showItem(6);
				toolbar.showItem(7);

				toolbar.enableItem(1);
				toolbar.enableItem(3);
				toolbar.enableItem(5);
				toolbar.enableItem(7);
			});

			// save button (move column)
			$('body').on('click', '#groupMoveColumn input.save', function(){
				// buang old group name
				for (var groupName in designer.mainQuery.group) {
					for (var columnName in designer.mainQuery.group[groupName].column) {

						// jika ada property oldGroupName
						if (designer.mainQuery.group[groupName].column[columnName].oldGroupName !== undefined) {
							delete designer.mainQuery.group[groupName].column[columnName].oldGroupName; // buang property oldGroupName
						}
					}
				}

				// update tree sebelah
				layout.cells('b').progressOn();
				var groups = [];
				for (var groupName in designer.mainQuery.group) {
					var column = [];
					for (var columnName in designer.mainQuery.group[groupName].column) {
						column.push({
							id:groupName + ':::' + columnName,
							text:columnName,
							im0:'document.png',
							im1:'document.png',
							im2:'document.png'
						});
					}

					groups.push({
						id:groupName,
						text:groupName,
						im0:'application-document.png',
						im1:'application-document.png',
						im2:'application-document.png',
						item: column
					});
				}
				tree.deleteChildItems(0, false);
				tree.loadJSONObject({id:0, item: groups }, function(){
					layout.cells('b').progressOff();
					tree.openAllItems(0);
				});

				// show toolbars item
				toolbar.showItem(1);
				toolbar.showItem(2);
				toolbar.showItem(5);
				toolbar.showItem(6);
				toolbar.showItem(7);

				toolbar.enableItem(1);
				toolbar.enableItem(3);
				toolbar.enableItem(5);
				toolbar.enableItem(7);

				layout.cells('c').attachHTMLString('');
			});

			// arrow (move column)
			$('body').on('click', '#groupMoveColumn img.arrow', function(){
				var groupNameSource = $('#groupMoveColumn select.sourceGroup').val();
				var groupNameTarget = $('#groupMoveColumn select.targetGroup').val();

				// jika move ke group yg sama
				if (groupNameSource === groupNameTarget) {
					dhtmlx.alert({
						title:'Error',
						style:'alert-info',
						text:'Can\'t move to its own group!'
					});
				}
				else {
					var sourceSelection = $('#groupMoveColumn select.sourceSelection');
					var targetSelection = $('#groupMoveColumn select.targetSelection');

					// to target
					if ($(this).hasClass('arrowToTarget')) {
						var toBeMoved = sourceSelection.val();

						if (toBeMoved !== null) {
							for (var c=0; c<toBeMoved.length; c++) {
								var columnName = toBeMoved[c];
								sourceSelection.find('option[value="'+ columnName +'"]').appendTo(targetSelection);
								designer.mainQuery.group[groupNameTarget].column[columnName] = $.extend(true, {}, designer.mainQuery.group[groupNameSource].column[columnName]);
								designer.mainQuery.group[groupNameTarget].column[columnName].oldGroupName = groupNameSource; // simpan old group name, incase kalau tak jadi
								delete designer.mainQuery.group[groupNameSource].column[columnName];
							}
						}

					// to source
					} else if ($(this).hasClass('arrowToSource')) {
						var toBeMoved = targetSelection.val();

						if (toBeMoved !== null) {
							for (var c=0; c<toBeMoved.length; c++) {
								var columnName = toBeMoved[c];
								targetSelection.find('option[value="'+ columnName +'"]').appendTo(sourceSelection);
								designer.mainQuery.group[groupNameSource].column[columnName] = $.extend(true, {}, designer.mainQuery.group[groupNameTarget].column[columnName]);
								designer.mainQuery.group[groupNameSource].column[columnName].oldGroupName = groupNameTarget; // simpan old group name, incase kalau tak jadi
								delete designer.mainQuery.group[groupNameTarget].column[columnName];
							}
						}
					}
				}
			});

			// cancel button (move column)
			$('body').on('click', '#groupMoveColumn input.cancel', function(){
				// pulangkan balik ke group lama
				for (var groupName in designer.mainQuery.group) {

					for (var columnName in designer.mainQuery.group[groupName].column) {

						// jika ada property oldGroupName
						if (designer.mainQuery.group[groupName].column[columnName].oldGroupName !== undefined) {
							var oldGroupName = designer.mainQuery.group[groupName].column[columnName].oldGroupName;
							delete designer.mainQuery.group[groupName].column[columnName].oldGroupName; // buang property oldGroupName
							designer.mainQuery.group[oldGroupName].column[columnName] = $.extend(true, {}, designer.mainQuery.group[groupName].column[columnName]);
							delete designer.mainQuery.group[groupName].column[columnName];
						}
					}
				}
				
				toolbar.enableItem(1);
				toolbar.enableItem(3);
				toolbar.enableItem(5);
				toolbar.enableItem(7);

				layout.cells('c').attachHTMLString('');
			});

			// arrow (add new group)
			$('body').on('click', '#groupAddNew img.arrow', function(){
				var groupName = $('#groupAddNew select.sourceGroup').val();
				var sourceSelection = $('#groupAddNew select.sourceSelection');
				var targetSelection = $('#groupAddNew select.targetSelection');

				// to target
				if ($(this).hasClass('arrowToTarget')) {

					var toBeMoved = sourceSelection.val();

					if (toBeMoved !== null) {
						for (var c=0; c<toBeMoved.length; c++) {
							var columnName = toBeMoved[c];
							sourceSelection.find('option[value="'+ columnName +'"]').appendTo(targetSelection);
							designer.mainQuery.group['___temporary___'].column[columnName] = $.extend(true, {}, designer.mainQuery.group[groupName].column[columnName]);
							designer.mainQuery.group['___temporary___'].column[columnName].oldGroupName = groupName; // simpan old group name, incase kalau tak jadi
							delete designer.mainQuery.group[groupName].column[columnName];
						}
					}
				}
				// to source
				else if ($(this).hasClass('arrowToSource')) {

					var toBeMoved = targetSelection.val();

					if (toBeMoved !== null) {
						for (var c=0; c<toBeMoved.length; c++) {
							var columnName = toBeMoved[c];
							targetSelection.find('option[value="'+ columnName +'"]').appendTo(sourceSelection);
							designer.mainQuery.group[groupName].column[columnName] = $.extend(true, {}, designer.mainQuery.group['___temporary___'].column[columnName]);
							delete designer.mainQuery.group['___temporary___'].column[columnName];
						}
					}

				}
			});

			// cancel button (group add new)
			$('body').on('click', '#groupAddNew input.cancel', function(){
				// pulangkan balik ke group lama
				if (designer.mainQuery.group['___temporary___'] !== undefined) {
					for (var columnName in designer.mainQuery.group['___temporary___'].column) {
						var oldGroupName = designer.mainQuery.group['___temporary___'].column[columnName].oldGroupName;
						designer.mainQuery.group[oldGroupName].column[columnName] = $.extend(true, {}, designer.mainQuery.group['___temporary___'].column[columnName]);
						delete designer.mainQuery.group[oldGroupName].column[columnName].oldGroupName;
					}

					delete designer.mainQuery.group['___temporary___'];							
				}
				
				toolbar.enableItem(1);
				toolbar.enableItem(3);
				toolbar.enableItem(5);
				toolbar.enableItem(7);

				layout.cells('c').attachHTMLString('');
			});

			// save button (group add new)
			$('body').on('click', '#groupAddNew input.save', function(){
				var newGroupName = $('#groupAddNew input.name').val();

				// jika nama kosong
				if (newGroupName === '' || newGroupName === undefined) {
					dhtmlx.alert({
						title:'Error',
						style:"alert-info",
						text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Empty group name!'
					});
					return false;
				}

				// jika nama dah ada
				if (designer.mainQuery.group[newGroupName] !== undefined) {
					dhtmlx.alert({
						title:'Error',
						style:"alert-info",
						text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Group name already exist!<br/>Please enter another name.'
					});
					return false;
				}

				// register new group
				designer.mainQuery.group[newGroupName] = $.extend(true, {}, designer.mainQuery.group['___temporary___']);
				delete designer.mainQuery.group['___temporary___']; // remove temporary

				// papar mesej berjaya
				dhtmlx.message({
					text:'<table border="0"><col style="width:30px"><col><tr><td><img src="../img/icons/tick.png"></td><td>Group has been successfully saved!</td></tr></table>',
					expire:2000
				});

				// clear
				layout.cells('c').attachHTMLString('');

				// update tree sebelah
				layout.cells('b').progressOn();
				var groups = [];
				for (var groupName in designer.mainQuery.group) {
					var column = [];
					for (var columnName in designer.mainQuery.group[groupName].column) {
						column.push({
							id:groupName + ':::' + columnName,
							text:columnName,
							im0:'document.png',
							im1:'document.png',
							im2:'document.png'
						});
					}

					groups.push({
						id:groupName,
						text:groupName,
						im0:'application-document.png',
						im1:'application-document.png',
						im2:'application-document.png',
						item: column
					});
				}
				tree.deleteChildItems(0, false);
				tree.loadJSONObject({id:0, item: groups }, function(){
					layout.cells('b').progressOff();
					tree.openAllItems(0);
				});

				// update tree structure dengan band yang baru
				var totalGroup = Object.keys(designer.mainQuery.group).length;
				var groupPreviousNumber = totalGroup - 2;
				var groupCurrentNumber = totalGroup - 1;
				var groupStackId = '_group' + groupCurrentNumber;
				var startHeader = (totalGroup === 2 ? 'header' : 'groupHeader' + groupPreviousNumber);
				designer.tree.structure.insertNewNext(startHeader, groupStackId, 'Group <small class="grouplabel">'+ newGroupName +'</small>', null, 'zones-stack.png', 'zones-stack.png', 'zones-stack.png');
				designer.tree.structure.insertNewChild(groupStackId, 'groupHeader' + groupCurrentNumber, 'Group Header', null, 'zone.png', 'zone.png', 'zone.png');
				designer.tree.structure.moveItem('detail', 'item_child', groupStackId);
				designer.tree.structure.insertNewChild(groupStackId, 'groupFooter' + groupCurrentNumber, 'Group Footer', null, 'zone.png', 'zone.png', 'zone.png');

				// tambah band pada workspace
				var detailBand = $('#workspace .band[data-name="Detail"]');
				var bandObject = {};
				bandObject['Group Header : ' + newGroupName] = { treeId : 'groupHeader' + groupCurrentNumber, type : 'header' };
				bandObject['Group Footer : ' + newGroupName] = { treeId : 'groupFooter' + groupCurrentNumber, type : 'footer' };

				for (var bandName in bandObject) {
					var band = new Band({ title : bandName });

					if (bandObject[bandName].type === 'header') {
						detailBand.before(band.elem);
					} else if (bandObject[bandName].type === 'footer') {
						detailBand.after(band.elem);
					}

					band.RegisterTreeId(bandObject[bandName].treeId);
					band.ApplyResize();
					band.elem.find('.area').droppable({
						accept : '.standartTreeRow',
						hoverClass : 'hoverDrop',
						drop : function(event, ui){
							designer.DeselectCurrentElement();
							designer.DrawElement(event, ui);
						}
					});

					designer.details.app.band[bandName] = band;
				}

				// show toolbars item
				toolbar.showItem(1);
				toolbar.showItem(2);
				toolbar.showItem(5);
				toolbar.showItem(6);
				toolbar.showItem(7);

				toolbar.enableItem(1);
				toolbar.enableItem(3);
				toolbar.enableItem(5);
				toolbar.enableItem(7);
			});
		}

		// unbind events
		groupWin.attachEvent('onClose', function(win){
			$('body').off('change', '#groupAddNew select.sourceGroup');
			$('body').off('change', '#groupMoveColumn select.sourceGroup, #groupMoveColumn select.targetGroup');
			$('body').off('click', '#groupDetail input.save');
			$('body').off('click', '#groupDetail input.cancel');
			$('body').off('click', '#groupSort img.arrow');
			$('body').off('click', '#groupSort input.cancel');
			$('body').off('click', '#groupSort input.save');
			$('body').off('click', '#groupMoveColumn input.save');
			$('body').off('click', '#groupMoveColumn img.arrow');
			$('body').off('click', '#groupMoveColumn input.cancel');
			$('body').off('click', '#groupAddNew img.arrow');
			$('body').off('click', '#groupAddNew input.cancel');
			$('body').off('click', '#groupAddNew input.save');
			return true;
		});
	};

	Designer.prototype.OpenDataSourceWindow = function(selectItemId) {
		var editName = null;
		var mode = null;
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');

		var dataSourceWin = windows.createWindow({
		    id:"dataSource",
		    width:550,
		    height:430,
		    center:true,
		    modal:true,
		    resize:false
		});
		dataSourceWin.button('minmax').hide();
		dataSourceWin.button('park').hide();
		dataSourceWin.setText('Data Source');

		this.currentWindowOpen = dataSourceWin;

		var toolbar = dataSourceWin.attachToolbar();
		var layout = dataSourceWin.attachLayout({ pattern:'2U' });

		layout.cells('a').hideHeader();
		layout.cells('b').hideHeader();

		layout.cells('a').setWidth(130);

		var button = [
			// general
			{id:1, type:"button", text:"Add New", img:"database--plus.png", imgdis:"database--plus.png"},
			{id:2, type:"separator"},
			{id:3, type:"button", text:"Remove", img:"cross.png"}
		];

		toolbar.setIconsPath(this.fugueIconPath);
		toolbar.loadStruct(button);
		toolbar.hideItem(3); // hide remove button

		// load data source from details (jika ada)
		var savedDataSource = [];
		if (!$.isEmptyObject(designer.details.app.dataSource)) {
			for (var key in designer.details.app.dataSource) {
				savedDataSource.push({
					id:key,
					text:key,
					im0:'document.png',
					im1:'document.png',
					im2:'document.png'
				});
			}
		}

		// left side
		var tree = layout.cells('a').attachTree();
		tree.setImagesPath(this.dhtmlxImagePath +'dhxtree_skyblue/');
		tree.setIconsPath(this.fugueIconPath);
		tree.loadJSONObject({id:0, item: savedDataSource }); //root id 0

		// right side
		var noDataSourceAvailable = '<div id="connectionWinMessage"><p>No data source available.</p></div>';
		var noDataSourceSelected = '<div id="connectionWinMessage"><p>No data source selected.</p></div>';

		// jika tiada data source
		if ($.isEmptyObject(designer.details.app.dataSource)) {
			layout.cells('b').attachHTMLString(noDataSourceAvailable);
		} else {
			layout.cells('b').attachHTMLString(noDataSourceSelected);
		}

		// closing button
		var closingButton = '\n\
		<div class="buttonPlaceholder" style="padding:10px 15px;">\n\
			<input type="button" class="preview" style="padding:6px 35px" value="Preview"/>\n\
			<input type="button" class="save" style="padding:6px 35px" value="Save"/>\n\
		</div>';

		// connection drop down
		var connectionDropDown = '';
		for (var key in designer.details.app.connection) {
			connectionDropDown += '<option value="'+ key +'">'+ key +'</option>';
		}

		// event : toolbar onclick
		toolbar.attachEvent('onClick', function(id){

			// add new data source
			if (id === '1') {
				tree.clearSelection();
				toolbar.hideItem(3);

				mode = 'add';
				var addNewDataSource = '\n\
				<table border="0" class="windowForm" id="dataSourceAddNew">\n\
				<col style="width:120px">\n\
				<col style="width:10px">\n\
				<col>\n\
				<tr>\n\
					<td colspan="3"><b>Add New Data Source</b></td>\n\
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
					<td>Connection</td>\n\
					<td>:</td>\n\
					<td>\n\
						<select class="connection" data-key="connection">\n\
							'+ connectionDropDown +'\n\
						</select>\n\
					</td>\n\
				</tr>\n\
				<tr>\n\
					<td>Data Source Name</td>\n\
					<td>:</td>\n\
					<td><input type="text" class="name fullwidth" data-key="name" value="zzz"/></td>\n\
				</tr>\n\
				<tr>\n\
					<td>Main</td>\n\
					<td>:</td>\n\
					<td><input type="checkbox" class="main" data-key="main" checked/></td>\n\
				</tr>\n\
				<tr>\n\
					<td>Query</td>\n\
					<td></td>\n\
					<td></td>\n\
				</tr>\n\
				<tr>\n\
					<td colspan="3"><textarea class="query" data-key="query" style="width:97%; height:120px; outline:none; resize:none; font-family:\'Consolas\', monospace;">select * from test.peribadi</textarea></td>\n\
				</tr>\n\
				<tr>\n\
					<td><small>Max Preview Records</small></td>\n\
					<td>:</td>\n\
					<td><input type="number" class="maxpreview" data-key="maxpreview" value="100"/></td>\n\
				</tr>\n\
				</table>\n\
				';

				layout.cells('b').attachHTMLString(addNewDataSource + closingButton);
			}

			// remove data source
			else if (id === '3') {
				dhtmlx.confirm({
					title: "Remove",
					type:"confirm-info",
					text: "<img src='../img/icons/exclamation.png'/><br/>Remove this data source?",
					callback: function(answer) {
						if (answer === true) {
							var dataSourceName = tree.getSelectedItemId();

							designer.tree.data.deleteItem('1:::'+dataSourceName, false);
							tree.deleteItem(dataSourceName, false);

							// remove from details #setter
							delete designer.details.app.dataSource[dataSourceName];

							if ($.isEmptyObject(designer.details.app.dataSource)) {
								layout.cells('b').attachHTMLString(noDataSourceAvailable);
							} else {
								layout.cells('b').attachHTMLString(noDataSourceSelected);
							}

							// hide button remove
							toolbar.hideItem(3);
						}
					}
				});
			}

		});

	 	// preview button
		$(layout.base).on('click', '.buttonPlaceholder input.preview', function(){
			var form = (mode === 'add') ? $('#dataSourceAddNew') : $('#dataSourceEdit');
			var connectionName = form.find('.connection').val();
			var max = parseInt(form.find('.maxpreview').val());

			// jika connection null atau kosong
			if (connectionName === '' || connectionName === null) {
				dhtmlx.alert({
					title:'Error',
					type:'alert-info',
					text:'<img style="margin:-4px 4px;" src="../img/icons/exclamation-red-frame.png"><p>Invalid connection.</p>'
				});
				return false;
			}

			// jika max preview record bukan number
			if (isNaN(max)) {
				dhtmlx.alert({
					title:'Error',
					type:'alert-info',
					text:'<img style="margin:-4px 4px;" src="../img/icons/exclamation-red-frame.png"><p>Invalid number of max preview records.</p>'
				});
				return false;
			}

			// kalau lebih dari 1k, bagi warning
			if (max > 1000) {
				dhtmlx.confirm({
					title:'Warning',
					type:'alert-info',
					text:"<img src='../img/icons/exclamation.png'/><br/>Preview might be slow because too much records. Do you want to proceed?<br/><br/><small>100 is recommended</small>",
					callback:function(answer){
						if (answer === true) {
							// proceed
						}
					}
				});
			// kurang 1k
			} else {
				var detail = {};

				form.find('input, select, textarea').each(function(){
					var key = $(this).attr('data-key');
					var value = $(this).val();
					detail[key] = value;
				});

				designer.PreviewRecords(detail);
			}
		});

	 	// save button (data source)
		$(layout.base).on('click', '.buttonPlaceholder input.save', function(){
			var form = (mode === 'add') ? $('#dataSourceAddNew') : $('#dataSourceEdit');
			var detail = {};

			form.find('input, select, textarea').each(function(){
				var key = $(this).attr('data-key');
				var value = $(this).val();
				detail[key] = value;
			});

			// reset main status pada setiap data source kepada false
			for (var key in designer.details.app.dataSource) {
				designer.details.app.dataSource[key].main = false;
			}
			designer.mainQuery = null;

			// checkbox main
			detail.main = form.find('input.main').prop('checked');

			//validate
			if (detail.connection === '' || detail.connection === null) {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img style="margin:-4px 4px;" src="../img/icons/exclamation-red-frame.png"><p>Invalid connection selected. Make sure you<br/>have at least one connection to select.</p>'
				});
				return false;
			}

			if (detail.name === '') {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img style="margin:-4px 4px;" src="../img/icons/exclamation-red-frame.png"><p>Empty data source name!</p>'
				});
				return false;
			}

			if (detail.query === '') {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img style="margin:-4px 4px;" src="../img/icons/exclamation-red-frame.png"><p>Empty query!</p>'
				});
				return false;
			}

			// add mode *datasource
			if (mode === 'add') {
				// jika nama dah ada
				if (designer.details.app.dataSource[detail.name] !== undefined) {
					dhtmlx.alert({
						title:'Error',
						style:"alert-info",
						text:'<img style="margin:-4px 4px;" src="../img/icons/exclamation-red-frame.png"><p>Data source with name "'+ detail.name +'" already exist.</p>'
					});
					return false;
				}

				// preparing
				toolbar.disableItem(1);
				layout.cells('a').progressOn();
				layout.cells('b').progressOn();

				$.ajax({
					url:designer.phpPath + 'designer.fetchcolumn.php',
					type:'post',
					data:{
						detail : JSON.stringify(detail),
						connection : JSON.stringify(designer.details.app.connection[detail.connection])
					},
					dataType:'json'
				})
				.done(function(response){
					if (response.status === 0) {
						dhtmlx.alert({
							title:'Error',
							style:"alert-info",
							text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>' + response.message
						});

						// reset
						toolbar.enableItem(1);
						layout.cells('a').progressOff();
						layout.cells('b').progressOff();
						return false;

					} else {
						//update tree
						tree.insertNewItem(0, detail.name, detail.name, null, 'document.png', 'document.png', 'document.png');
						designer.tree.data.insertNewItem(1, '1:::' + detail.name, detail.name, null, 'document.png', 'document.png', 'document.png');

						//update details #setter
						designer.details.app.dataSource[detail.name] = detail;

						if (detail.main) designer.mainQuery = designer.details.app.dataSource[detail.name];

						// jika data source tiada group, tambah root group
						if (designer.details.app.dataSource[detail.name].group === undefined) {
							designer.details.app.dataSource[detail.name].group = {"ROOT_GROUP":{ "column":{} }};

							for (var c=0; c<response.length; c++) {
								var columnName = response[c].name;
								var columnType = response[c].dataType;
								designer.details.app.dataSource[detail.name].group['ROOT_GROUP'].column[columnName] = { dataType:columnType };
							}
						}

						//clear right side
						layout.cells('b').attachHTMLString(noDataSourceSelected);

						//clear tree selection
						tree.clearSelection();

						// display message
						dhtmlx.message({
							text:'<table border="0"><col style="width:30px"><col><tr><td><img src="../img/icons/tick.png"></td><td>Data source has been successfully saved!</td></tr></table>',
							expire:2000
						});

						// update tree structure
						if (detail.main) {
							var groupNameTop = Object.keys(designer.mainQuery.group)[0];
							designer.tree.structure.setItemText('header', 'Header <small class="grouplabel">'+ groupNameTop +'</small>');
							designer.tree.structure.setItemText('footer', 'Footer <small class="grouplabel">'+ groupNameTop +'</small>');
						}

						// update band title
						$('#workspace .band[data-name="Header"] .title p').text('Header : ' + groupNameTop);
						$('#workspace .band[data-name="Footer"] .title p').text('Footer : ' + groupNameTop);
					}

					// reset
					toolbar.enableItem(1);
					layout.cells('a').progressOff();
					layout.cells('b').progressOff();

					mode = null;
					editName = null;
				})
				.fail(function(){
					dhtmlx.alert({
						title:'Error',
						style:"alert-info",
						text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Fetching failure!'
					});

					// reset
					toolbar.enableItem(1);
					layout.cells('a').progressOff();
					layout.cells('b').progressOff();
				});
			}
			// edit mode
			else if (mode === 'edit') {

				// query compare
				var newQuery = detail.query;
				var oldQuery = designer.details.app.dataSource[editName].query;

				// simpan group object yang lama
				var groupObject;
				if (designer.details.app.dataSource[editName].group !== undefined) {
					groupObject = $.extend(true, {}, designer.details.app.dataSource[editName].group);
				}

				// jika query masih sama dengan yang lama
				if (newQuery === oldQuery) {

					// jika nama lama tidak sama dengan nama baru
					if (editName !== detail.name) {

						// jika nama dah ada
						if (designer.details.app.dataSource[detail.name] !== undefined) {
							dhtmlx.alert({
								title:'Error',
								style:"alert-info",
								text:'<img style="margin:-4px 4px;" src="../img/icons/exclamation-red-frame.png"><p>Data source with name "'+ detail.name +'" already exist.</p>'
							});
							return false;
						}

						// update tree
						tree.changeItemId(editName, detail.name);
						tree.setItemText(detail.name, detail.name);

						designer.tree.data.changeItemId('1:::' + editName, '1:::' + detail.name);
						designer.tree.data.setItemText('1:::' + detail.name, detail.name);
					}

					// remove yang lama
					delete designer.details.app.dataSource[editName];

					// add new connection #setter
					designer.details.app.dataSource[detail.name] = detail;
					if (detail.main) designer.mainQuery = designer.details.app.dataSource[detail.name];

					// masukkan balik group object
					designer.details.app.dataSource[detail.name].group = groupObject;

					// clear tree
					tree.clearSelection();

					// reset right side
					layout.cells('b').attachHTMLString(noDataSourceSelected);

					dhtmlx.message({
						text:'<table border="0"><col style="width:30px"><col><tr><td><img src="../img/icons/tick.png"></td><td>Data source details saved.</td></tr></table>',
						expire:2000
					});

					// reset
					toolbar.enableItem(1);
					toolbar.hideItem(3);
					layout.cells('a').progressOff();
					layout.cells('b').progressOff();

					mode = null;
					editName = null;
				}
				// jika query dah berubah
				else {

					dhtmlx.confirm({
						title:"Confirm Execute",
						style:'alert-info',
						text:"You have changed the query and you might have to rearrange the group(s) and column(s). Proceed?",
						callback:function(answer){
							if (answer === true) {

								// jika nama lama tidak sama dengan nama baru
								if (editName !== detail.name) {

									// jika nama dah ada
									if (designer.details.app.dataSource[detail.name] !== undefined) {
										dhtmlx.alert({
											title:'Error',
											style:"alert-info",
											text:'<img style="margin:-4px 4px;" src="../img/icons/exclamation-red-frame.png"><p>Data source with name "'+ detail.name +'" already exist.</p>'
										});
										return false;
									}

									// update tree
									tree.changeItemId(editName, detail.name);
									tree.setItemText(detail.name, detail.name);

									designer.tree.data.changeItemId('1:::' + editName, '1:::' + detail.name);
									designer.tree.data.setItemText('1:::' + detail.name, detail.name);
								}

								// ajax untuk dapatkan column
								$.ajax({
									url:designer.phpPath + 'designer.fetchcolumn.php',
									type:'post',
									data:{
										detail : JSON.stringify(detail),
										connection : JSON.stringify(designer.details.app.connection[detail.connection])
									},
									dataType:'json'
								})
								.done(function(response){

									// jika tidak berjaya (server bgtau sebab apa tak berjaya)
									if (response.status === 0) {
										dhtmlx.alert({
											title:'Error',
											style:"alert-info",
											text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>' + response.message
										});
										return false;

									// jika berjaya
									} else {
										// remove yang lama
										delete designer.details.app.dataSource[editName];

										// add new connection #setter
										designer.details.app.dataSource[detail.name] = detail;
										designer.mainQuery = designer.details.app.dataSource[detail.name];

										var totalGroup = Object.keys(groupObject).length;

										// jika group ada satu sahaja
										if (totalGroup === 1) {
											for (var key in groupObject) {
												groupObject[key].column = {}; // emptykan column

												for (var c=0; c<response.length; c++) {
													var columnName = response[c].name;
													var columnType = response[c].dataType;
													groupObject[key].column[columnName] = { dataType:columnType };
												}
											}

											// masukkan balik group object
											designer.details.app.dataSource[detail.name].group = groupObject;
										}
										// jika ada banyak group
										else if (totalGroup > 1) {
											
											// loop setiap group > column dan tambah prefix
											for (var groupName in groupObject) {
												for (var columnName in groupObject[groupName].column) {
													groupObject[groupName].column['old:::' + columnName] = $.extend(true, {}, groupObject[groupName].column[columnName]);
													delete groupObject[groupName].column[columnName];
												}
											}

											// loop setiap column yang baru difetch
											for (var c=0; c<response.length; c++) {
												var columnName = response[c].name;
												var tempColumnName = 'old:::' + columnName;
												var columnType = response[c].dataType;

												// loop group
												for (var groupName in groupObject) {

													// jika temp column name ada dalam group
													if (groupObject[groupName].column[tempColumnName] !== undefined) {
														delete groupObject[groupName].column[tempColumnName];
														groupObject[groupName].column[columnName] = { dataType:columnType };

														// dah berjaya masuk, buang dari senarai asal
														delete response[c];
													}
												}
											}

											// loop setip group kembali
											for (var groupName in groupObject) {
												for (var columnName in groupObject[groupName].column) {
													if (columnName.slice(0,6) === 'old:::') {
														delete groupObject[groupName].column[columnName];
													}
												}

												if ($.isEmptyObject(groupObject[groupName].column)) {
													delete groupObject[groupName];
												}
											}

											// loop sumber column, masukkan ke dalam satu group baru jika tiada yang berkaitan di atas
											for (var c=0; c<response.length; c++) {
												if (response[c] !== undefined) {

													var columnName = response[c].name;
													var columnType = response[c].dataType;

													// jika group baru masih belum di create, create dulu
													if (groupObject['NEW_GROUP'] === undefined) {
														groupObject['NEW_GROUP'] = { column:{} };
													}

													groupObject['NEW_GROUP'].column[columnName] = { dataType:columnType }; 
												}
											}

											// masukkan balik group object
											designer.details.app.dataSource[detail.name].group = groupObject;
										}

										// clear tree
										tree.clearSelection();

										// reset right side
										layout.cells('b').attachHTMLString(noDataSourceSelected);

										dhtmlx.message({
											text:'<table border="0"><col style="width:30px"><col><tr><td><img src="../img/icons/tick.png"></td><td>Data source details saved.</td></tr></table>',
											expire:2000
										});

										// reset
										toolbar.enableItem(1);
										toolbar.hideItem(3);
										layout.cells('a').progressOff();
										layout.cells('b').progressOff();

										mode = null;
										editName = null;
									}
								})
								.fail(function(){
									dhtmlx.alert({
										title:'Error',
										style:"alert-info",
										text:'<img src="../img/icons/exclamation-red-frame.png"/><br/>Fetching failure!'
									});
								});
							} 
						}
					});
				}
			}
		});

		// tree connection click
		tree.attachEvent('onClick', function(id){
			mode = 'edit';
			editName = id;

			//display remove button
			toolbar.showItem(3);

			//display edit form
			var editDataSource = '\n\
			<table border="0" class="windowForm" id="dataSourceEdit">\n\
			<col style="width:120px">\n\
			<col style="width:10px">\n\
			<col>\n\
			<tr>\n\
				<td colspan="3"><b>Edit Data Source</b></td>\n\
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
				<td>Connection</td>\n\
				<td>:</td>\n\
				<td>\n\
					<select class="connection" data-key="connection">\n\
						'+ connectionDropDown +'\n\
					</select>\n\
				</td>\n\
			</tr>\n\
			<tr>\n\
				<td>Data Source Name</td>\n\
				<td>:</td>\n\
				<td><input type="text" class="name fullwidth" data-key="name" value="'+ designer.details.app.dataSource[id].name +'"/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Main</td>\n\
				<td>:</td>\n\
				<td><input type="checkbox" class="main" data-key="main"/></td>\n\
			</tr>\n\
			<tr>\n\
				<td>Query</td>\n\
				<td></td>\n\
				<td></td>\n\
			</tr>\n\
			<tr>\n\
				<td colspan="3"><textarea class="query" data-key="query" style="width:97%; height:120px; outline:none; resize:none; font-family:\'Consolas\', monospace;">'+ designer.details.app.dataSource[id].query +'</textarea></td>\n\
			</tr>\n\
			<tr>\n\
				<td><small>Max Preview Records</small></td>\n\
				<td>:</td>\n\
				<td><input type="number" class="maxpreview" data-key="maxpreview" value="100"/></td>\n\
			</tr>\n\
			</table>\n\
			';

			layout.cells('b').attachHTMLString(editDataSource + closingButton);

			// select dropdown (connection)
			$(layout.base).find('select.connection').val(designer.details.app.dataSource[id].connection);

			// checkbox
			$(layout.base).find('input.main').prop('checked', designer.details.app.dataSource[id].main);
		});

		// automatic show details if any
		if (selectItemId !== undefined) {
			selectItemId = selectItemId.split(':::');
			selectItemId = selectItemId[1];
			tree.selectItem(selectItemId, true);
		}

		// unbind
		dataSourceWin.attachEvent('onClose', function(){
			$(layout.base).off('click', '.buttonPlaceholder input.preview');
			$(layout.base).off('click', '.buttonPlaceholder input.save');
			return true;
		});
	};

	Designer.prototype.PreviewRecords = function(detail) {
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');

		var previewWin = windows.createWindow({
		    id:"dataSource",
		    width:600,
		    height:400,
		    center:true,
		    modal:true
		});
		previewWin.button('park').hide();
		previewWin.setText('Preview Records');
		previewWin.attachURL(this.phpPath + 'designer.previewrecords.php', null, {
			connection : JSON.stringify(designer.details.app.connection[detail.connection]),
			query : detail.query,
			max : detail.maxpreview
		});
	};

	Designer.prototype.InitWorkspace = function() {
		var workspace = $('<div id="workspace"></div>');
		var bandWidth = designer.details.default.bandWidth[designer.details.app.format.paper][designer.details.app.format.orientation];

		// init bands
		for (var key in this.details.app.band) {
			var band = new Band({title : key});
			band.elem.appendTo(workspace);
			band.RegisterTreeId(this.details.app.band[key].treeId);
			band.ApplyResize();
			this.details.app.band[key] = band;
		}

		this.layout.cells('b').attachObject(workspace[0]);
	};

	Designer.prototype.InitElementTree = function() {
		// dapatkan sumber dari details default
		var elements = [];
		var elementId = 2;
		for (var key in this.details.app.element) {
			elements.push({ id:elementId++, text:key, im0:this.details.app.element[key].icon });
		}

		// build up tree
		var defaultTree = {
			id:0,
			item:elements
		};

		this.tree.element = this.layout.cells('c').attachTree();
		this.tree.element.setImagesPath(this.dhtmlxImagePath +'dhxtree_skyblue/');
		this.tree.element.setIconsPath(this.fugueIconPath);
		this.tree.element.loadJSONObject(defaultTree);
	};

	Designer.prototype.InitDataTree = function() {
		var defaultTree = {
			id:0,
			item:[
				{id:4, text:"Connection", im0:"lightning.png", im1:"lightning.png", im2:"lightning.png"},
				{id:1, text:"Data Source", im0:"database-network.png", im1:"database-network.png", im2:"database-network.png"},
				{id:2, text:"User Parameter", im0:"paper-plane.png", im1:"paper-plane.png", im2:"paper-plane.png"},
				{id:3, text:"System Parameter", im0:"monitor-window-flow.png", im1:"monitor-window-flow.png", im2:"monitor-window-flow.png"},
			]
		};

		this.tree.data = this.tabbar.cellA.cells('data').attachTree();
		this.tree.data.setImagesPath(this.dhtmlxImagePath +'dhxtree_skyblue/');
		this.tree.data.setIconsPath(this.fugueIconPath);
		this.tree.data.loadJSONObject(defaultTree, function(){
			designer.tree.data.openItem(1);
		});
	};

	Designer.prototype.InitStructureTree = function() {
		// build tree based on details
		var bands = [];
		for (var key in this.details.default.band) {
			bands.push({ id:this.details.default.band[key].treeId , text:key, im0:"zone.png", im1:"zone.png", im2:"zone.png" });
		}

		// build main tree
		var defaultTree = {
			id:0,
			item:[
				{id:1, text:"Report", im0:"application-text-image.png", im1:"application-text-image.png", im2:"application-text-image.png", item:bands}
			]
		};

		this.tree.structure = this.tabbar.cellA.cells('structure').attachTree();
		this.tree.structure.setImagesPath(this.dhtmlxImagePath +'dhxtree_skyblue/');
		this.tree.structure.setIconsPath(this.fugueIconPath);
		this.tree.structure.loadJSONObject(defaultTree, function(){
			designer.tree.structure.openItem(1);
		});
	};

	Designer.prototype.InitDragDrop = function(){

		// tree element
		$(this.tree.element.parentObject).find('.standartTreeRow').draggable({
			appendTo:'#app',
			helper : 'clone',
			zIndex : 100
		});

		// band droppable
		$('#workspace .band .area').droppable({
			accept : '.standartTreeRow',
			hoverClass : 'hoverDrop',
			drop : function(event, ui){
				designer.DeselectCurrentElement();
				designer.DrawElement(event, ui);
			}
		});
	};

	Designer.prototype.InitProperties = function() {
		var properties = '<div id="properties" style="display:none">';

		// element > general
		properties += '\n\
		<table border="0" class="windowForm">\n\
		<col class="label"></col>\n\
		<col></col>\n\
		<tr><td>ID</td><td><span>....</span></td></tr>\n\
		<tr><td>Name</td><td><input type="text" class="fullwidth"/></td></tr>\n\
		<tr><td>Width</td><td><input type="number" min="0" class="fullwidth"/></td></tr>\n\
		<tr><td>Height</td><td><input type="number" min="0" class="fullwidth"/></td></tr>\n\
		<tr><td>Left</td><td><input type="number" min="0" class="fullwidth"/></td></tr>\n\
		<tr><td>Top</td><td><input type="number" min="0" class="fullwidth"/></td></tr>\n\
		';

		// element > label
		properties += '\n\
		<tr><td>Text</td><td><input type="button" value="..."/></td></tr>\n\
		';

		properties += '</table>';
		properties += '</div>';

		this.propertiesGrid = $(properties);
		this.layout.cells('d').attachObject(this.propertiesGrid[0]);
		this.propertiesGrid.hide();
		this.propertiesGrid.find('table.windowForm').colResizable();

		$(this.layout.cells('d').cell).on('click', function(e){
			e.stopPropagation();
		});
	};

	Designer.prototype.DrawElement = function(event, ui){
		var type = $(ui.helper).text().toLowerCase();
		var targetArea = $(event.target);
		var clone = $(ui.helper).clone();
		var bandName = targetArea.closest('.band').attr('data-name');
		var band = this.details.app.band[bandName];

		// dapatkan proper position
		targetArea.append(clone);
		var posX = clone.position().left - targetArea.offset().left;
		var posY = clone.position().top - targetArea.offset().top;
		clone.remove();
		
		if (type === 'label') {
			var label = new Label();
			label.parentBand = band;
			label.SetPosition(posX, posY);
			label.Draw(targetArea);
			label.ApplyDrag();
			label.ApplyResize();
			label.RegisterTree();
			label.Select();
			label.AttachToParent();
			label.UpdatePosition();
		}
		else if (type === 'field') {
			var field = new Field();
			field.parentBand = band;
			field.SetPosition(posX, posY);
			field.Draw(targetArea);
			field.ApplyDrag();
			field.ApplyResize();
			field.RegisterTree();
			field.Select();
			field.AttachToParent();
			field.UpdatePosition();
		}

		// update band min height
		this.UpdateBandMinHeight(band);
	};

	Designer.prototype.UpdateBandMinHeight = function(band) {
		var heightCollection = [];
		band.elem.find('.element').each(function(){
			var posY2 = $(this).position().top + $(this).outerHeight();
			heightCollection.push(posY2);
		});

		band.minHeight = Math.max.apply(null, heightCollection);
		band.elem.find('.area').resizable('option', 'minHeight', band.minHeight);
	};

	Designer.prototype.GoBackHome = function() {
		window.location.href = '../?error=permission&page=designer';
	};

	Designer.prototype.DeselectCurrentElement = function() {
		if (this.currentSelectedElement !== null) {
			this.currentSelectedElement.Deselect();
		}
	};

	Designer.prototype.Refresh = function() {
		this.layout.cells('a').setWidth(230);
		this.layout.cells('c').setWidth(230);
	};

	Designer.prototype.Preview = function() {
		// preview window
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');

		var parameterWin = windows.createWindow({
		    id:"preview",
		    width:550,
		    height:430,
		    center:true,
		    modal:true
		});
		parameterWin.button('minmax').hide();
		parameterWin.button('park').hide();
		parameterWin.setText('Preview');
		//parameterWin.maximize();

		// generate report details
		this.GenerateReportDetails();

		parameterWin.attachURL(this.phpPath + 'designer.preview.php', null, {data:JSON.stringify(this.details.report) });
	};

	Designer.prototype.GenerateReportDetails = function() {
		// general
		this.details.report.general.name = this.details.app.general.reportTitle;
		this.details.report.general.author = this.details.app.general.author;

		// data > connection
		for (var connName in this.details.app.connection) {
			this.details.report.data.connection[connName] = $.extend(true, {}, this.details.app.connection[connName]);
			this.details.report.data.connection[connName].active = true;
		}

		// data > query
		for (var dataSourceName in this.details.app.dataSource) {
			if (this.details.app.dataSource[dataSourceName].type === 'database') {
				this.details.report.data.query[dataSourceName] = {
					sql : this.details.app.dataSource[dataSourceName].query,
					connection : this.details.app.dataSource[dataSourceName].connection,
					active : true,
					main : this.details.app.dataSource[dataSourceName].main,
					group : this.details.app.dataSource[dataSourceName].group
				};
			}
		}

		// layout > general
		this.details.report.layout.general.unit = 'mm';
		this.details.report.layout.general.format = designer.details.app.format.paper;
		this.details.report.layout.general.orientation = designer.details.app.format.orientation;
		this.details.report.layout.general.margin = $.extend(true, {}, designer.details.app.margin);

		// layout > band
		// susunannya mengikut apa yang ada pada workspace
		$('#workspace .band').each(function(){
			var bandName = $(this).attr('data-name');
			var band = designer.details.app.band[bandName];

			// rename kepada nama yang viewer boleh baca
			// contoh : 'Report Header' kepada 'reportHeader'
			bandName = bandName.replace(/\s/g, '');
			bandName = bandName.charAt(0).toLowerCase() + bandName.slice(1);
			
			// declare
			designer.details.report.layout.band[bandName] = {
				element:[]
			};

			for (var i=0; i<band.element.length; i++) {
				var element = $.extend({}, band.element[i]);

				// convert px to unit (pdf)
				element.width = element.width / 3;
				element.height = element.height / 3;
				element.posX = element.posX / 3;
				element.posY = element.posY / 3;

				// remove key yang tak perlu
				delete element.style;
				delete element.elem;
				delete element.parentBand;

				designer.details.report.layout.band[bandName].element.push(element);
			}
		});
	};

	// event : tree structure click
	Designer.prototype.TreeStructureRegisterEvent = function() {

		// structure
		this.tree.structure.attachEvent('onClick', function(id){
			designer.currentTreeSelected = this.selectionBar.parentElement;
			designer.DeselectCurrentElement();

			// clear yang lain
			designer.tree.data.clearSelection();
			designer.tree.element.clearSelection();
		});

		// data
		this.tree.data.attachEvent('onClick', function(id){
			designer.currentTreeSelected = this.selectionBar.parentElement;

			// clear yang lain
			designer.tree.structure.clearSelection();
			designer.tree.element.clearSelection();
		});

		this.tree.data.attachEvent('onDblClick', function(id){
			designer.currentTreeSelected = this.selectionBar.parentElement;

			// dapatkan id parent
			var parentId = designer.tree.data.getParentId(id);

			// connection
			if (parentId === 4) {
				designer.OpenConnectionWindow(id);
			}
			// data source
			else if (parentId === 1) {
				designer.OpenDataSourceWindow(id);
			}
			// user parameter
			else if (parentId === 2) {
				designer.OpenParameterWindow();
			}

			// clear selection
			designer.tree.data.clearSelection();
			designer.tree.structure.clearSelection();
			designer.tree.element.clearSelection();
		});

		// tree
		this.tree.element.attachEvent('onClick', function(id){
			// clear yang lain
			designer.tree.structure.clearSelection();
			designer.tree.data.clearSelection();
		});
	};

	Designer.prototype.Logout = function(){
		var phpPath = this.phpPath;
		dhtmlx.confirm({
			title : "Logout",
			style : 'alert-info',
			text : 'Are you sure you want to logout?',
			callback : function(answer){
				if (answer === true) {
					// destroy session
					$.ajax({
						url:phpPath + 'designer.destroysession.php'
					})
					.done(function(){
						window.location.href = '../';
					})
					.fail(function(){
						dhtmlx.alert({
							title : 'Error',
							style : 'alert-info',
							text : 'Unable to destroy session (unreachable).<br/>Logout failed.'
						});
					});
				}
			}
		});
	};

	Designer.prototype.KeyboardBinding = function(){
		Mousetrap.bind('up', function(event){
			
			// gerakkan element dalam workspace (atas)
			if (designer.currentSelectedElement !== null) {
				event.preventDefault();
				var newTop = designer.currentSelectedElement.elem.position().top - 1;
				if (newTop >= 0) {
					designer.currentSelectedElement.elem.css('top', newTop + 'px');
					designer.currentSelectedElement.posY -= 1; // #setter
				}
			}

		});

		Mousetrap.bind('down', function(event){
			
			// gerakkan element dalam workspace (bawah)
			if (designer.currentSelectedElement !== null) {
				event.preventDefault();
				var bandAreaHeight = designer.currentSelectedElement.parentBand.elem.find('.area').innerHeight();
				var elementCurrentTop = designer.currentSelectedElement.elem.position().top;
				var elementHeight = designer.currentSelectedElement.elem.outerHeight();
				var elementPosY2 = elementCurrentTop + elementHeight;
				var newTop = designer.currentSelectedElement.elem.position().top + 1;

				if (elementPosY2 < bandAreaHeight) {
					designer.currentSelectedElement.elem.css('top', newTop + 'px');
					designer.currentSelectedElement.posY += 1; // #setter
				}
			}

		});

		Mousetrap.bind('left', function(event){
			
			// gerakkan element dalam workspace (kiri)
			if (designer.currentSelectedElement !== null) {
				event.preventDefault();
				var newLeft = designer.currentSelectedElement.elem.position().left - 1;
				if (newLeft >= 0) {
					designer.currentSelectedElement.elem.css('left', newLeft + 'px');
					designer.currentSelectedElement.posX -= 1; // #setter
				}
			}

		});

		Mousetrap.bind('right', function(event){
			
			// gerakkan element dalam workspace (kanan)
			if (designer.currentSelectedElement !== null) {
				event.preventDefault();
				var bandAreaWidth = designer.currentSelectedElement.parentBand.elem.find('.area').innerWidth();
				var elementCurrentLeft = designer.currentSelectedElement.elem.position().left;
				var elementWidth = designer.currentSelectedElement.elem.outerWidth();
				var elementPosX2 = elementCurrentLeft + elementWidth;
				var newLeft = designer.currentSelectedElement.elem.position().left + 1;

				if (elementPosX2 < bandAreaWidth) {
					designer.currentSelectedElement.elem.css('left', newLeft + 'px');
					designer.currentSelectedElement.posX += 1; // #setter
				}
			}

		});
	};

	// event : body click
	$('body').on('click', function(event){

		// tree item clicked (top level)
		/*if (designer.currentTreeSelected !== $(event.target).closest('div')[0]) {
			if (designer.currentTreeSelected !== event.target) {
				designer.tree.structure.clearSelection();
			}

			designer.tree.element.clearSelection();
			designer.tree.data.clearSelection();
		}

		designer.currentTreeSelected = null;

		// clear selection element
		designer.DeselectCurrentElement();*/

		designer.tree.structure.clearSelection();
		designer.tree.element.clearSelection();
		designer.tree.data.clearSelection();
		designer.DeselectCurrentElement();
	});

	$('body').on('click', 'td.standartTreeRow', function(e){
		e.stopPropagation();
	});

	// Array Remove - By John Resig (MIT Licensed)
	Designer.prototype.RemoveFromArray = function(array, from, to) {
		var rest = array.slice((to || from) + 1 || array.length);
		array.length = from < 0 ? array.length + from : from;
		return array.push.apply(array, rest);
	};
}