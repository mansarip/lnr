<?php

/*
 * Error messages
 * author : Luqman B. Shariffudin (luqman.shariffudin@nc.com.my)
 * copyright : ANSI System Sdn Bhd
 */

function DisplayError($code)
{
	echo '<b>Error : </b>';

	switch ($code)
	{
		// layout errors
		case 1 : echo 'aaaa'; break;
		case 2 : echo 'bbbb'; break;

		// encrypt errors
		case 301 : echo 'No file detected'; break;
		case 302 : echo 'Unable to write file'; break;
	}

	echo ' ('.$code.')';

	exit; // exit program serta merta
}

?>