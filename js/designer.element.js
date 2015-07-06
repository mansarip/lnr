/**
 * Element Class
 */
function Element() {
	this.id;                               // string
	this.name;                             // string
	this.width;                            // float
	this.type;                             // string
	this.height;                           // float
	this.posX;                             // int
	this.posY;                             // int
	this.fillColorEnable    = false;       // bool
	this.fillColor          = '#ffffff';   // string
	this.padding            = 0;           // int
	this.horizontalPadding;                // int
	this.verticalPadding;                  // int
	this.borderAllEnable    = true;        // bool
	this.borderAllWidth     = 1;           // int
	this.borderAllStyle     = 'solid';     // string
	this.borderAllColor     = '#000000';   // string
	this.borderTopEnable    = true;        // bool
	this.borderTopWidth     = 1;           // int
	this.borderTopStyle     = 'solid';     // string
	this.borderTopColor     = '#000000';   // string
	this.borderBottomEnable = true;        // bool
	this.borderBottomWidth  = 1;           // int
	this.borderBottomStyle  = 'solid';     // string
	this.borderBottomColor  = '#000000';   // string
	this.borderLeftEnable   = true;        // bool
	this.borderLeftWidth    = 1;           // int
	this.borderLeftStyle    = 'solid';     // string
	this.borderLeftColor    = '#000000';   // string
	this.borderRightEnable  = true;        // bool
	this.borderRightWidth   = 1;           // int
	this.borderRightStyle   = 'solid';     // string
	this.borderRightColor   = '#000000';   // string

	this.elem;                             // jquery object
	this.parentBand;                       // jquery object
	this.treeIcon;                         // string
	this.propertiesItems;                  // jquery object

	Element.prototype.ApplyDrag = function(){
		var self = this;
		var parent = this.elem.closest('.area');
		this.elem.draggable({
			containment:parent,
			stop:function(event, ui){
				var bandName = $(this).closest('.band').attr('data-name');
				var band = designer.details.app.band[bandName];
				designer.UpdateBandMinHeight(band);
				self.UpdatePosition();
				 $( event.toElement ).one('click', function(e){ e.stopImmediatePropagation(); } );
			}
		});
	};

	Element.prototype.ApplyResize = function(){
		var self = this;
		var parent = this.elem.closest('.area');
		this.elem.resizable({
			containment:parent,
			handles:'all',
			stop:function(event, ui){
				var bandName = ui.element.closest('.band').attr('data-name');
				var band = designer.details.app.band[bandName];
				designer.UpdateBandMinHeight(band);
				self.UpdateSize();
				self.UpdatePosition();
				self.ResetContentPosition();
				$( event.toElement ).one('click', function(e){ e.stopImmediatePropagation(); } );
			}
		});
	};

	Element.prototype.ResetContentPosition = function(){
		if (this.type === 'label') {
			if (this.verticalAlign === 'middle') {
				var content = this.elem.find('span.content');
				var contentHeight = content.height();
				var top = (this.elem.height() / 2) - (contentHeight / 2);
				content.css('top',top);
			}
		}
	};

	Element.prototype.AttachToParent = function(){
		this.parentBand.element.push(this);
		this.elem.attr('data-index', (this.parentBand.element.length - 1));
	};

	Element.prototype.Deselect = function(){
		designer.currentSelectedElement = null;
		this.elem.removeClass('selected');
		this.propertiesItems.hide();
		designer.propertiesGrid.hide();
	};

	Element.prototype.Draw = function(area){
		this.elem = $('<div class="element '+ this.type +'" style="'+ this.GenerateStyle() +'" data-index=""></div>');
		this.elem.uniqueId();
		this.elem.appendTo(area);

		this.PostInit();

		// id
		this.id = this.elem.attr('id');
		this.name = this.type + '-' + this.id;

		// events
		var self = this;

		this.elem.on('mousedown', function(event){
			event.stopPropagation();
			designer.DeselectCurrentElement();
			self.Select();
		});

		this.elem.on('click', function(event){
			event.stopPropagation();
			self.elem.trigger('mousedown');
		});
	};

	Element.prototype.GenerateStyle = function(){
		var style = 'border:1px solid #333; width:'+ this.width +'px; height:'+ this.height +'px; top:'+ this.posY +'px; left:'+ this.posX +'px;';
		return style;
	};

	Element.prototype.RegisterTree = function(){
		var self = this;
		var treeParentId = this.parentBand.treeStructureId;
		var treeChildId = this.id;
		var treeText = this.type.charAt(0).toUpperCase() + this.type.slice(1);

		designer.tree.structure.insertNewChild(treeParentId, treeChildId, treeText, function(id){
			designer.DeselectCurrentElement();
			designer.currentTreeSelected = this.span;
			self.Select();
		}, self.treeIcon);

		designer.tree.structure.selectItem(treeChildId, false);
	};

	Element.prototype.Select = function(){
		designer.currentSelectedElement = this;
		designer.tree.structure.selectItem(this.id);
		this.elem.addClass('selected');
		this.ShowProperties();
	};

	Element.prototype.SetPosition = function(x, y){
		// jadikan integer
		x = Math.floor(x);
		y = Math.floor(y);

		this.posX = x;
		this.posY = y;
	};

	Element.prototype.ShowProperties = function(){
		var propertiesElem = $('#properties');

		// #getter
		propertiesElem.find('span.id').text(this.id);
		propertiesElem.find('span.type').text(this.type);
		propertiesElem.find('input.name').val(this.name);
		propertiesElem.find('input.width').val(this.width);
		propertiesElem.find('input.height').val(this.height);
		propertiesElem.find('input.left').val(this.posX);
		propertiesElem.find('input.top').val(this.posY);
		propertiesElem.find('input.ishtml').prop('checked', this.isHTML);
		propertiesElem.find('input.lineHeight').val(this.lineHeight);
		propertiesElem.find('select.fontFamily').val(this.fontFamily);
		propertiesElem.find('input.fontSize').val(this.fontSize);
		propertiesElem.find('input.fontBold').prop('checked', this.fontBold);
		propertiesElem.find('input.fontItalic').prop('checked', this.fontItalic);
		propertiesElem.find('input.fontUnderline').prop('checked', this.fontUnderline);
		propertiesElem.find('select.textAlign').val(this.textAlign);
		propertiesElem.find('select.verticalAlign').val(this.verticalAlign);
		propertiesElem.find('select.qrcodetype').val(this.barType);
		propertiesElem.find('input.barcodeShowText').prop('checked', this.showText);

		if (this.type === 'label' || this.type === 'field') {
			propertiesElem.find('input.textColor').val(this.textColor).css({'background-color' : this.textColor, 'color' : (designer.GetColorLightOrDark(this.textColor) === 'dark' ? '#fff' : '#333') });
		}

		propertiesElem.find('input.fillColorEnable').prop('checked', this.fillColorEnable);
		propertiesElem.find('input.fillColor').val(this.fillColor).css({'background-color' : this.fillColor, 'color' : (designer.GetColorLightOrDark(this.fillColor) === 'dark' ? '#fff' : '#333') });
		propertiesElem.find('input.padding').val(this.padding);
		propertiesElem.find('select.elasticity').val(this.elasticity);

		var borderSide = ['All', 'Top', 'Bottom', 'Right', 'Left'];
		for (var s=0; s<borderSide.length; s++) {
			propertiesElem.find('input.border'+ borderSide[s] +'Enable').prop('checked', this['border'+ borderSide[s] +'Enable']);
			propertiesElem.find('input.border'+ borderSide[s] +'Width').val(this['border'+ borderSide[s] +'Width']);
			propertiesElem.find('input.border'+ borderSide[s] +'Style').val(this['border'+ borderSide[s] +'Style']);
			propertiesElem.find('input.border'+ borderSide[s] +'Color').val(this['border'+ borderSide[s] +'Color']).css({'background-color' : this['border'+ borderSide[s] +'Color'], 'color' : (designer.GetColorLightOrDark(this['border'+ borderSide[s] +'Color']) === 'dark' ? '#fff' : '#333') });	
		};

		this.propertiesItems.show();
		designer.propertiesGrid.show();
	};

	Element.prototype.UpdatePosition = function(){
		this.posY = this.elem.position().top;
		this.posX = this.elem.position().left;
		$('#properties input.left').val(this.posX);
		$('#properties input.top').val(this.posY);
	};

	Element.prototype.UpdateSize = function(){
		this.width = this.elem.width();
		this.height = this.elem.height();

		if (this === designer.currentSelectedElement) {
			$('#properties input.width').val(this.width);
			$('#properties input.height').val(this.height);
		}
	};
}

