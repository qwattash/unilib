<?php
 /*
  * definition of configuration variables
  */
  $local = rtrim(dirname(__FILE__), '\//');
  $docRoot = $_SERVER['DOCUMENT_ROOT'];
  $tail = strpos($local, '/pages');
  $base = substr($local, strlen($docRoot), $tail - strlen($docRoot));
  
 /**
  * base path of javascript files
  */
  define('JSCONFIG_BASE', $base.'/js');
?>