<?php

// sumber data
$data = $source['data'];

// root query
$rootQueryName = null;

// create parameter object(s)
if (!empty($data['parameter'])) {
	foreach ($data['parameter'] as $paramName => $paramDetails) {
		$paramDetails['name'] = $paramName;
		$parameter[$paramName] = new Parameter($paramDetails);
		$parameter[$paramName]->GetValue();
	}
}

// create connection object(s)
if (!empty($data['connection'])) {
	foreach ($data['connection'] as $connName => $connDetails) {
		$connDetails['name'] = $connName;
		$connection[$connName] = new Connection($connDetails);

		// connect (for active connection)
		if ($connection[$connName]->active) {
			$connection[$connName]->Connect();
		}
	}
}

// create query object(s)
if (!empty($data['query'])) {
	foreach ($data['query'] as $queryName => $queryDetails) {
		$queryDetails['name'] = $queryName;
		$query[$queryName] = new Query($queryDetails);
		$query[$queryName]->connection = $connection[$connName];
		$query[$queryName]->ParameterBinding($parameter);
		$query[$queryName]->Execute();

		// "main query" akan jadi root query
		if ($query[$queryName]->main) $rootQueryName = $queryName;
	}
}

// group objects
if (!empty($data['group'])) {
	foreach ($data['group'] as $groupName => $groupDetails) {
		$group[$groupName] = new Group();
		$group[$groupName]->name = $groupName;
		$group[$groupName]->sourceQuery = $groupDetails['sourceQuery'];
		$group[$groupName]->columns = $groupDetails['column'];
	}
}

// close connections
foreach ($connection as $conn) {
	$conn->Close();
}

?>