/**
 * TextContainer Class (extend Element)
 */
TextContainer.prototype = new Element();
TextContainer.prototype.constructor = Label;
function TextContainer() {
	this.lineHeight = 1.0;          //float
	this.fontFamily = 'helvetica';  //string
	this.fontSize = 12;             //int
	this.fontItalic = false;        //bool
	this.fontBold = false;          //bool
	this.fontUnderline = false;     //bool
	this.fontStriketrough = false;  //bool
	this.textColor = '#333333';     //string
	this.textAlign = 'left';        //string
	this.verticalAlign = 'top';     //string
	this.elasticity = 'fixed';      //string
}

/**
 * Label Class (extend TextContainer)
 */
Label.prototype = new TextContainer();
Label.prototype.constructor = Label;
function Label() {
	this.width = 90;
	this.height = 20;
	this.type = 'label';
	this.treeIcon = 'ui-label.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
	this.text = '';
	this.isHTML = false;

	Label.prototype.PostInit = function() {
		var label = this;
		this.elem.append('<span class="content" style="font-family:'+ this.fontFamily +'; font-size:'+ this.fontSize +'px; display:block; line-height:'+ (this.lineHeight * 12) +'px"></span>');

		// dbl click
		this.elem.on('dblclick', function(e){
			var button = $('#properties input.text');
			label.OpenTextWindow(button, e.pageX, e.pageY);
		});
	};

	Label.prototype.ApplyText = function(text){
		// #setter
		this.text = text;

		if (!this.isHTML) {
			this.elem.find('span.content').html(this.text.replace(/\r\n|\r|\n/g,"<br />"));
		}
		// jika html
		else {
			this.elem.find('span.content').html(this.text);
		}
	};

	Label.prototype.OpenTextWindow = function(button, x, y){
		var self = this;
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');

		var textWin = windows.createWindow({
			id:"labelText",
			width:300,
			height:200,
			left:x,
			top:y
		});
		textWin.button('minmax').hide();
		textWin.button('park').hide();
		textWin.setText('Text');

		// disable button supaya tak boleh bukak 2 kali
		button.prop('disabled', true);

		designer.currentWindowOpen = textWin;

		// jika bukan html
		if (!designer.currentSelectedElement.isHTML) {
			var textBox = $('<textarea class="labelText">'+ designer.currentSelectedElement.text +'</textarea>');
			textWin.attachObject(textBox[0]);
			textBox.focus();
			designer.moveCursorToEnd(textBox[0]);

			textBox.closest('div.dhxwin_active').on('click', function(e){
				e.stopPropagation();
			});
		}
		// jika html
		else {
			var editor = textWin.attachEditor();
			editor.setContent(designer.currentSelectedElement.text);

			$(editor.base).closest('div.dhxwin_active').on('click', function(e){
				e.stopPropagation();
			});
		}

		textWin.attachEvent('onClose', function(){
			var text;

			if (!self.isHTML) {
				text = $(designer.currentWindowOpen.cell).find('textarea.labelText').val();	
			} else {
				text = editor.getContent();
			}
			
			self.ApplyText(text);

			designer.currentWindowOpen = null;
			button.prop('disabled', false);
			return true;
		});
	};
}

