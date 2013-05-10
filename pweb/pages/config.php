<?php
 /*
  * definition of configuration variables
  */
  $local = rtrim(dirname(__FILE__), '\//');
  $tail = strpos($local, '/pages');
  $local = substr($local, 0, $tail);
  
 /**
  * base path of javascript files
  */
  define('JSCONFIG_BASE', $local.'/js');
?>