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
			band : this.details.default.element,
			margin : this.details.default.margin,
			parameter : {} // declare as object
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
		// this.tabbar.cellA.cells('data').setActive();

		// attach toolbar pada cell
		// this.elementToolbar = this.layout.cells('b').attachToolbar();
		
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

			// parameter
			{id:8, type:"button", text:"Parameter", img:"paper-plane.png"},
			{id:9, type:"separator"},

			// grouping
			{id:5, type:"button", text:"Group", img:"category-group.png"},
			{id:6, type:"separator"},

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

		// margin tab
		var generalContent = '\n\
		<table border="0" class="windowForm" id="preferencesMargin">\n\
		<colgroup style="width:70px"/>\n\
		<colgroup style="width:10px"/>\n\
		<colgroup/>\n\
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
		});

		// tag : preferences #setter

		// save and close window button
		$(tabbar.base).find('input.save').click(function(){

			var preferencesGeneral = $('#preferencesGeneral');
			var preferencesMargin = $('#preferencesMargin');
			var reportTitle = preferencesGeneral.find('input.reportTitle').val();
			var author = preferencesGeneral.find('input.authorName').val();
			var margin = {
				top    : Number(preferencesMargin.find('input.margin.top').val()),
				left   : Number(preferencesMargin.find('input.margin.left').val()),
				right  : Number(preferencesMargin.find('input.margin.right').val()),
				bottom : Number(preferencesMargin.find('input.margin.bottom').val()),
				footer : Number(preferencesMargin.find('input.margin.footer').val())
			}

			designer.details.app.general.reportTitle = reportTitle;
			designer.details.app.general.author = author;
			designer.details.app.margin.top = (isNaN(margin.top)) ? 0 : margin.top;
			designer.details.app.margin.left = (isNaN(margin.left)) ? 0 : margin.left;
			designer.details.app.margin.right = (isNaN(margin.right)) ? 0 : margin.right;
			designer.details.app.margin.bottom = (isNaN(margin.bottom)) ? 0 : margin.bottom;
			designer.details.app.margin.footer = (isNaN(margin.footer)) ? 0 : margin.footer;

			preferences.close();
		});
	};

	Designer.prototype.InitWorkspace = function() {
		// init bands
		var workspace = $('<div id="workspace"></div>');

		/*for (var key in this.details.app.band) {
			var band = new Band({title : key});
			band.elem.appendTo(workspace);
		}*/

		this.layout.cells('b').attachObject(workspace[0]);
	};

	Designer.prototype.InitElementTree = function() {
		// dapatkan sumber dari details default
		var elements = [];
		var elementId = 2;
		for (var key in this.details.default.element) {
			elements.push({ id:elementId++, text:key, im0:this.details.default.element[key].icon });
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