/**
 * Field Class (extend TextContainer)
 */
Field.prototype = new TextContainer();
Field.prototype.constructor = Field;
function Field() {
	this.width = 90;
	this.height = 20;
	this.type = 'field';
	this.treeIcon = 'ui-text-field.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
	this.source = null;

	Field.prototype.PostInit = function(){
		var field = this;
		this.elem.append('<span class="content" style="font-family:'+ this.fontFamily +'; font-size:'+ this.fontSize +'px; display:block; line-height:'+ (this.lineHeight * 12) +'px"></span>');

		// dbl click
		this.elem.on('dblclick', function(e){
			var button = $('#properties input.source');
			field.OpenSourceFieldWindow(button, e.pageX, e.pageY);
		});
	};

	Field.prototype.OpenSourceFieldWindow = function(button, x, y){
		var self = this;
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');

		var sourceFieldWin = windows.createWindow({
			id:"sourceField",
			width:300,
			height:200,
			left:x,
			top:y
		});
		sourceFieldWin.button('minmax').hide();
		sourceFieldWin.button('park').hide();
		sourceFieldWin.setText('Source Field');

		// disable button supaya tak boleh bukak 2 kali
		button.prop('disabled', true);

		designer.currentWindowOpen = sourceFieldWin;

		// generate html dari senarai column
		var columnList = '';
		if (designer.mainQuery) {
			for (var groupName in designer.mainQuery.group) {
				for (var columName in designer.mainQuery.group[groupName].column) {
					columnList += '<option value="'+ columName +'">'+ columName +'</option>';
				}
			}
		}

		var sourceHTML = $('\n\
		<select style="outline:none; width:100%; height:100%" size="10">\n\
			<option value="___none___">None</option>\n\
			<optgroup label="Column">'+ columnList +'</optgroup>\n\
			<optgroup label="User Parameter">\n\
			</optgroup>\n\
			<optgroup label="System">\n\
				<option value="SYS11">SYS11 :: Report Title</option>\n\
				<option value="SYS12">SYS12 :: Report Author</option>\n\
				<option value="SYS21">SYS21 :: Paper Format</option>\n\
				<option value="SYS22">SYS22 :: Paper Orientation</option>\n\
				<option value="SYS31">SYS31 :: Margin Top</option>\n\
				<option value="SYS32">SYS32 :: Margin Bottom</option>\n\
				<option value="SYS33">SYS33 :: Margin Right</option>\n\
				<option value="SYS34">SYS34 :: Margin Left</option>\n\
				<option value="SYS35">SYS35 :: Margin Footer</option>\n\
				<option value="SYS41">SYS41 :: Page Number</option>\n\
			</optgroup>\n\
			<optgroup label="Current Date">\n\
				<option value="DATE11">DATE11 :: 01122015</option>\n\
				<option value="DATE12">DATE12 :: 01 12 2015</option>\n\
				<option value="DATE13">DATE13 :: 01-12-2015</option>\n\
				<option value="DATE14">DATE14 :: 01/12/2015</option>\n\
				<option value="DATE15">DATE15 :: 01 December 2015</option>\n\
				<option value="DATE16">DATE16 :: 1 12 2015</option>\n\
				<option value="DATE17">DATE17 :: 1-12-2015</option>\n\
				<option value="DATE18">DATE18 :: 1/12/2015</option>\n\
				<option value="DATE19">DATE19 :: 1 December 2015</option>\n\
				<option value="DATE21">DATE21 :: 12012015</option>\n\
				<option value="DATE22">DATE22 :: 12 01 2015</option>\n\
				<option value="DATE23">DATE23 :: 12-01-2015</option>\n\
				<option value="DATE24">DATE24 :: 12/01/2015</option>\n\
				<option value="DATE25">DATE25 :: December 01 2015</option>\n\
				<option value="DATE26">DATE26 :: 12 1 2015</option>\n\
				<option value="DATE27">DATE27 :: 12-1-2015</option>\n\
				<option value="DATE28">DATE28 :: 12/1/2015</option>\n\
				<option value="DATE29">DATE29 :: December 1 2015</option>\n\
				<option value="DATE31">DATE31 :: 01 (day)</option>\n\
				<option value="DATE32">DATE32 :: 1 (day)</option>\n\
				<option value="DATE41">DATE41 :: December</option>\n\
				<option value="DATE42">DATE42 :: 12 (month)</option>\n\
				<option value="DATE51">DATE51 :: 2015</option>\n\
				<option value="DATE52">DATE52 :: 15 (year)</option>\n\
			</optgroup>\n\
			<optgroup label="Current Time">\n\
				<option value="TIME11">TIME11 :: 2:21</option>\n\
				<option value="TIME12">TIME12 :: 2:21AM</option>\n\
				<option value="TIME13">TIME13 :: 2:21am</option>\n\
				<option value="TIME14">TIME14 :: 2:21 AM</option>\n\
				<option value="TIME15">TIME15 :: 2:21 am</option>\n\
				<option value="TIME21">TIME21 :: 02:21</option>\n\
				<option value="TIME22">TIME22 :: 02:21AM</option>\n\
				<option value="TIME23">TIME23 :: 02:21am</option>\n\
				<option value="TIME24">TIME24 :: 02:21 AM</option>\n\
				<option value="TIME25">TIME25 :: 02:21 am</option>\n\
				<option value="TIME31">TIME31 :: 1821</option>\n\
				<option value="TIME32">TIME32 :: 18:21</option>\n\
			</optgroup>\n\
		</select>\n\
		');

		// # getter
		sourceHTML.val(this.source === null ? '___none___' : this.source);

		sourceFieldWin.attachObject(sourceHTML[0]);

		sourceHTML.on('click', function(e){
			e.stopPropagation();
		});

		sourceHTML.find('option').on('dblclick', function(){
			sourceFieldWin.close();	
		});
		
		sourceFieldWin.attachEvent('onClose', function(){
			self.source = sourceHTML.val();
			designer.currentSelectedElement.elem.find('span.content').text(self.source);

			sourceHTML.off('click');
			sourceHTML.find('option').off('dblclick');

			designer.currentWindowOpen = null;
			button.prop('disabled', false);
			return true;
		});
	};
}

