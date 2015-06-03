<?php

include('../php/class.servicessource.php');

$plainSource = '{
	"application":{
		"name":"Lime & Rose Reporting Tool",
		"version":"0.1 Nightly Build (Unstable)",
		"release":"May 2015"
	},
	"globalConnection":{
		"%connectionName%":{
			"type":"database",
			"dbType":"mysql",
			"host":"localhost",
			"username":"root",
			"password":"123",
			"dbName":"test",
			"port":"",
			"sid":"",
			"serviceName":"",
			"socket":"",
			"url":""
		}
	},
	"configuration":{
		"serverSideLanguage":"php",
		"defaultAuthorName":"",
		"publishPath":""
	},
	"servicesAccount":{
		"tableBinding":false,
		"tableName":"",
		"columnUser":"",
		"columnPassword":"",
		"connection":"",
		"account":{
			"admin":{
				"password":"123",
				"privileges":{
					"reportDesigner":true,
					"servicesWizard":true,
					"servicesGlobalConnection":true,
					"servicesConfiguration":true,
					"servicesServicesAccount":true,
					"servicesViewerAccount":true,
					"servicesLNRESourceReader":true
				}
			}
		}
	},
	"viewerAccount":{
		"tableBinding":false,
		"tableName":"",
		"columnUser":"",
		"columnPassword":"",
		"connection":"",
		"account":{
			"pengguna":{
				"password":"abc",
				"report":[]
			}
		}
	},
	"encryptionKey":{
		"services":"",
		"lnre":"ABCDE12345",
		"defaultViewer":"ABC"
	}
}';

ServicesSource::Create($plainSource, '../services/', 'services.src');

?>