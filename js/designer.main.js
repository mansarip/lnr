$(function(){

	window.designer = new Designer();

	// check user login
	designer.CheckLogin(function(){
		
		// details initialization
		designer.InitDetails();

		// user interface initialization
		designer.InitUI();

		// drag drop interaction init
		designer.InitDragDrop();

		// event registration
		designer.TreeStructureRegisterEvent();

		// keyboard binding
		designer.KeyboardBinding();


		// test script
		designer.details.app.connection['test'] = {
			host: "localhost",
			name: "testconnection",
			pass: "",
			port: "",
			serviceName: "",
			sid: "",
			socket: "",
			type: "mysql",
			user: "root"
		}
		designer.OpenDataSourceWindow();


	});

});