/**
 * Rectangle Class (extend Element)
 */
Rectangle.prototype = new Element();
Rectangle.prototype.constructor = Rectangle;
function Rectangle() {
	this.width = 60;
	this.height = 60;
	this.type = 'rectangle';
	this.treeIcon = 'layer-shape.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);

	Rectangle.prototype.PostInit = function(){};
}

/**
 * Image Class (extend Element)
 */
Image.prototype = new Element();
Image.prototype.constructor = Image;
function Image() {
	this.width = 80;
	this.height = 60;
	this.type = 'image';
	this.treeIcon = 'picture.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
	this.source = null;
	this.dpi;

	Image.prototype.PostInit = function(){
		var image = this;

		// double click
		this.elem.on('dblclick', function(){
			image.OpenImageSourceWindow();
		});

		// image placeholder
		this.elem.append('<div class="imageSource"></div>');

		// resize image height, when elem resize
		this.elem.on('resize', function(){
			$(this).find('.imageSource img').height($(this).height());
		});
	};

	Image.prototype.OpenImageSourceWindow = function() {
		var image = this;
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');

		if (this.source === null) {
			var imageWin = windows.createWindow({
				id:"imageSource",
				width:400,
				height:200,
				center:true,
				modal:true,
				resize:false
			});
			imageWin.button('minmax').hide();
			imageWin.button('park').hide();
			imageWin.setText('Image');
			designer.currentWindowOpen = imageWin;

			var tab = imageWin.attachTabbar({
				tabs : [
					{id:1, text:"Upload", active:true},
					{id:2, text:"URL"}
				]
			});

			tab.cells(1).attachHTMLString(designer.LoadView('imageUpload'));
			var inputFile = $('#imageUpload input.file');
			var form = $('#imageUpload form');
			var iframe = $('#imageUpload iframe');

			// register event
			$('.dhxwin_active').on('click', '#imageUpload input.choose', function(){
				inputFile.click();
			});

			$('.dhxwin_active').on('change', '#imageUpload input.file', function(){
				imageWin.progressOn();
				form.submit();
			});

			iframe.on('load', function(){
				var response = $(this).contents().find('body').text();
				response = JSON.parse(response);
				imageWin.progressOff();

				if (response.status === 1) {
					imageWin.close();
					image.elem.find('.imageSource').html('<img style="width:100%; height:'+ image.height +'px" src="'+ response.file +'"/>');
					image.source = response.file;

				} else {
					dhtmlx.alert({
						title:'Error',
						style:"alert-info",
						text:'<img src="'+ designer.icon.error +'"/><br/>' + response.message
					});
					
					// reset form
					inputFile.val('');

					return false;
				}
			});

			// prevent bubble up modal overlay click
			$('.dhxwins_mcover, .dhxwin_active').on('click', function(e){
				e.stopPropagation();
			})

			// close event
			imageWin.attachEvent('onClose', function(){
				$('.dhxwins_mcover, .dhxwin_active').off();
				designer.currentWindowOpen = null;
				return true;
			});
		}
		else if (this.source !== null) {

		}
	};
}

