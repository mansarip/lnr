$(function(){

	var phpPath = 'php/';
	var loginWindow = new dhtmlXWindows();

	// display error message (if any)
	// ==============================
	var urlParameters = GetUrlParameter();
	
	if (urlParameters.error && urlParameters.page) {
		$('p#loginStatus').before('<p style="background-color: #FFE2E2; padding: 8px; width: 300px; margin: 0 auto; border: 1px solid #DB7575; color: #861717;"><b>Error : </b>Permission required</p>');
	}

	// check login status
	// ==================
	var checkLogin = $.ajax({
		url : phpPath + 'landing.checkstatus.php',
		dataType : 'json'
	});

	checkLogin.done(function(response){
		var user = response.username;
		var label = $('#loginStatus span.message');
		var link = $('#loginStatus span.loginLink');
		var loginLink = $('<a href="javascript:void(0);"></a>');

		if (response.code === 1) {
			label.html('Logged in as <b>' + user + '</b>');
			loginLink.text('Logout');
			loginLink.click(function(){
				Logout();
			});

		} else {
			label.text('Not logged in');
			loginLink.text('Login');
			loginLink.click(function(){
				ShowLoginWindow();
			});
		}

		link.empty().append(loginLink);
	});

	// login button
	// ============
	$('body').on('click', '#loginForm input.loginBtn', function(event){
		event.preventDefault();
		loginWindow.window('login').progressOn();

		var username = $('#loginForm input.username').val();
		var password = $('#loginForm input.password').val();

		$.ajax({
			url: phpPath + 'landing.login.php',
			type: 'post',	
			data: {
				user : username,
				pass : password
			},
			dataType: 'json'
		})
		.done(function(response){
			if (response.success === 0) {

				dhtmlx.alert({
					title:'Error',
					text:response.message
				});
				loginWindow.window('login').progressOff();
				return false;
				
			} else if (response.success === 1) {
				window.location.href = './';
			}
		})
		.fail(function(e){
			alert('Error : ' + e.status);
			loginWindow.window('login').progressOff();
		});
	});

	// register button event
	// =====================
	$('.landingBtn').on('click', function(){		
		var path;

		switch($(this).val()) {
			case 'Services': path = 'services/'; break;
			case 'Designer': path = 'designer/'; break;
			case 'Viewer'  : path = 'viewer/'; break;
		}

		window.location.href = path;
	});

	$('body').on('click', 'input.btnErrorPopupClose', function(){
		loginWindow.window('errorPopup').close();
		loginWindow.window('login').progressOff();
	});

	$('body').on('click', '#systemCheck', function(){
		var win = new dhtmlXWindows();
		win.attachViewportTo('content');

		var systemCheckWin = win.createWindow({
			id:"newConnection",
			width:450,
			height:240,
			center:true,
			modal:true,
			resize:false
		});
		systemCheckWin.button('minmax').hide();
		systemCheckWin.button('park').hide();
		systemCheckWin.setText('System Check');
		systemCheckWin.progressOn();

		$.ajax({
			url: phpPath + 'landing.systemcheck.php',
			dataType : 'json'
		})
		.done(function(response){
			var html = '<div style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; overflow-y: scroll; padding: 5px 0px 5px 5px;"><table border="0" style="width:100%;">\n\
				<col style="width:80%"></col>\n\
				<col style="width:19%"></col>\n\
				<tr><th style="text-align:left">Detail</th><th>Status</th></tr>\n\
				<tr><td style="text-align:left">Services Key</td><td>'+ (response.servicesKeySecure ? '<span style="color:green">SECURE</span>' : '<span style="color:#FA5500">INSECURE</span>') +'</td></tr>\n\
				<tr><td style="text-align:left">Services Key</td><td>'+ (response.designerKeySecure ? '<span style="color:green">SECURE</span>' : '<span style="color:#FA5500">INSECURE</span>') +'</td></tr>\n\
				<tr><td style="text-align:left">LNRE Library Available</td><td>'+ (response.LNRELibraryAvailable ? '<span style="color:green">YES</span>' : '<span style="color:red">NO</span>') +'</td></tr>\n\
				<tr><td style="text-align:left">Services Source Library Available</td><td>'+ (response.ServicesSourceLibraryAvailable ? '<span style="color:green">YES</span>' : '<span style="color:red">NO</span>') +'</td></tr>\n\
				<tr><td style="text-align:left">Services Source File Readable</td><td>'+ (response.ServicesSourceFileReadable ? '<span style="color:green">YES</span>' : '<span style="color:red">NO</span>') +'</td></tr>\n\
				<tr><td style="text-align:left">Services Source File Writable</td><td>'+ (response.ServicesSourceFileWritable ? '<span style="color:green">YES</span>' : '<span style="color:red">NO</span>') +'</td></tr>\n\
				<tr><td style="text-align:left">Publish Folder Readable</td><td>'+ (response.publishFolderReadable ? '<span style="color:green">YES</span>' : '<span style="color:red">NO</span>') +'</td></tr>\n\
				<tr><td style="text-align:left">Publish Folder Writable</td><td>'+ (response.publishFolderWritable ? '<span style="color:green">YES</span>' : '<span style="color:red">NO</span>') +'</td></tr>\n\
				<tr><td style="text-align:left">PHP : MySQLi</td><td>'+ (response.phpMysqli ? '<span style="color:green">YES</span>' : '<span style="color:red">NO</span>') +'</td></tr>\n\
				<tr><td style="text-align:left">PHP : OCI8</td><td>'+ (response.phpOci8 ? '<span style="color:green">YES</span>' : '<span style="color:red">NO</span>') +'</td></tr>\n\
				<tr><td style="text-align:left">PHP : Sybase</td><td>'+ (response.phpSybase ? '<span style="color:green">YES</span>' : '<span style="color:red">NO</span>') +'</td></tr>\n\
			</table></div>';
			systemCheckWin.attachHTMLString(html);
			systemCheckWin.progressOff();
		});
	});

	// Functions
	// =====================

	// get url params
	function GetUrlParameter() {
		var match,
			pl     = /\+/g,  // Regex for replacing addition symbol with a space
			search = /([^&=]+)=?([^&]*)/g,
			decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
			query  = window.location.search.substring(1);

		urlParams = {};
		while (match = search.exec(query))
		urlParams[decode(match[1])] = decode(match[2]);
		return urlParams;
	}

	// logout
	function Logout() {
		$.ajax({
			url: phpPath + 'landing.logout.php'
		})
		.done(function(){
			window.location.reload();
		});
	}

	// login popup
	function ShowLoginWindow() {
		loginWindow.attachViewportTo('content');
		loginWindow.createWindow({
			id: 'login',
			left: 10,
			top:10,
			width:340,
			height:145,
			center:true
		});
		loginWindow.window('login').setText('L&R Login');
		loginWindow.window('login').denyResize();
		loginWindow.window('login').setModal(true);
		loginWindow.window('login').button('park').disable();
		loginWindow.window('login').attachHTMLString('<form action=""><table id="loginForm"> <colgroup class="first"></colgroup><colgroup class="second"></colgroup> <tr> <td>Username</td> <td><input autofocus class="username" type="text"/></td> </tr> <tr> <td>Password</td> <td><input class="password" type="password"/></td> </tr> <tr> <td></td> <td><input class="loginBtn" type="submit" value="Login"/></td> </tr> </table></form>');
	}
});