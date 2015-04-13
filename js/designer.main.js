$(function(){

	window.designer = new Designer();

	// check user login
	designer.CheckLogin(function(){
		
		// details initialization
		designer.InitDetails();

		// user interface initialization
		designer.InitUI();

		// event registration
		designer.TreeStructureRegisterEvent();
	});

});