/**
 * Svg Class (extend Element)
 */
Svg.prototype = new Element();
Svg.prototype.constructor = Svg;
function Svg() {
	this.width = 80;
	this.height = 60;
	this.type = 'svg';
	this.treeIcon = 'document-text-image.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
	this.source;

	Svg.prototype.PostInit = function(){};
}

/**
 * QRCode Class (extend Element)
 */
QRCode.prototype = new Element();
QRCode.prototype.constructor = QRCode;
function QRCode() {
	this.width = 40;
	this.height = 40;
	this.type = 'qrcode';
	this.treeIcon = 'barcode-2d.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
	this.code = "";
	this.color;
	this.distort;
	this.barType = "QRCODE, M";

	QRCode.prototype.PostInit = function(){
		var qrcode = this;

		// double click
		this.elem.on('dblclick', function(e){
			qrcode.OpenCodeWindow(e.pageX, e.pageY);
		});
	};

	QRCode.prototype.OpenCodeWindow = function(x, y) {
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');

		var codeWin = windows.createWindow({
			id:"qrCodeText",
			width:300,
			height:150,
			left:x,
			top:y
		});
		codeWin.button('minmax').hide();
		codeWin.button('park').hide();
		codeWin.setText('Code Text');

		designer.currentWindowOpen = codeWin;

		var textBox = $('<textarea class="codeText">'+ designer.currentSelectedElement.code +'</textarea>');
		codeWin.attachObject(textBox[0]);
		textBox.focus();
		designer.moveCursorToEnd(textBox[0]);

		textBox.closest('div.dhxwin_active').on('click', function(e){
			e.stopPropagation();
		});

		codeWin.attachEvent('onClose', function(){
			var text = $(designer.currentWindowOpen.cell).find('textarea.codeText').val();
			designer.currentSelectedElement.code = text; // setter, refer kepada qrcode element
			designer.currentWindowOpen = null;

			$('#properties input.qrcode').val(text);

			return true;
		});
	};
}

