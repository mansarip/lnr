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
	this.parameterListGrid;
	this.parameterStatusBarBottom;

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
				"Report Header" : {},
				"Page Header" : {},
				"Header" : {},
				"Detail" : {},
				"Footer" : {},
				"Page Footer" : {},
				"Report Footer" : {}
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
			connection : {}
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
					unit:"mm",
					format:"A4",
					orientation:"L",
					margin:{
						top:5,
						bottom:20,
						left:5,
						right:5,
						footer:5
					}
				},
				band:{
					reportHeader:{ element:[] },
					pageHeader:{ element:[] },
					header:{ element:[] },
					detail:{ element:[] },
					footer:{ element:[] },
					pageFooter:{ element:[] },
					reportFooter:{ element:[] }
				}
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

		// init structure tree
		this.InitStructureTree();

		// init data tree
		this.InitDataTree();

		// init element tree
		this.InitElementTree();

		// init workspace
		this.InitWorkspace();
	};

	Designer.prototype.InitMainToolbar = function() {
		var defaultButton = [
			// general
			{id:1, type:"button", text:"New", img:"document.png"},
			{id:2, type:"button", text:"Open", img:"folder-horizontal-open.png"},
			{id:3, type:"button", text:"Save", img:"disk-return-black.png"},
			{id:4, type:"separator"},

			// settings
			{id:11, type:"button", text:"Preferences", img:"gear.png"},
			{id:12, type:"separator"},

			// data management
			{id:13, type:"buttonSelect", text:"Data", img:"databases.png", renderSelect:"disabled", options : [
				{id:6, type:"button", text:"Connection", img:"lightning.png"},
				{id:9, type:"button", text:"Source", img:"database-network.png"},
				{id:8, type:"button", text:"Parameter", img:"paper-plane.png"},
				{id:5, type:"button", text:"Group", img:"category-group.png"}
			]},
			{id:14, type:"separator"},

			// viewing & publishing
			{id:10, type:"button", text:"Preview", img:"magnifier.png"},
			{id:7, type:"button", text:"Publish", img:"globe--arrow.png"}
		];

		this.toolbar.setIconsPath(this.fugueIconPath);
		this.toolbar.loadStruct(defaultButton);

		// event register
		this.toolbar.attachEvent('onClick', function(id){

			// preferences window
			if (id === '11') {
				designer.OpenPreferencesWindow();
			}
			// parameter window
			else if (id === '8') {
				designer.OpenParameterWindow();
			}
			// connection window
			else if (id === '6') {
				designer.OpenConnectionWindow();
			}
		});
	};

	Designer.prototype.OpenConnectionWindow = function() {
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

		var statusBar = connectionWin.attachStatusBar();

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
				mode = 'add';
				var addNewConnection = '\n\
				<table border="0" class="windowForm" id="connectionAddNew">\n\
				<colgroup style="width:120px"/>\n\
				<colgroup style="width:10px"/>\n\
				<colgroup/>\n\
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
				statusBar.setText('Confirm remove connection "'+ tree.getSelectedItemId() +'"? &nbsp;&nbsp;<a href="javascript:void(0)" id="anchorRemoveConnectionOK">OK</a> &nbsp;&nbsp; <a href="javascript:void(0)" id="anchorRemoveConnectionCancel">Cancel</a>');
				layout.cells('a').progressOn();
				layout.cells('b').progressOn();
			}

		});

	 	// event register
	 	// remove connection OK
	 	$('body').on('click', '#anchorRemoveConnectionOK', function(){
	 		var connName = tree.getSelectedItemId();

	 		layout.cells('a').progressOff();
	 		layout.cells('b').progressOff();

	 		tree.deleteItem(connName, false);
	 		statusBar.setText('');

	 		// remove from details #setter
	 		delete designer.details.app.connection[connName];

	 		if ($.isEmptyObject(designer.details.app.connection)) {
	 			layout.cells('b').attachHTMLString(noConnectionAvailable);
	 		} else {
	 			layout.cells('b').attachHTMLString(noConnectionSelected);
	 		}
	 	});

	 	// remove connection cancel
	 	$('body').on('click', '#anchorRemoveConnectionCancel', function(){
	 		layout.cells('a').progressOff();
	 		layout.cells('b').progressOff();
	 		statusBar.setText('');
	 	});


	 	// test button
		$(layout.base).on('click', '.buttonPlaceholder input.test', function(){
			alert('belum lagi!');
		});

	 	// reset button
		$(layout.base).on('click', '.buttonPlaceholder input.reset', function(){
			var connectionForm = (mode === 'add') ? $('#connectionAddNew') : $('#connectionEdit');
			connectionForm.find('input, select').each(function(){
				$(this).val('');
			});
			connectionForm.find('input.name').focus();
		});

	 	// save button
		$(layout.base).on('click', '.buttonPlaceholder input.save', function(){
			statusBar.setText('');

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
				statusBar.setText('<img style="float:left; margin:3px" src="../img/icons/exclamation-red-frame.png"/> Unable to save : Empty connection name');
				return false;
			}
			if (detail.type === '') {
				statusBar.setText('<img style="float:left; margin:3px" src="../img/icons/exclamation-red-frame.png"/> Unable to save : Invalid connection type');
				return false;
			}

			// add mode
			if (mode === 'add') {
				// jika nama dah ada
				if (designer.details.app.connection[detail.name] !== undefined) {
					statusBar.setText('<img style="float:left; margin:3px" src="../img/icons/exclamation-red-frame.png"/> Unable to save : Connection name already exist');
					return false;
				}

				// add new connection #setter
				designer.details.app.connection[detail.name] = detail;

				// tambah pada tree
				tree.insertNewItem(0, detail.name, detail.name, null, 'document.png', 'document.png', 'document.png');

				// reset right side
				layout.cells('b').attachHTMLString(noConnectionSelected);

				// reset mode
				mode = null;

				message = 'Connection is successfully added';
			}

			// edit mode
			else if (mode === 'edit') {

				// jika nama lama tidak sama dengan nama baru
				if (editName !== detail.name) {

					// nama dah wujud
					if (designer.details.app.connection[detail.name] !== undefined) {
						statusBar.setText('<img style="float:left; margin:3px" src="../img/icons/exclamation-red-frame.png"/> Unable to save : Connection name already exist');
						return false;
					}

					// update tree
					tree.changeItemId(editName, detail.name);
					tree.setItemText(detail.name, detail.name);
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
			statusBar.setText(message);

			// padam mesej
			setTimeout(function(){
				statusBar.setText('');
			}, 2000);
		});

		// tree connection click
		tree.attachEvent('onClick', function(id){
			mode = 'edit';
			editName = id;

			statusBar.setText('');

			// display detail #getter
			var editConnection = '\n\
			<table border="0" class="windowForm" id="connectionEdit">\n\
			<colgroup style="width:120px"/>\n\
			<colgroup style="width:10px"/>\n\
			<colgroup/>\n\
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
		<colgroup style="width:120px"/>\n\
		<colgroup style="width:10px"/>\n\
		<colgroup/>\n\
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
				statusBar.setText('<img style="float:left; margin:3px" src="../img/icons/exclamation-red-frame.png"/> Empty parameter name');
				return false;
			}
			// jika param name dah ada
			else if (designer.details.app.parameter[paramName] !== undefined) {
				statusBar.setText('<img style="float:left; margin:3px" src="../img/icons/exclamation-red-frame.png"/> Parameter name already exists');
				return false;
			}
			// jika data type number, tapi default value bukan number
			else if (paramDataType === 'number' && isNaN(Number(paramDefaultValue))) {
				statusBar.setText('<img style="float:left; margin:3px" src="../img/icons/exclamation-red-frame.png"/> Default value is not a number');
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

						// update details
						designer.details.app.parameter[newValue] = $.extend(true, {}, designer.details.app.parameter[rowId]);
						designer.details.app.parameter[newValue].name = newValue;
						delete designer.details.app.parameter[rowId];

					} else {
						// tukar balik value baru ke value lama
						designer.parameterListGrid.cellById(rowId, cellIndex).setValue(rowId);

						// papar error
						designer.parameterStatusBarBottom.setText('<img style="float:left; margin:3px" src="../img/icons/exclamation-red-frame.png"/> Parameter name already exists');

						// clear error
						setTimeout(function(){
							designer.parameterStatusBarBottom.setText('');
						}, 2000);

						return false;
					}

				}

				// edit default value
				else if (cellIndex === 1) {

					// jika data type number, tapi user edit value jadikan selain number
					if (designer.details.app.parameter[rowId].dataType === 'number' && isNaN(Number(newValue))) {
						
						var oldValue = designer.details.app.parameter[rowId].defaultValue;
						designer.parameterListGrid.cellById(rowId, cellIndex).setValue(oldValue);
						designer.parameterStatusBarBottom.setText('<img style="float:left; margin:3px" src="../img/icons/exclamation-red-frame.png"/> Invalid value (Not a number)');
						setTimeout(function(){
							designer.parameterStatusBarBottom.setText('');
						}, 3000);

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
	};

	Designer.prototype.PromptRemoveParameter = function() {
		this.parameterStatusBarBottom.setText('Confirm remove parameter "'+ this.parameterListGrid.getSelectedRowId() +'"? &nbsp;&nbsp;<a href="javascript:void(0)" id="anchorRemoveParameterOK">OK</a> &nbsp;&nbsp; <a href="javascript:void(0)" id="anchorRemoveParameterCancel">Cancel</a>');
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
		<colgroup style="width:100px"/>\n\
		<colgroup style="width:10px"/>\n\
		<colgroup/>\n\
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
		<colgroup style="width:100px"/>\n\
		<colgroup style="width:10px"/>\n\
		<colgroup/>\n\
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
		<colgroup style="width:70px"/>\n\
		<colgroup style="width:10px"/>\n\
		<colgroup/>\n\
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
			var margin = {
				top    : Number(preferencesMargin.find('input.margin.top').val()),
				left   : Number(preferencesMargin.find('input.margin.left').val()),
				right  : Number(preferencesMargin.find('input.margin.right').val()),
				bottom : Number(preferencesMargin.find('input.margin.bottom').val()),
				footer : Number(preferencesMargin.find('input.margin.footer').val())
			}

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
	};

	Designer.prototype.InitWorkspace = function() {
		var workspace = $('<div id="workspace"></div>');
		var bandWidth = designer.details.default.bandWidth[designer.details.app.format.paper][designer.details.app.format.orientation];

		// init bands
		for (var key in this.details.app.band) {
			var band = new Band({title : key});
			band.elem.appendTo(workspace);
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
		var bandId = 2;
		for (var key in this.details.default.band) {
			bands.push({ id:bandId++, text:key, im0:"zone.png" });
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

	Designer.prototype.GoBackHome = function() {
		window.location.href = '../?error=permission&page=designer';
	};

	// event : tree structure click
	Designer.prototype.TreeStructureRegisterEvent = function() {

		// structure
		this.tree.structure.attachEvent('onClick', function(id){
			// prevent bubble up
			event.stopPropagation();

			// clear yang lain
			designer.tree.data.clearSelection();
			designer.tree.element.clearSelection();
		});

		// data
		this.tree.data.attachEvent('onClick', function(id){
			// prevent bubble up
			event.stopPropagation();

			// clear yang lain
			designer.tree.structure.clearSelection();
			designer.tree.element.clearSelection();
		});

		// tree
		this.tree.element.attachEvent('onClick', function(id){
			// prevent bubble up
			event.stopPropagation();

			// clear yang lain
			designer.tree.structure.clearSelection();
			designer.tree.data.clearSelection();
		});
	};

	// event : body click
	$('body').on('click', function(){

		// clear selection tree		
		designer.tree.structure.clearSelection();
		designer.tree.data.clearSelection();
		designer.tree.element.clearSelection();

	});

	// event : remove parameter from list
	$('body').on('click', '#anchorRemoveParameterOK', function(){
		// tag : parameter remove #setter
		var paramName = designer.parameterListGrid.getSelectedRowId();
		delete designer.details.app.parameter[paramName];

		// delete row
		designer.parameterListGrid.deleteSelectedRows();
		designer.parameterListGrid.clearSelection();
		designer.parameterStatusBarBottom.setText('');
	});

	// event : cancel remove parameter
	$('body').on('click', '#anchorRemoveParameterCancel', function(){
		designer.parameterListGrid.clearSelection();
		designer.parameterStatusBarBottom.setText('');
	});
}