<?php 
	$host = $_SERVER['HTTP_HOST'];
	$uri = rtrim(dirname($_SERVER['PHP_SELF']), '\//');
	$extra = "pages/index.php";
    header("Location: http://$host$uri/$extra");
	exit; 
?>