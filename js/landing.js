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
				var htmlString = '<div style="text-align:left; padding:5px 10px;"><p style="color:red"><b>Error</b></p><p>'+ response.message +'</p><input type="button" class="btnErrorPopupClose" value="Close"/></div>';
				loginWindow.createWindow({
					id: 'errorPopup',
					left: 10,
					top:10,
					width:240,
					height:150,
					center:true
				});
				loginWindow.window('errorPopup').setText('Login Error');
				loginWindow.window('errorPopup').denyResize();
				loginWindow.window('errorPopup').setModal(true);
				loginWindow.window('errorPopup').button('park').disable();
				loginWindow.window('errorPopup').attachHTMLString(htmlString);

				loginWindow.window('errorPopup').button('close').attachEvent('onClick', function(win, button){
					$('input.btnErrorPopupClose').click();
				});
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