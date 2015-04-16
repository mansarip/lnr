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
	});

});