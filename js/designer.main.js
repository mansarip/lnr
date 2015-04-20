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
		};

		designer.details.app.dataSource.hoho = {
			connection: "test",
			group: {
				ROOT_GROUP : {
					column : {
						ID: { dataType:'number' },
						NAMA: { dataType:'string' },
						NEGERI: { dataType:'string' }
					}
				},
				g_jantina : {
					column : {
						JANTINA: { dataType:'string' }
					}
				}
			},
			main: true,
			maxpreview: "100",
			name: "hoho",
			query: "select * from test.peribadi",
			type: "database"
		};

		designer.mainQuery = designer.details.app.dataSource.hoho;

		designer.OpenGroupWindow();
	});

});