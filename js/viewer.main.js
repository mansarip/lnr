$(function(){

	window.viewer = new Viewer();

	// check session
	viewer.CheckSession();

	// init frame
	viewer.InitFrame();

	// output processing
	viewer.Output();
});