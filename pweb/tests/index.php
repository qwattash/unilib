<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<title>Test index</title>
</head>
<body>
<ul>
<?php
	function echoEntry($entry, $path) {
		echo '<li><a href="'.$path.$entry.'">'.$path.$entry.'</a></li>';
	}
  
  function endsWith($entry, $end) {
    $entryEnd = substr($entry, -strlen($end));
    if ($entryEnd == $end) return true;
    return false;
  }
	
	function traverse($path) {
		$files = array();
		$dir = array($path);
		while (sizeof($dir)) {
			$current = array_pop($dir);
			$path = ($current != '.') ? $current.'/' : '';
			if ($handle = opendir($current)) {
				while (false !== ($entry = readdir($handle))) {
					if ($entry == '.' || $entry == '..' || endsWith($entry, '.js')) {
						continue;
					}
					if (is_dir($entry)) {
						array_push($dir, $entry);
					}
					else {
						echoEntry($entry, $path);
					}
				}
				closedir($handle);
			}
		}	
	};
	traverse('.');
?>
</ul>
</body>
</html>