/**
 * Barcode Class (extend Element)
 */
Barcode.prototype = new Element();
Barcode.prototype.constructor = Barcode;
function Barcode() {
	this.width = 70;
	this.height = 40;
	this.type = 'barcode';
	this.treeIcon = 'barcode-2d.png';
	this.propertiesItems = $('#properties table tbody.' + this.type);
	this.code = "";
	this.color;
	this.distort;
	this.barType = 'C39';
	this.showText = true;
	this.borderAllEnable = false;
	this.borderTopEnable = false;
	this.borderBottomEnable = false;
	this.borderLeftEnable = false;
	this.borderRightEnable = false;

	Barcode.prototype.PostInit = function(){
		var barcode = this;

		// double click
		this.elem.on('dblclick', function(e){
			barcode.OpenCodeWindow(e.pageX, e.pageY);
		});
	};

	Barcode.prototype.OpenCodeWindow = function(x, y) {
		var windows = new dhtmlXWindows();
		windows.attachViewportTo('app');

		var codeWin = windows.createWindow({
			id:"barcodeText",
			width:300,
			height:150,
			left:x,
			top:y
		});
		codeWin.button('minmax').hide();
		codeWin.button('park').hide();
		codeWin.setText('Code Text');

		designer.currentWindowOpen = codeWin;

		var textBox = $('<textarea class="codeText">'+ designer.currentSelectedElement.code +'</textarea>');
		codeWin.attachObject(textBox[0]);
		textBox.focus();
		designer.moveCursorToEnd(textBox[0]);

		textBox.closest('div.dhxwin_active').on('click', function(e){
			e.stopPropagation();
		});

		codeWin.attachEvent('onClose', function(){
			var text = $(designer.currentWindowOpen.cell).find('textarea.codeText').val();
			designer.currentSelectedElement.code = text; // setter, refer kepada qrcode element
			designer.currentWindowOpen = null;

			$('#properties input.barcode').val(text);

			return true;
		});
	};
}