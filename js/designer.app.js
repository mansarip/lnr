function Designer() {

	this.phpPath = '../php/';
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
	this.sessionId = null;
	this.actionHistoryCursor = -1;
	this.actionHistory = [];
	this.view = {};
	this.icon = {
		error : '../img/icons/exclamation-red-frame.png',
		warning : '../img/icons/exclamation.png'
	};

	Designer.prototype.CheckLogin = function(proceedFunc) {
		var request = $.ajax({
			url : this.phpPath + 'designer.checklogin.php',
			dataType : 'json'
		});

		// jika butiran login tiada, patah balik ke landing page
		request.done(function(response){
			if (response.status === 0) {
				designer.GoBackHomeWithError();
			} else if (response.status === 1) {
				for (var key in response.view) {
					designer.view[key] = response.view[key];
				}
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
			margin : { //mm
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

		// dapatkan session id
		$.ajax({
			url:designer.phpPath + 'designer.getsessionid.php'
		}).done(function(id){ designer.sessionId = id; });
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
					{id:1.2, text:'Open'},
					{id:1.3, text:'Save'},
					{id:1.31, text:'Save to local'},
					{id:1.4, type:'separator'},
					{id:1.5, text:'Preview'},
					{id:1.6, text:'_Publish'},
					{id:1.7, type:'separator'},
					{id:1.8, text:'Back To Home'},
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
			else if (id === '1.3') { designer.Save(); }
			else if (id === '1.31') { designer.SaveToLocal(); }
			else if (id === '1.2') { designer.Open(); }
			else if (id === '1.8') { designer.GoBackHome(); }
		});
	};

	Designer.prototype.InitMainToolbar = function() {
		var defaultButton = [
			// general
			{id:1, type:"button", title:"New", img:"document.png"},
			{id:2, type:"button", title:"Open", img:"folder-horizontal-open.png"},
			{id:3, type:"button", title:"Save", img:"disk-return-black.png"},
			{id:19, type:"button", title:"Save To Local", img:"save-to-local.png"},
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

			// ux
			{id:20, type:"separator"},
			{id:21, type:"button", title:"Undo", img:"arrow-curve-180-left.png"},
			{id:22, type:"button", title:"Redo", img:"arrow-curve.png"},
			{id:23, type:"separator"},
			{id:24, type:"button", title:"Copy", img:"document-copy.png"},
			{id:25, type:"button", title:"Cut", img:"scissors-blue.png"},
			{id:26, type:"button", title:"Paste", img:"clipboard-paste-document-text.png"},
			{id:27, type:"button", title:"Delete", img:"cross-script.png"},
		];

		this.toolbar.setIconsPath(this.fugueIconPath);
		this.toolbar.loadStruct(defaultButton);

		// event register
		this.toolbar.attachEvent('onClick', function(id){

			// save
			if (id === '3') {
				designer.Save();
			}
			// save to local
			else if (id === '19') {
				designer.SaveToLocal();
			}
			// open
			else if (id === '2') {
				designer.Open();
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
			// delete
			else if (id === '27') {
				designer.DeleteElement();
			}
			// undo
			else if (id === '21') {
				designer.Undo();
			}
		});

		$(this.toolbar.base).find('.dhx_toolbar_btn[title="Undo"]').on('click', function(event){
			event.stopPropagation();
		});
	};

	Designer.prototype.OpenConnectionWindow = function(selectItemId) {
		this.DeselectCurrentElement();

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
				var view = designer.LoadView('connectionAddNew');
				layout.cells('b').attachHTMLString(view);
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
					text:'<img src="'+ designer.icon.error +'"/><br/>Invalid host'
				});
				return false;

			} else if (detail.user === '') {
				connectionWin.progressOff();
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img src="'+ designer.icon.error +'"/><br/>Invalid user'
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
						text:(response.status === 0 ? '<img src="'+ designer.icon.error +'"/><br/>' + response.message : 'Successfully connected!')
					});
				})
				.fail(function(){
					connectionWin.progressOff();
					dhtmlx.alert({
						title:'Unexpected Error',
						style:"alert-error",
						text:'<img src="'+ designer.icon.error +'"/><br/>Failed to connect server'
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
					text:'<img src="'+ designer.icon.error +'"/><br/>Unable to save : Empty connection name'
				});
				return false;
			}
			if (detail.type === '') {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img src="'+ designer.icon.error +'"/><br/>Unable to save : Invalid connection type'
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
						text:'<img src="'+ designer.icon.error +'"/><br/>Unable to save : Connection name already exist'
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
							text:'<img src="'+ designer.icon.error +'"/><br/>Unable to save : Connection name already exist'
						});
						return false;
					}

					// update tree
					tree.changeItemId(editName, detail.name);
					tree.setItemText(detail.name, detail.name);

					// update main query
					designer.mainQuery.connection = detail.name;

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

			var view = designer.LoadView('connectionEdit', id);
			layout.cells('b').attachHTMLString(view);
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
			designer.currentWindowOpen = null;
			return true;
		});
	};

	Designer.prototype.OpenParameterWindow = function() {
		this.DeselectCurrentElement();

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

		var view = designer.LoadView('parameterAddNew');
		layout.cells('a').attachHTMLString(view);

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
					text:'<img src="'+ designer.icon.error +'"/><br/>Empty parameter name'
				});
				return false;
			}
			// jika param name dah ada
			else if (designer.details.app.parameter[paramName] !== undefined) {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img src="'+ designer.icon.error +'"/><br/>Parameter name is already exist'
				});
				return false;
			}
			// jika data type number, tapi default value bukan number
			else if (paramDataType === 'number' && isNaN(Number(paramDefaultValue))) {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img src="'+ designer.icon.error +'"/><br/>Default value is not a number'
				});
				return false;
			}
			else if (paramDataType === 'number' && paramDefaultValue === '') {
				paramDefaultValue = 0;
			}

			// tambah pada list
			designer.parameterListGrid.addRow(paramName, paramName + ',' + paramDefaultValue + ',' + paramDataType + ',' + paramSourceType + ',' + '../img/icons/cross.png^Remove^javascript:designer.PromptRemoveParameter();');

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
							text:'<img src="'+ designer.icon.error +'"/><br/>Parameter name is already exist'
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
							text:'<img src="'+ designer.icon.error +'"/><br/>Default value is not a number'
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
			designer.currentWindowOpen = null;
			return true;
		});
	};

	Designer.prototype.PromptRemoveParameter = function() {
		dhtmlx.confirm({
			title:'Remove',
			type:'alert-info',
			text:"<img src='"+ designer.icon.warning +"'/><br/>Confirm remove parameter?",
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
				}
			}
		});
	};

	Designer.prototype.OpenPreferencesWindow = function() {
		this.DeselectCurrentElement();

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
		
		// general tab
		var viewGeneral = designer.LoadView('preferencesGeneral');
		tabbar.tabs(1).attachHTMLString(viewGeneral);

		// format tab
		var viewFormat = designer.LoadView('preferencesFormat');
		tabbar.tabs(3).attachHTMLString(viewFormat);

		// margin tab
		var viewMargin = designer.LoadView('preferencesMargin');
		tabbar.tabs(2).attachHTMLString(viewMargin);

		// close window button
		$(tabbar.base).find('input.close').click(function(){
			preferences.close();
			designer.currentWindowOpen = null;
			windows.unload();
		});

		// tag : preferences #setter

		// save then close window button
		$(tabbar.base).find('input.save').click(function(e){

			e.stopPropagation();

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
			bandSize -= (margin.left * 3);
			bandSize -= (margin.right * 3);
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
			designer.currentWindowOpen = null;
			windows.unload();
		});

		// unbind
		preferences.attachEvent('onClose', function(){
			$(tabbar.base).find('input.close').unbind();
			$(tabbar.base).find('input.save').unbind();
			designer.currentWindowOpen = null;
			return true;
		});
	};

	Designer.prototype.OpenGroupWindow = function(){
		this.DeselectCurrentElement();

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

			groupWin.attachHTMLString(designer.LoadView('groupNoMain'));

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
			layout.cells('a').attachHTMLString(designer.LoadView('groupInfo'));

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
							text:'<img src="'+ designer.icon.error +'"/><br/>Empty group name!'
						});
						return false;
					}

					// jika nama dah ada
					if (designer.mainQuery.group[groupName] !== undefined) {
						dhtmlx.alert({
							title:'Error',
							style:"alert-info",
							text:'<img src="'+ designer.icon.error +'"/><br/>Name already exist!'
						});
						return false;
					}

					// tukar band title dan update band data
					if (designer.details.app.band['Group Header : ' + oldGroupName]) {
						designer.details.app.band['Group Header : ' + groupName] = $.extend(true, {}, designer.details.app.band['Group Header : ' + oldGroupName]);
						designer.details.app.band['Group Footer : ' + groupName] = $.extend(true, {}, designer.details.app.band['Group Footer : ' + oldGroupName]);

						// title property
						designer.details.app.band['Group Header : ' + groupName].title = 'Group Header : ' + groupName;
						designer.details.app.band['Group Footer : ' + groupName].title = 'Group Footer : ' + groupName;

						// remove yang lama
						delete designer.details.app.band['Group Header : ' + oldGroupName];
						delete designer.details.app.band['Group Footer : ' + oldGroupName];
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

					// update band data
					if (groupNumber > 0) {
						//console.log(oldGroupName);
						// designer.details.app.band['Group Header : ' + groupName] = $.extend(true, {}, );
						// designer.details.app.band['Group Footer : ' + groupName] = {};
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


				// update tree structure (label)
				var groups = Object.keys(designer.mainQuery.group);
				var bands = $('#workspace .band');
				var totalBand = bands.length;

				for (var i=0; i < groups.length; i++) {
					var groupName = groups[i];

					if (i === 0) {
						designer.tree.structure.setItemText('header', 'Header <small class="grouplabel">'+ groupName +'</small>');
						designer.tree.structure.setItemText('footer', 'Footer <small class="grouplabel">'+ groupName +'</small>');
						$('#workspace .band[data-name="Header"] .title p').text('Header : ' + groupName);
						$('#workspace .band[data-name="Footer"] .title p').text('Footer : ' + groupName);
					} else {
						designer.tree.structure.setItemText('_group' + i, 'Group <small class="grouplabel">'+ groupName +'</small>');

						// group header & footer menggunakan nombor
						// kiraan dari atas dan bawah
						var groupHeaderIndex = i + 2;
						var groupFooterindex = totalBand - groupHeaderIndex - 1;
						var bandGroupHeader = $(bands[groupHeaderIndex]);
						var bandGroupFooter = $(bands[groupFooterindex]);

						// header
						var oldGroupHeaderName = bandGroupHeader.attr('data-name');
						bandGroupHeader.attr('data-name', 'Group Header : ' + groupName);
						bandGroupHeader.find('.title p').text('Group Header : ' + groupName);
						designer.details.app.band['Group Header : ' + groupName] = $.extend(true, {}, designer.details.app.band[oldGroupHeaderName]);
						designer.details.app.band['Group Header : ' + groupName].title = 'Group Header : ' + groupName;
						delete designer.details.app.band[oldGroupHeaderName];

						// footer
						var oldGroupFooterName = bandGroupFooter.attr('data-name');
						$(bands[groupFooterindex]).attr('data-name', 'Group Footer : ' + groupName);
						$(bands[groupFooterindex]).find('.title p').text('Group Footer : ' + groupName);
						designer.details.app.band['Group Footer : ' + groupName] = $.extend(true, {}, designer.details.app.band[oldGroupFooterName]);
						designer.details.app.band['Group Footer : ' + groupName].title = 'Group Footer : ' + groupName;
						delete designer.details.app.band[oldGroupFooterName];
					}
				}
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
						text:'<img src="'+ designer.icon.error +'"/><br/>Empty group name!'
					});
					return false;
				}

				// jika nama dah ada
				if (designer.mainQuery.group[newGroupName] !== undefined) {
					dhtmlx.alert({
						title:'Error',
						style:"alert-info",
						text:'<img src="'+ designer.icon.error +'"/><br/>Group name already exist!<br/>Please enter another name.'
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
			designer.currentWindowOpen = null;
			return true;
		});
	};

	Designer.prototype.OpenDataSourceWindow = function(selectItemId) {
		this.DeselectCurrentElement();

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
					<td><input type="text" class="name fullwidth" data-key="name" value=""/></td>\n\
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
					<td colspan="3"><textarea class="query" data-key="query" style="width:97%; height:120px; outline:none; resize:none; font-family:\'Consolas\', monospace;"></textarea></td>\n\
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
					text:'<img style="margin:-4px 4px;" src="'+ designer.icon.error +'"><p>Invalid connection.</p>'
				});
				return false;
			}

			// jika max preview record bukan number
			if (isNaN(max)) {
				dhtmlx.alert({
					title:'Error',
					type:'alert-info',
					text:'<img style="margin:-4px 4px;" src="'+ designer.icon.error +'"><p>Invalid number of max preview records.</p>'
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
					text:'<img style="margin:-4px 4px;" src="'+ designer.icon.error +'"><p>Invalid connection selected. Make sure you<br/>have at least one connection to select.</p>'
				});
				return false;
			}

			if (detail.name === '') {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img style="margin:-4px 4px;" src="'+ designer.icon.error +'"><p>Empty data source name!</p>'
				});
				return false;
			}

			if (detail.query === '') {
				dhtmlx.alert({
					title:'Error',
					style:"alert-info",
					text:'<img style="margin:-4px 4px;" src="'+ designer.icon.error +'"><p>Empty query!</p>'
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
						text:'<img style="margin:-4px 4px;" src="'+ designer.icon.error +'"><p>Data source with name "'+ detail.name +'" already exist.</p>'
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
							text:'<img src="'+ designer.icon.error +'"/><br/>' + response.message
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
						text:'<img src="'+ designer.icon.error +'"/><br/>Fetching failure!'
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
								text:'<img style="margin:-4px 4px;" src="'+ designer.icon.error +'"><p>Data source with name "'+ detail.name +'" already exist.</p>'
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
											text:'<img style="margin:-4px 4px;" src="'+ designer.icon.error +'"><p>Data source with name "'+ detail.name +'" already exist.</p>'
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
											text:'<img src="'+ designer.icon.error +'"/><br/>' + response.message
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
										text:'<img src="'+ designer.icon.error +'"/><br/>Fetching failure!'
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
			designer.currentWindowOpen = null;
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
				{id:2, text:"User Parameter", im0:"paper-plane.png", im1:"paper-plane.png", im2:"paper-plane.png"}/*,
				{id:3, text:"System Parameter", im0:"monitor-window-flow.png", im1:"monitor-window-flow.png", im2:"monitor-window-flow.png"},*/
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
		var properties = '<div id="properties">';

		// element > general
		properties += '\n\
		<table border="0" class="windowForm">\n\
		<col class="label"></col>\n\
		<col></col>\n\
		<tr><td style="padding:0 !important;"></td><td style="padding:0 !important;"></td></tr>\n\
		<tr><th colspan="2">General</th></tr>\n\
		<tr><td>ID</td><td><span class="id"></span></td></tr>\n\
		<tr><td>Type</td><td><span class="type"></span></td></tr>\n\
		<tr><td>Name</td><td><input type="text" class="name fullwidth" data-key="name"/></td></tr>\n\
		<tr><td>Width</td><td><input type="number" min="0" class="width fullwidth" data-key="width"/></td></tr>\n\
		<tr><td>Height</td><td><input type="number" min="0" class="height fullwidth" data-key="height"/></td></tr>\n\
		<tr><td>Left</td><td><input type="number" min="0" class="left fullwidth" data-key="posX"/></td></tr>\n\
		<tr><td>Top</td><td><input type="number" min="0" class="top fullwidth" data-key="posY"/></td></tr>\n\
		';

		// element > label (Content)
		properties += '\n\
		<tbody class="label particular">\n\
		<tr><th colspan="2">Content</th></tr>\n\
		<tr><td>Text</td><td><input type="button" class="text" data-key="text" value="..."/></td></tr>\n\
		<tr><td>HTML</td><td><input type="checkbox" class="ishtml" data-key="ishtml"/></td></tr>\n\
		<tbody>\n\
		';

		// element > field (Content)
		properties += '\n\
		<tbody class="field particular">\n\
		<tr><th colspan="2">Content</th></tr>\n\
		<tr><td>Field</td><td><input type="button" class="source" data-key="source" value="..."/></td></tr>\n\
		<tbody>\n\
		';

		// element > image (Content)
		properties += '\n\
		<tbody class="image particular">\n\
		<tr><th colspan="2">Content</th></tr>\n\
		<tr><td>Source</td><td><input type="text" data-key="imgSource" class="imgSource fullwidth" value=""/></td></tr>\n\
		<tr><td>Dpi</td><td><input type="number" data-key="dpi" class="dpi fullwidth" value="72"/></td></tr>\n\
		<tbody>\n\
		';

		// element > svg (Content)
		properties += '\n\
		<tbody class="svg particular">\n\
		<tr><th colspan="2">Content</th></tr>\n\
		<tr><td>Source</td><td><input type="text" value=""/></td></tr>\n\
		<tbody>\n\
		';

		// element > qrcode (Content)
		properties += '\n\
		<tbody class="qrcode particular">\n\
		<tr><th colspan="2">Content</th></tr>\n\
		<tr><td>Code</td><td><input type="text" value="" class="fullwidth"/></td></tr>\n\
		<tr><td>Bar Type</td>\n\
			<td>\n\
			<select>\n\
			<option>QRCODE, L</option>\n\
			<option>QRCODE, M</option>\n\
			<option>QRCODE, Q</option>\n\
			<option>QRCODE, H</option>\n\
			</select>\n\
			</td></tr>\n\
		<tbody>\n\
		';

		// element > label, field (Appearance)
		properties += '\n\
		<tr><th colspan="2">Appearance</th></tr>\n\
		<tbody class="label field particular">\n\
			<tr><td>Line Height</td><td><input type="number" step="0.1" class="lineHeight fullwidth" data-key="lineHeight"/></td></tr>\n\
			<tr><td>Font Family</td>\n\
				<td>\n\
				<select class="fontFamily" data-key="fontFamily">\n\
				<option value="helvetica">Helvetica</option>\n\
				<option value="times">Times</option>\n\
				<option value="courier">Courier</option>\n\
				</select>\n\
				</td>\n\
			</tr>\n\
			<tr><td>Font Size</td><td><input type="number" min="0" class="fontSize fullwidth" data-key="fontSize"/></td></tr>\n\
			<tr><td>Font Bold</td><td><input type="checkbox" class="fontBold" data-key="fontBold"/></tr>\n\
			<tr><td>Font Italic</td><td><input type="checkbox" class="fontItalic" data-key="fontItalic"/></tr>\n\
			<tr><td>Font Underline</td><td><input type="checkbox" class="fontUnderline" data-key="fontUnderline"/></tr>\n\
			<tr><td>Text Align</td>\n\
				<td>\n\
				<select class="textAlign" data-key="textAlign">\n\
				<option value="left">Left</option>\n\
				<option value="center">Center</option>\n\
				<option value="right">Right</option>\n\
				<option value="justify">Justify</option>\n\
				</select>\n\
				</td>\n\
			</tr>\n\
			<tr><td>Vertical Align</td>\n\
				<td>\n\
				<select class="verticalAlign" data-key="verticalAlign">\n\
				<option value="top">Top</option>\n\
				<option value="middle">Middle</option>\n\
				<option value="bottom">Bottom</option>\n\
				</select>\n\
				</td>\n\
			</tr>\n\
			<tr><td>Text Color</td><td><input type="text" id="textColorPicker" class="textColor fullwidth"/></td></tr>\n\
		</tbody>\n\
		<tr><td>Fill Color</td><td><input type="checkbox" class="fillColorEnable" data-key="fillColorEnable"/><input type="text" id="fillColorPicker" class="fillColor" style="width:60%"/></td></tr>\n\
		<tr><td>Padding</td><td><input type="number" class="padding fullwidth" data-key="padding"/></td></tr>\n\
		';

		// element > label, field (Printing)
		properties += '\n\
		<tbody class="label field particular">\n\
		<tr><th colspan="2">Printing</th></tr>\n\
		<tr><td>Elasticity</td>\n\
			<td>\n\
			<select class="elasticity" data-key="elasticity">\n\
			<option value="fixed">Fixed</option>\n\
			<option value="vertical">Vertical</option>\n\
			<option value="horizontal">Horizontal</option>\n\
			</select>\n\
			</td>\n\
		</tr>\n\
		</tbody>\n\
		';

		// element > all (Border)
		var borderSide = ['All', 'Top', 'Bottom', 'Right', 'Left'];
		properties += '<tbody class="border">';
		for (var s=0; s<borderSide.length; s++) {
			properties += '\n\
			<tr><th colspan="2">Border - '+ borderSide[s] +'</th></tr>\n\
			<tr><td>Enable</td><td><input type="checkbox" data-key="border'+ borderSide[s] +'Enable" class="border'+ borderSide[s] +'Enable"/></td></tr>\n\
			<tr><td>Width</td><td><input type="number" data-key="border'+ borderSide[s] +'Width" class="border'+ borderSide[s] +'Width fullwidth"/></td></tr>\n\
			<tr><td>Style</td>\n\
				<td>\n\
				<select data-key="border'+ borderSide[s] +'Style" class="border'+ borderSide[s] +'Style">\n\
					<option value="solid">Solid</option>\n\
					<option value="dashed">Dashed</option>\n\
					<option value="dotted">Dotted</option>\n\
				</select>\n\
				</td>\n\
			</tr>\n\
			<tr><td>Color</td><td><input type="text" id="border'+ borderSide[s] +'Color" data-key="border'+ borderSide[s] +'Color" class="border'+ borderSide[s] +'Color fullwidth"/></td></tr>\n\
			';
		}
		properties += '</tbody>';

		properties += '</table>';
		properties += '</div>';

		this.propertiesGrid = $(properties);

		// event register, on click
		this.propertiesGrid.find('input[type="button"]').on('click', function(e){
			var button = $(this);
			var propertyKey = $(this).attr('data-key');

			if (propertyKey === 'text') {
				var x = e.pageX - 300;
				var y = e.pageY - 200;
				designer.currentSelectedElement.OpenTextWindow(button, x, y);
			
			} else if (propertyKey === 'source') {
				var x = e.pageX - 300;
				var y = e.pageY - 200;
				designer.currentSelectedElement.OpenSourceFieldWindow(button, x, y);
			}

		});

		// event register, on change (dropdown)
		this.propertiesGrid.find('select').on('change', function(){
			var propertyKey = $(this).attr('data-key');
			var value = $(this).val();

			if (propertyKey === 'fontFamily') {
				designer.currentSelectedElement.elem.find('span.content').css('font-family', value);
				designer.currentSelectedElement.fontFamily = value;
			
			} else if (propertyKey === 'elasticity') {
				designer.currentSelectedElement.elasticity = value;

			} else if (propertyKey === 'borderAllStyle') {
				designer.currentSelectedElement.elem.css('border-style',value);

				designer.propertiesGrid.find('select.borderTopStyle').val(value);
				designer.propertiesGrid.find('select.borderBottomStyle').val(value);
				designer.propertiesGrid.find('select.borderRightStyle').val(value);
				designer.propertiesGrid.find('select.borderLeftStyle').val(value);

				designer.currentSelectedElement.borderAllStyle = value;
				designer.currentSelectedElement.borderTopStyle = value;
				designer.currentSelectedElement.borderBottomStyle = value;
				designer.currentSelectedElement.borderRightStyle = value;
				designer.currentSelectedElement.borderLeftStyle = value;
			
			} else if (propertyKey === 'borderTopStyle') {
				if (!designer.currentSelectedElement.borderAllEnable) {
					designer.currentSelectedElement.elem.css('border-top-style', value);
				}
				designer.currentSelectedElement.borderTopStyle = value;
			
			} else if (propertyKey === 'borderBottomStyle') {
				if (!designer.currentSelectedElement.borderAllEnable) {
					designer.currentSelectedElement.elem.css('border-bottom-style', value);
				}
				designer.currentSelectedElement.borderBottomStyle = value;

			} else if (propertyKey === 'borderRightStyle') {
				if (!designer.currentSelectedElement.borderAllEnable) {
					designer.currentSelectedElement.elem.css('border-right-style', value);
				}
				designer.currentSelectedElement.borderRightStyle = value;

			} else if (propertyKey === 'borderLeftStyle') {
				if (!designer.currentSelectedElement.borderAllEnable) {
					designer.currentSelectedElement.elem.css('border-left-style', value);
				}
				designer.currentSelectedElement.borderLeftStyle = value;

			} else if (propertyKey === 'textAlign') {
				designer.currentSelectedElement.elem.css('text-align', value);
				designer.currentSelectedElement.textAlign = value;
			
			} else if (propertyKey === 'verticalAlign') {
				var content = designer.currentSelectedElement.elem.find('span.content');

				if (value === 'top') {
					content.css({
						'position':'',
						'top':'',
						'bottom':''
					});
				} else if (value === 'middle') {
					var contentHeight = content.height();
					var top = (designer.currentSelectedElement.elem.height() / 2) - (contentHeight / 2);

					// jika ada padding, remove padding atas bawah, kekalkan kiri kanan
					if (designer.currentSelectedElement.padding > 0) {
						content.css('margin', '0 ' + designer.currentSelectedElement.padding + 'px');
					} 

					content.css({
						'position':'absolute',
						'bottom':'',
						'top':top,
						'left':0, 'right':0
					});
				} else if (value === 'bottom') {
					if (designer.currentSelectedElement.padding > 0) {
						content.css('margin', designer.currentSelectedElement.padding + 'px');
					}

					content.css({
						'position':'absolute',
						'top':'',
						'bottom':0,
						'left':0, 'right':0
					});
				}

				designer.currentSelectedElement.verticalAlign = value;
			} 
		});

		// event register, on change (checkbox)
		this.propertiesGrid.find('input[type="checkbox"]').on('change', function(){
			var propertyKey = $(this).attr('data-key');
			var value = $(this).prop('checked');
			
			if (propertyKey === 'ishtml') {
				if (value === true) {
					// convert text kepada html
					designer.currentSelectedElement.elem.find('span.content').html(designer.currentSelectedElement.text);
				} else {
					designer.currentSelectedElement.elem.find('span.content').text(designer.currentSelectedElement.text);
				}		
				designer.currentSelectedElement.isHTML = value;

			} else if (propertyKey === 'fontBold') {
				if (!designer.currentSelectedElement.isHTML && value === true) {
					designer.currentSelectedElement.elem.find('span.content').css('font-weight', 'bold');

				} else if (!designer.currentSelectedElement.isHTML && value === false) {
					designer.currentSelectedElement.elem.find('span.content').css('font-weight', '');
				}
				designer.currentSelectedElement.fontBold = value;

			} else if (propertyKey === 'fontItalic') {
				if (!designer.currentSelectedElement.isHTML && value === true) {
					designer.currentSelectedElement.elem.find('span.content').css('font-style', 'italic');

				} else if (!designer.currentSelectedElement.isHTML && value === false) {
					designer.currentSelectedElement.elem.find('span.content').css('font-style', '');
				}
				designer.currentSelectedElement.fontItalic = value;

			} else if (propertyKey === 'fontUnderline') {
				if (!designer.currentSelectedElement.isHTML && value === true) {
					designer.currentSelectedElement.elem.find('span.content').css('text-decoration', 'underline');

				} else if (!designer.currentSelectedElement.isHTML && value === false) {
					designer.currentSelectedElement.elem.find('span.content').css('text-decoration', '');
				}
				designer.currentSelectedElement.fontUnderline = value;
			
			} else if (propertyKey === 'fillColorEnable') {
				if (value === true) {
					designer.currentSelectedElement.elem.css('background-color', designer.currentSelectedElement.fillColor);
				} else {
					designer.currentSelectedElement.elem.css('background-color', '');
				}
				designer.currentSelectedElement.fillColorEnable = value;
			
			} else if (propertyKey === 'borderAllEnable') {
				if (value === false) {
					designer.currentSelectedElement.elem.css('border','1px dashed #b5b5b5');
				} else {
					designer.currentSelectedElement.elem.css('border', designer.currentSelectedElement.borderAllWidth + 'px '+ designer.currentSelectedElement.borderAllStyle +' '+ designer.currentSelectedElement.borderAllColor);
				}

				designer.propertiesGrid.find('input.borderTopEnable').prop('checked', value);
				designer.propertiesGrid.find('input.borderBottomEnable').prop('checked', value);
				designer.propertiesGrid.find('input.borderRightEnable').prop('checked', value);
				designer.propertiesGrid.find('input.borderLeftEnable').prop('checked', value);

				designer.currentSelectedElement.borderAllEnable = value;
				designer.currentSelectedElement.borderTopEnable = value;
				designer.currentSelectedElement.borderBottomEnable = value;
				designer.currentSelectedElement.borderRightEnable = value;
				designer.currentSelectedElement.borderLeftEnable = value;
			
			} else if (propertyKey === 'borderTopEnable') {
				if (!designer.currentSelectedElement.borderAllEnable) {
					if (value === false) {
						designer.currentSelectedElement.elem.css('border-top', '1px dashed #b5b5b5');
					} else {
						designer.currentSelectedElement.elem.css('border-top', designer.currentSelectedElement.borderTopWidth + 'px '+ designer.currentSelectedElement.borderTopStyle +' '+ designer.currentSelectedElement.borderTopColor);
					}
				}
				designer.currentSelectedElement.borderTopEnable = value;
			
			} else if (propertyKey === 'borderBottomEnable') {
				if (!designer.currentSelectedElement.borderAllEnable) {
					if (value === false) {
						designer.currentSelectedElement.elem.css('border-bottom', '1px dashed #b5b5b5');
					} else {
						designer.currentSelectedElement.elem.css('border-bottom', designer.currentSelectedElement.borderBottomWidth + 'px '+ designer.currentSelectedElement.borderBottomStyle +' '+ designer.currentSelectedElement.borderBottomColor);
					}
				}
				designer.currentSelectedElement.borderBottomEnable = value;

			} else if (propertyKey === 'borderRightEnable') {
				if (!designer.currentSelectedElement.borderAllEnable) {
					if (value === false) {
						designer.currentSelectedElement.elem.css('border-right', '1px dashed #b5b5b5');
					} else {
						designer.currentSelectedElement.elem.css('border-right', designer.currentSelectedElement.borderRightWidth + 'px '+ designer.currentSelectedElement.borderRightStyle +' '+ designer.currentSelectedElement.borderRightColor);
					}
				}
				designer.currentSelectedElement.borderRightEnable = value;

			} else if (propertyKey === 'borderLeftEnable') {
				if (!designer.currentSelectedElement.borderAllEnable) {
					if (value === false) {
						designer.currentSelectedElement.elem.css('border-left', '1px dashed #b5b5b5');
					} else {
						designer.currentSelectedElement.elem.css('border-left', designer.currentSelectedElement.borderLeftWidth + 'px '+ designer.currentSelectedElement.borderLeftStyle +' '+ designer.currentSelectedElement.borderLeftColor);
					}
				}
				designer.currentSelectedElement.borderLeftEnable = value;
			}
		});

		// event register, on change (number)
		this.propertiesGrid.find('input[type="number"]').on('change', function(){
			var propertyKey = $(this).attr('data-key');
			var value = $(this).val();

			if (value !== '') {

				value = Number(value);

				if (propertyKey === 'width') {
					designer.currentSelectedElement.elem.css('width', value);
					designer.currentSelectedElement.width = value;

				} else if (propertyKey === 'height') {
					designer.currentSelectedElement.elem.css('height', value);
					designer.currentSelectedElement.height = value;

				} else if (propertyKey === 'posX') {
					designer.currentSelectedElement.elem.css('left', value + 'px');
					designer.currentSelectedElement.posX = value;

				} else if (propertyKey === 'posY') {
					designer.currentSelectedElement.elem.css('top', value + 'px');
					designer.currentSelectedElement.posY = value;

				} else if (propertyKey === 'lineHeight') {
					designer.currentSelectedElement.elem.find('span.content').css('line-height', (value * 12)+'px');
					designer.currentSelectedElement.lineHeight = value;

				} else if (propertyKey === 'fontSize') {
					designer.currentSelectedElement.elem.find('span.content').css('font-size', value+'px');
					designer.currentSelectedElement.fontSize = value;
				
				} else if (propertyKey === 'padding') {
					if (designer.currentSelectedElement.verticalAlign === 'top' || designer.currentSelectedElement.verticalAlign === 'bottom') {
						designer.currentSelectedElement.elem.find('span.content').css('margin', value+'px');
					} else if (designer.currentSelectedElement.verticalAlign === 'middle') {
						designer.currentSelectedElement.elem.find('span.content').css('margin', '0 ' + value + 'px');
					}

					designer.currentSelectedElement.padding = value;
				
				} else if (propertyKey === 'borderAllWidth') {
					designer.currentSelectedElement.elem.css('border-width', value + 'px');

					designer.propertiesGrid.find('input.borderTopWidth').val(value);
					designer.propertiesGrid.find('input.borderBottomWidth').val(value);
					designer.propertiesGrid.find('input.borderRightWidth').val(value);
					designer.propertiesGrid.find('input.borderLeftWidth').val(value);

					designer.currentSelectedElement.borderAllWidth = value;
					designer.currentSelectedElement.borderTopWidth = value;
					designer.currentSelectedElement.borderBottomWidth = value;
					designer.currentSelectedElement.borderRightWidth = value;
					designer.currentSelectedElement.borderLeftWidth = value;
				
				} else if (propertyKey === 'borderTopWidth') {
					if (!designer.currentSelectedElement.borderAllEnable) {
						designer.currentSelectedElement.elem.css('border-top-width', value + 'px');
					}
					designer.currentSelectedElement.borderTopWidth = value;

				} else if (propertyKey === 'borderBottomWidth') {
					if (!designer.currentSelectedElement.borderAllEnable) {
						designer.currentSelectedElement.elem.css('border-bottom-width', value + 'px');
					}
					designer.currentSelectedElement.borderBottomWidth = value;

				} else if (propertyKey === 'borderRightWidth') {
					if (!designer.currentSelectedElement.borderAllEnable) {
						designer.currentSelectedElement.elem.css('border-right-width', value + 'px');
					}
					designer.currentSelectedElement.borderRightWidth = value;

				} else if (propertyKey === 'borderLeftWidth') {
					if (!designer.currentSelectedElement.borderAllEnable) {
						designer.currentSelectedElement.elem.css('border-left-width', value + 'px');
					}
					designer.currentSelectedElement.borderLeftWidth = value;
				}
			}

		});

		// event register, on blur
		this.propertiesGrid.find('input[type="text"], input[type="number"]').on('blur', function(){
			var propertyKey = $(this).attr('data-key');
			var type = $(this).attr('type');
			var value = $(this).val();

			// jika ruang nombor, tapi masuk selain nombor
			if (type === 'number' && value === '') {
				$(this).val(designer.currentSelectedElement[propertyKey]);
			}
			else if (type === 'number' && value !== '') {
				value = Number(value);
				
				if (propertyKey === 'width') {
					designer.currentSelectedElement.elem.css('width', value);
					designer.currentSelectedElement.width = value;

				} else if (propertyKey === 'height') {
					designer.currentSelectedElement.elem.css('height', value);
					designer.currentSelectedElement.height = value;

				} else if (propertyKey === 'posX') {
					designer.currentSelectedElement.elem.css('left', value + 'px');
					designer.currentSelectedElement.posX = value;

				} else if (propertyKey === 'posY') {
					designer.currentSelectedElement.elem.css('top', value + 'px');
					designer.currentSelectedElement.posY = value;

				} else if (propertyKey === 'lineHeight') {
					designer.currentSelectedElement.elem.find('span.content').css('line-height', (value * 12)+'px');
					designer.currentSelectedElement.lineHeight = value;
					
				} else if (propertyKey === 'fontSize') {
					designer.currentSelectedElement.elem.find('span.content').css('font-size', value+'px');
					designer.currentSelectedElement.fontSize = value;
				
				} else if (propertyKey === 'padding') {
					if (designer.currentSelectedElement.verticalAlign === 'top' || designer.currentSelectedElement.verticalAlign === 'bottom') {
						designer.currentSelectedElement.elem.find('span.content').css('margin', value+'px');
					} else if (designer.currentSelectedElement.verticalAlign === 'middle') {
						designer.currentSelectedElement.elem.find('span.content').css('margin', '0 ' + value + 'px');
					}

					designer.currentSelectedElement.padding = value;

				} else if (propertyKey === 'borderAllWidth') {
					designer.currentSelectedElement.elem.css('border-width', value + 'px');

					designer.propertiesGrid.find('input.borderTopWidth').val(value);
					designer.propertiesGrid.find('input.borderBottomWidth').val(value);
					designer.propertiesGrid.find('input.borderRightWidth').val(value);
					designer.propertiesGrid.find('input.borderLeftWidth').val(value);

					designer.currentSelectedElement.borderAllWidth = value;
					designer.currentSelectedElement.borderTopWidth = value;
					designer.currentSelectedElement.borderBottomWidth = value;
					designer.currentSelectedElement.borderRightWidth = value;
					designer.currentSelectedElement.borderLeftWidth = value;
				
				} else if (propertyKey === 'borderTopWidth') {
					if (!designer.currentSelectedElement.borderAllEnable) {
						designer.currentSelectedElement.elem.css('border-top-width', value + 'px');
					}
					designer.currentSelectedElement.borderTopWidth = value;

				} else if (propertyKey === 'borderBottomWidth') {
					if (!designer.currentSelectedElement.borderAllEnable) {
						designer.currentSelectedElement.elem.css('border-bottom-width', value + 'px');
					}
					designer.currentSelectedElement.borderBottomWidth = value;

				} else if (propertyKey === 'borderRightWidth') {
					if (!designer.currentSelectedElement.borderAllEnable) {
						designer.currentSelectedElement.elem.css('border-right-width', value + 'px');
					}
					designer.currentSelectedElement.borderRightWidth = value;

				} else if (propertyKey === 'borderLeftWidth') {
					if (!designer.currentSelectedElement.borderAllEnable) {
						designer.currentSelectedElement.elem.css('border-left-width', value + 'px');
					}
					designer.currentSelectedElement.borderLeftWidth = value;
				}
			}
			else if (type === 'text') {
				if (designer.currentSelectedElement[propertyKey] !== undefined) designer.currentSelectedElement[propertyKey] = value;
			}
		});

		this.layout.cells('d').attachObject(this.propertiesGrid[0]);
		this.propertiesGrid.hide();

		$(this.layout.cells('d').cell).on('click', function(e){
			e.stopPropagation();
		});

		// color picker init (text color)
		var textColorPicker = new dhtmlXColorPicker();
		textColorPicker.linkTo('textColorPicker');
		textColorPicker.attachEvent('onHide', function(color){
			var color = textColorPicker.getSelectedColor()[0];
			$('#textColorPicker').css('color', (designer.GetColorLightOrDark(color) === 'dark' ? '#fff' : '#333'));

			designer.currentSelectedElement.elem.find('span.content').css('color',color);

			// #setter
			designer.currentSelectedElement.textColor = color;
		});
		$(textColorPicker._globalNode).on('click', function(e){ e.stopPropagation(); });

		// color picker init (fill color)
		var fillColorPicker = new dhtmlXColorPicker();
		fillColorPicker.linkTo('fillColorPicker');
		fillColorPicker.attachEvent('onHide', function(color){
			var color = fillColorPicker.getSelectedColor()[0];
			$('#fillColorPicker').css('color', (designer.GetColorLightOrDark(color) === 'dark' ? '#fff' : '#333'));

			if (designer.currentSelectedElement.fillColorEnable) {
				designer.currentSelectedElement.elem.css('background-color',color);
			}

			// #setter
			designer.currentSelectedElement.fillColor = color;
		});
		$(fillColorPicker._globalNode).on('click', function(e){ e.stopPropagation(); });

		// border all color pickers
		var borderAllColorPicker = new dhtmlXColorPicker();
		borderAllColorPicker.linkTo('borderAllColor');
		borderAllColorPicker.attachEvent('onHide', function(){
			var color = borderAllColorPicker.getSelectedColor()[0];
			$('#borderAllColor').css('color', (designer.GetColorLightOrDark(color) === 'dark' ? '#fff' : '#333'));

			designer.currentSelectedElement.elem.css('border-color', color);

			//apply pada semua
			$('#borderTopColor').val(color).css('background-color', color);
			$('#borderBottomColor').val(color).css('background-color', color);
			$('#borderRightColor').val(color).css('background-color', color);
			$('#borderLeftColor').val(color).css('background-color', color);

			designer.currentSelectedElement.borderAllColor = color;
			designer.currentSelectedElement.borderTopColor = color;
			designer.currentSelectedElement.borderBottomColor = color;
			designer.currentSelectedElement.borderRightColor = color;
			designer.currentSelectedElement.borderLeftColor = color;
		});
		$(borderAllColorPicker._globalNode).on('click', function(e){ e.stopPropagation(); });

		// border top color pickers
		var borderTopColorPicker = new dhtmlXColorPicker();
		borderTopColorPicker.linkTo('borderTopColor');
		borderTopColorPicker.attachEvent('onHide', function(){
			var color = borderTopColorPicker.getSelectedColor()[0];

			if (!designer.currentSelectedElement.borderAllEnable) {
				designer.currentSelectedElement.elem.css('border-top-color', color);	
			}

			$('#borderTopColor').css('color', (designer.GetColorLightOrDark(color) === 'dark' ? '#fff' : '#333'));
			designer.currentSelectedElement.borderTopColor = color;
		});
		$(borderTopColorPicker._globalNode).on('click', function(e){ e.stopPropagation(); });

		// border bottom color pickers
		var borderBottomColorPicker = new dhtmlXColorPicker();
		borderBottomColorPicker.linkTo('borderBottomColor');
		borderBottomColorPicker.attachEvent('onHide', function(){
			var color = borderBottomColorPicker.getSelectedColor()[0];

			if (!designer.currentSelectedElement.borderAllEnable) {
				designer.currentSelectedElement.elem.css('border-bottom-color', color);	
			}

			$('#borderBottomColor').css('color', (designer.GetColorLightOrDark(color) === 'dark' ? '#fff' : '#333'));
			designer.currentSelectedElement.borderBottomColor = color;
		});
		$(borderBottomColorPicker._globalNode).on('click', function(e){ e.stopPropagation(); });

		// border right color pickers
		var borderRightColorPicker = new dhtmlXColorPicker();
		borderRightColorPicker.linkTo('borderRightColor');
		borderRightColorPicker.attachEvent('onHide', function(){
			var color = borderRightColorPicker.getSelectedColor()[0];

			if (!designer.currentSelectedElement.borderAllEnable) {
				designer.currentSelectedElement.elem.css('border-right-color', color);	
			}

			$('#borderRightColor').css('color', (designer.GetColorLightOrDark(color) === 'dark' ? '#fff' : '#333'));
			designer.currentSelectedElement.borderRightColor = color;
		});
		$(borderRightColorPicker._globalNode).on('click', function(e){ e.stopPropagation(); });

		// border left color pickers
		var borderLeftColorPicker = new dhtmlXColorPicker();
		borderLeftColorPicker.linkTo('borderLeftColor');
		borderLeftColorPicker.attachEvent('onHide', function(){
			var color = borderLeftColorPicker.getSelectedColor()[0];

			if (!designer.currentSelectedElement.borderAllEnable) {
				designer.currentSelectedElement.elem.css('border-left-color', color);	
			}

			$('#borderLeftColor').css('color', (designer.GetColorLightOrDark(color) === 'dark' ? '#fff' : '#333'));
			designer.currentSelectedElement.borderLeftColor = color;
		});
		$(borderLeftColorPicker._globalNode).on('click', function(e){ e.stopPropagation(); });
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

		// element object creation
		var object;

		// proper type name
		type = type.replace(' ','');

		if (type === 'label') {
			object = new Label();
		} else if (type === 'field') {
			object = new Field();
		} else if (type === 'rectangle') {
			object = new Rectangle();
		} else if (type === 'image') {
			object = new Image();
		} else if (type === 'svg') {
			object = new Svg();
		} else if (type === 'qrcode') {
			object = new QRCode();
		} else if (type === 'barcode') {
			object = new Barcode();
		}

		object.parentBand = band;
		object.SetPosition(posX, posY);
		object.Draw(targetArea);
		object.ApplyDrag();
		object.ApplyResize();
		object.RegisterTree();
		object.Select();
		object.AttachToParent();
		object.UpdatePosition();

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

	Designer.prototype.GoBackHomeWithError = function() {
		window.location.href = '../?error=permission&page=designer';
	};

	Designer.prototype.GoBackHome = function() {
		window.location.href = '../';
	};

	Designer.prototype.DeselectCurrentElement = function() {
		if (this.currentSelectedElement !== null) {
			this.currentSelectedElement.Deselect();
		}
	};

	Designer.prototype.Refresh = function() {
		this.layout.cells('a').setWidth(230);
		this.layout.cells('c').setWidth(230);
		this.layout.cells('c').setHeight(200);
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
		
		this.currentWindowOpen = parameterWin;

		// generate report details
		this.GenerateReportDetails();

		parameterWin.attachURL(this.phpPath + 'designer.preview.php', null, {data:JSON.stringify(this.details.report) });

		parameterWin.attachEvent('onClose', function(){
			designer.currentWindowOpen = null;
			return true;
		});
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
					group : this.details.app.dataSource[dataSourceName].group,
					type : this.details.app.dataSource[dataSourceName].type
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

			// remove nama group dari band title
			//band.title = band.title.split(':')[0].trim();
			
			// declare
			designer.details.report.layout.band[bandName] = {
				title:band.title,
				treeId:band.treeStructureId,
				height:band.height,
				minHeight:band.minHeight,
				width:band.width,
				element:[]
			};

			// proses setiap element yang ada dalam band
			// kecuali element 'undefined' yang telah diremove (deleted = true)
			for (var i=0; i<band.element.length; i++) {
				if (!band.element[i].deleted) {
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
					delete element.propertiesItems;

					designer.details.report.layout.band[bandName].element.push(element);
				}
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

	Designer.prototype.Save = function(callback) {
		this.statusBar.setText('Saving....');
		this.GenerateReportDetails();

		var phpPath = this.phpPath;
		var content = JSON.stringify(this.details.report);

		$.ajax({
			url:phpPath + 'designer.save.php',
			data:{content:content},
			type:'post',
			dataType:'json'
		})
		.done(function(response){
			designer.statusBar.setText('');

			if (response.status === 0) {
				dhtmlx.alert({
					title:'Save Error',
					style:'alert-info',
					text:'<img src="'+ designer.icon.error +'"/><br/>' + response.message
				});
				return false;
			}
			else if (response.status === 1) {
				designer.statusBar.setText(response.message);
				setTimeout(function(){
					designer.statusBar.setText('');
				}, 1200);
			}

			if (callback) callback();
		});
	};

	Designer.prototype.SaveToLocal = function() {
		designer.Save(function(){
			$('iframe#savetolocal').attr('src', designer.phpPath + 'designer.savetolocal.php?file=' + designer.details.report.general.name + '&id=' + designer.sessionId);
			setTimeout(function(){
				$('iframe#savetolocal').attr('src','');
			}, 3000);
		});
	};

	Designer.prototype.Open = function(){
		var iframe = $('<iframe style="display:none" name="openFile" src=""></iframe>');
		var form = $('<form style="display:none" method="post" enctype="multipart/form-data" action="'+ this.phpPath + 'designer.open.php' +'" target="openFile"></form>');
		var inputUpload = $('<input name="source" type="file"/>');
		inputUpload.appendTo(form);
		iframe.appendTo('body');
		form.appendTo('body');

		inputUpload.on('change', function(){
			form.submit();
		});

		iframe.on('load', function(){
			var content = $(this).contents().find('#loadedContent').text();
			if (content) {
				content = JSON.parse(content);
				designer.ApplyLoadedData(content);
				form.remove();
				iframe.remove();
			}
		});

		inputUpload.click();
	};

	Designer.prototype.ApplyLoadedData = function(source) {
		// reset details
		this.details = {};
		this.InitDetails();

		// preferences
		this.details.app.general.author = source.general.author;
		this.details.app.general.reportTitle = source.general.name;
		this.details.app.format.orientation = source.layout.general.orientation;
		this.details.app.format.paper = source.layout.general.format;
		this.details.app.margin.top = source.layout.general.margin.top;
		this.details.app.margin.bottom = source.layout.general.margin.bottom;
		this.details.app.margin.right = source.layout.general.margin.right;
		this.details.app.margin.left = source.layout.general.margin.left;
		this.details.app.margin.footer = source.layout.general.margin.footer;

		// connection
		for (var connectionName in source.data.connection) {
			this.details.app.connection[connectionName] = $.extend(true, {}, source.data.connection[connectionName]);
			this.tree.data.insertNewItem(4, '4:::' + connectionName, connectionName, null, 'document.png', 'document.png', 'document.png'); // letak prefix parent id
		}

		// data source
		for (var dataSourceName in source.data.query) {
			this.details.app.dataSource[dataSourceName] = {
				name : dataSourceName,
				connection : source.data.query[dataSourceName].connection,
				group : $.extend(true, {}, source.data.query[dataSourceName].group),
				main : source.data.query[dataSourceName].main,
				type : source.data.query[dataSourceName].type,
				query : source.data.query[dataSourceName].sql
			};

			if (source.data.query[dataSourceName].main) this.mainQuery = this.details.app.dataSource[dataSourceName];
			this.tree.data.insertNewItem(1, '1:::' + dataSourceName, dataSourceName, null, 'document.png', 'document.png', 'document.png');
		}

		// apply group name pada tree structure
		if (this.mainQuery) {
			var groups = Object.keys(this.mainQuery.group);

			for (var i=0; i < groups.length; i++) {
				var groupName = groups[i];

				if (i === 0) {
					this.tree.structure.setItemText('header', 'Header <small class="grouplabel">'+ groupName +'</small>');
					this.tree.structure.setItemText('footer', 'Footer <small class="grouplabel">'+ groupName +'</small>');
				} else if (i === 1) {
					this.tree.structure.insertNewNext('header', '_group' + i, 'Group <small class="grouplabel">'+ groupName +'</small>', null, 'zones-stack.png', 'zones-stack.png', 'zones-stack.png');
					this.tree.structure.insertNewChild('_group' + i, 'groupHeader' + i, 'Group Header', null, 'zone.png', 'zone.png', 'zone.png');
					this.tree.structure.moveItem('detail', 'item_child', '_group' + i);
					this.tree.structure.insertNewChild('_group' + i, 'groupFooter' + i, 'Group Footer', null, 'zone.png', 'zone.png', 'zone.png');
				} else {
					this.tree.structure.insertNewNext('groupHeader' + (i-1), '_group' + i, 'Group <small class="grouplabel">'+ groupName +'</small>', null, 'zones-stack.png', 'zones-stack.png', 'zones-stack.png');
					this.tree.structure.insertNewChild('_group' + i, 'groupHeader' + i, 'Group Header', null, 'zone.png', 'zone.png', 'zone.png');
					this.tree.structure.moveItem('detail', 'item_child', '_group' + i);
					this.tree.structure.insertNewChild('_group' + i, 'groupFooter' + i, 'Group Footer', null, 'zone.png', 'zone.png', 'zone.png');
				}
			}
		}

		var workspace = $('#workspace');
		var properties = $('#properties');
		var inputWidth = properties.find('input.width');
		var inputHeight = properties.find('input.height');
		var inputName = properties.find('input.name');
		var inputLeft = properties.find('input.left');
		var inputTop = properties.find('input.top');
		var inputIsHTML = properties.find('input.ishtml');
		var inputLineHeight = properties.find('input.lineHeight');
		var selectFontFamily = properties.find('select.fontFamily');
		var inputFontSize = properties.find('input.fontSize');
		var inputFontBold = properties.find('input.fontBold');
		var inputFontItalic = properties.find('input.fontItalic');
		var inputFontUnderline = properties.find('input.fontUnderline');
		var selectTextAlign = properties.find('select.textAlign');
		var selectVerticalAlign = properties.find('select.verticalAlign');
		var inputTextColor = properties.find('input.textColor');
		var inputFillColorEnable = properties.find('input.fillColorEnable');
		var inputFillColor = properties.find('input.fillColor');
		var inputPadding = properties.find('input.padding');
		var selectElasticity = properties.find('select.elasticity');
		
		var inputBorderAllEnable = properties.find('input.borderAllEnable');
		var inputBorderAllWidth = properties.find('input.borderAllWidth');
		var selectBorderAllStyle = properties.find('select.borderAllStyle');
		var inputBorderAllColor = properties.find('input.borderAllColor');

		var inputBorderTopEnable = properties.find('input.borderTopEnable');
		var inputBorderTopWidth = properties.find('input.borderTopWidth');
		var selectBorderTopStyle = properties.find('select.borderTopStyle');
		var inputBorderTopColor = properties.find('input.borderTopColor');

		var inputBorderBottomEnable = properties.find('input.borderBottomEnable');
		var inputBorderBottomWidth = properties.find('input.borderBottomWidth');
		var selectBorderBottomStyle = properties.find('select.borderBottomStyle');
		var inputBorderBottomColor = properties.find('input.borderBottomColor');

		var inputBorderRightEnable = properties.find('input.borderRightEnable');
		var inputBorderRightWidth = properties.find('input.borderRightWidth');
		var selectBorderRightStyle = properties.find('select.borderRightStyle');
		var inputBorderRightColor = properties.find('input.borderRightColor');

		var inputBorderLeftEnable = properties.find('input.borderLeftEnable');
		var inputBorderLeftWidth = properties.find('input.borderLeftWidth');
		var selectBorderLeftStyle = properties.find('select.borderLeftStyle');
		var inputBorderLeftColor = properties.find('input.borderLeftColor');

		// clear all band
		workspace.empty();
		this.details.app.band = {};

		// band loading
		for (var bandName in source.layout.band) {
			var band = new Band({title : source.layout.band[bandName].title});
			band.elem.appendTo(workspace);
			band.RegisterTreeId(source.layout.band[bandName].treeId);
			band.ApplyResize();
			band.height = source.layout.band[bandName].height;

			// ubah title untuk header dan footer
			if (bandName === 'header') {
				band.elem.find('.title p').text('Header : ' + Object.keys(this.mainQuery.group)[0]);
			} else if (bandName === 'footer') {
				band.elem.find('.title p').text('Footer : ' + Object.keys(this.mainQuery.group)[0]);
			}
			
			var area = band.elem.find('.area');
			area.height(band.height);

			// apply droppable
			area.droppable({
				accept : '.standartTreeRow',
				hoverClass : 'hoverDrop',
				drop : function(event, ui){
					designer.DeselectCurrentElement();
					designer.DrawElement(event, ui);
				}
			});

			// element
			for (var i=0; i<source.layout.band[bandName].element.length; i++) {
				var element = source.layout.band[bandName].element[i];
				var object;

				if (element.type === 'label') {
					object = new Label();
				} else if (element.type === 'field') {
					object = new Field();
				} else if (element.type === 'rectangle') {
					object = new Rectangle();
				} else if (element.type === 'image') {
					object = new Image();
				} else if (element.type === 'svg') {
					object = new Svg();
				} else if (element.type === 'qrcode') {
					object = new QRCode();
				} else if (element.type === 'barcode') {
					object = new Barcode();
				}

				object.parentBand = band;
				object.SetPosition(element.posX, element.posY);
				object.Draw(area);
				object.ApplyDrag();
				object.ApplyResize();
				object.RegisterTree();
				object.AttachToParent();
				object.UpdatePosition();

				this.currentSelectedElement = object;

				if (object.type === 'label') {
					inputIsHTML.prop('checked', element.isHTML).change();
					object.ApplyText(element.text);
				}
				else if (object.type === 'field') {
					object.source = element.source;
					object.elem.find('span.content').text(object.source);
				}

				inputName.val(element.name).blur();
				inputWidth.val(element.width * 3).change();
				inputHeight.val(element.height * 3).change();
				inputLeft.val(element.posX * 3).change();
				inputTop.val(element.posY * 3).change();
				inputLineHeight.val(element.lineHeight).change();
				selectFontFamily.val(element.fontFamily).change();
				inputFontSize.val(element.fontSize).change();
				inputFontBold.prop('checked', element.fontBold).change();
				inputFontItalic.prop('checked', element.fontItalic).change();
				inputFontUnderline.prop('checked', element.fontUnderline).change();
				selectTextAlign.val(element.textAlign).change();
				selectVerticalAlign.val(element.verticalAlign).change();
				inputTextColor.val(element.textColor).change();
				inputFillColorEnable.prop('checked', element.fillColorEnable).change();
				inputFillColor.val(element.fillColor).change();
				inputPadding.val(element.padding).change();
				selectElasticity.val(element.elasticity).change();

				inputBorderAllEnable.prop('checked', element.borderAllEnable).change();
				inputBorderAllWidth.val(element.borderAllWidth).change();
				selectBorderAllStyle.val(element.borderAllStyle).change();
				inputBorderAllColor.val(element.borderAllColor).change();
				if (!element.borderAllEnable) object.elem.css('border-style','dashed');
				
				inputBorderTopEnable.prop('checked', element.borderTopEnable).change();
				inputBorderTopWidth.val(element.borderTopWidth).change();
				selectBorderTopStyle.val(element.borderTopStyle).change();
				inputBorderTopColor.val(element.borderTopColor).change();
				if (!element.borderTopEnable) object.elem.css('border-top-style','dashed');
				
				inputBorderBottomEnable.prop('checked', element.borderBottomEnable).change();
				inputBorderBottomWidth.val(element.borderBottomWidth).change();
				selectBorderBottomStyle.val(element.borderBottomStyle).change();
				inputBorderBottomColor.val(element.borderBottomColor).change();
				if (!element.borderBottomEnable) object.elem.css('border-bottom-style','dashed');
				
				inputBorderRightEnable.prop('checked', element.borderRightEnable).change();
				inputBorderRightWidth.val(element.borderRightWidth).change();
				selectBorderRightStyle.val(element.borderRightStyle).change();
				inputBorderRightColor.val(element.borderRightColor).change();
				if (!element.borderRightEnable) object.elem.css('border-right-style','dashed');
				
				inputBorderLeftEnable.prop('checked', element.borderLeftEnable).change();
				inputBorderLeftWidth.val(element.borderLeftWidth).change();
				selectBorderLeftStyle.val(element.borderLeftStyle).change();
				inputBorderLeftColor.val(element.borderLeftColor).change();
				if (!element.borderLeftEnable) object.elem.css('border-left-style','dashed');
			}

			this.details.app.band[source.layout.band[bandName].title] = band;
		}

		this.currentSelectedElement = null;
		this.tree.structure.clearSelection();		

		// views :
		// tree structure
		// tree data
		// band width
		// band available
	};

	Designer.prototype.DeleteElement = function(){
		// buang elem view
		this.currentSelectedElement.elem.hide();		

		// buang dari tree structure
		this.tree.structure.deleteItem(this.currentSelectedElement.id);

		// buang dari parent children
		var index = this.currentSelectedElement.elem.attr('data-index');
		//delete this.currentSelectedElement.parentBand.element[index];
		this.currentSelectedElement.parentBand.element[index].deleted = true;

		// save history
		this.SaveHistory({
			action : 'delete',
			element : this.currentSelectedElement.parentBand.element[index],
			band : null
		});

		this.DeselectCurrentElement();

		// resetkan current selected element
		this.currentSelectedElement = null;
	};

	Designer.prototype.SaveHistory = function(detail) {
		// action : move, delete, resize, cut
		// element : element yang terlibat

		// maksimum 6. kalau dah sampai limit, buang yang first, anjak ke depan
		if (this.actionHistory.length === 6) {
			this.actionHistory.splice(0,1);
		}

		this.actionHistory.push({
			action : detail.action,
			element : detail.element,
			band : detail.band
		});

		this.actionHistoryCursor += 1;
		if (this.actionHistoryCursor > 6) this.actionHistoryCursor = 6;
	};

	Designer.prototype.Undo = function(){
		//var lastAction = this.actionHistory[this.actionHistory.length - 1];

		if (this.actionHistoryCursor > -1) {
			var detail = this.actionHistory[this.actionHistoryCursor];
			var actionCommited = detail.action;
			
			if (actionCommited === 'delete' && detail.element !== null) {
				var index = detail.element.elem.attr('data-index');
				detail.element.elem.show();
				detail.element.parentBand.element[index].deleted = false;
				this.DeselectCurrentElement();
				this.currentSelectedElement = detail.element.parentBand.element[index];
				this.currentSelectedElement.Select();
				this.actionHistoryCursor -= 1;
			}

			if (this.actionHistoryCursor < -1) this.actionHistoryCursor = -1;
		}
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
		// open
		Mousetrap.bind(['command+o', 'ctrl+o'], function(event){
			event.preventDefault();
			designer.Open();
		});

		// save
		Mousetrap.bind(['command+s', 'ctrl+s'], function(event){
			event.preventDefault();
			designer.Save();
		});

		// save to local
		Mousetrap.bind(['command+shift+s', 'ctrl+shift+s'], function(event){
			event.preventDefault();
			designer.SaveToLocal();
		});

		// delete
		Mousetrap.bind(['backspace', 'delete'], function(event){
			event.preventDefault();
			if (designer.currentSelectedElement !== null) {
				designer.DeleteElement();
			}
		});

		// delete
		Mousetrap.bind(['command+r', 'ctrl+r'], function(event){
			event.preventDefault();
			designer.Refresh();
		});

		// preview
		Mousetrap.bind(['command+p', 'ctrl+p'], function(event){
			event.preventDefault();
			designer.Preview();
		});

		// escape
		Mousetrap.bind('esc', function(event){
			event.preventDefault();
			if (designer.currentWindowOpen !== null) designer.currentWindowOpen.close();
		});		

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

		// jika semasa labelText sedang dibuka
		if (designer.currentWindowOpen !== null && designer.currentWindowOpen.getId() === 'labelText') {
			designer.currentWindowOpen.close();

		// jika semasa sourceField sedang dibuka
		} else if (designer.currentWindowOpen !== null && designer.currentWindowOpen.getId() === 'sourceField') {
			designer.currentWindowOpen.close();

		// normal
		} else {
			designer.tree.structure.clearSelection();
			designer.tree.element.clearSelection();
			designer.tree.data.clearSelection();
			designer.DeselectCurrentElement();
		}
	});

	$('body').on('click', 'td.standartTreeRow', function(e){
		e.stopPropagation();
	});

	Designer.prototype.LoadView = function(viewId, name) {
		if (viewId === 'connectionEdit') {
			var conn = designer.details.app.connection[name];
			var data = {
				connectionName : conn.name,
				connecitonHost : conn.host,
				connectionUser : conn.user,
				connectionPass : conn.pass,
				connectionDbName : conn.dbname,
				connectionPort : conn.port,
				connectionSid : conn.sid,
				connectionServiceName : conn.serviceName,
				connectionSocket : conn.socket,
				connectionType : conn.type
			};
			return designer._ReplaceVariableView(designer.view[viewId], data);

		} else if (viewId === 'preferencesGeneral') {
			var data = {
				author : designer.details.app.general.author,
				reportTitle : designer.details.app.general.reportTitle
			};
			return designer._ReplaceVariableView(designer.view[viewId], data);

		} else if (viewId === 'preferencesFormat') {
			var data = {
				paper : designer.details.app.format.paper,
				orientation : designer.details.app.format.orientation
			};
			return designer._ReplaceVariableView(designer.view[viewId], data);

		} else if (viewId === 'preferencesMargin') {
			var data = {
				top : this.details.app.margin.top,
				left : this.details.app.margin.left,
				right : this.details.app.margin.right,
				bottom : this.details.app.margin.bottom,
				footer : this.details.app.margin.footer
			};
			return designer._ReplaceVariableView(designer.view[viewId], data);

		} else if (viewId === 'groupInfo') {
			var data = {
				connection : this.mainQuery.connection,
				queryName : this.mainQuery.name
			};
			return designer._ReplaceVariableView(designer.view[viewId], data);

		} else {
			return designer.view[viewId];
		}
	};

	Designer.prototype._ReplaceVariableView = function(view, variables) {
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

	// http://davidwalsh.name/caret-end
	Designer.prototype.moveCursorToEnd = function(el){
		if (typeof el.selectionStart == "number") {
			el.selectionStart = el.selectionEnd = el.value.length;
		} else if (typeof el.createTextRange != "undefined") {
			el.focus();
			var range = el.createTextRange();
			range.collapse(false);
			range.select();
		}
	};

	// Array Remove - By John Resig (MIT Licensed)
	Designer.prototype.RemoveFromArray = function(array, from, to) {
		var rest = array.slice((to || from) + 1 || array.length);
		array.length = from < 0 ? array.length + from : from;
		return array.push.apply(array, rest);
	};

	// detect light vs dark color
	Designer.prototype.GetColorLightOrDark = function(c){
		var c = c.substring(1);      // strip #
		var rgb = parseInt(c, 16);   // convert rrggbb to decimal
		var r = (rgb >> 16) & 0xff;  // extract red
		var g = (rgb >>  8) & 0xff;  // extract green
		var b = (rgb >>  0) & 0xff;  // extract blue

		var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

		if (luma > 150) return 'light';
		if (luma > 145) return 'light';

		return (luma > 150) ? 'light' : 'dark';
	};
}