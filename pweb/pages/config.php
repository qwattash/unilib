<?php
 /*
  * definition of configuration variables
  */
  $local = rtrim(dirname(__FILE__), '\//');
  $docRoot = $_SERVER['DOCUMENT_ROOT'];
  $tail = strpos($local, '/pages');
  define("SERVER_BASE", substr($local, strlen($docRoot), $tail - strlen($docRoot)));
  define("SERVER_BASE_URI", $_SERVER['SERVER_NAME'].SERVER_BASE);
  
 /**
  * base path of javascript files
  */
  define('JSCONFIG_BASE', SERVER_BASE.'/js');
  
  /**
   * version
   */
  define('VERSION', "1.0");
  
  /**
   * database params
   */
   define("DB_HOST", "127.0.0.1");
   define("DB_USER", "pweb");
   define("DB_PASSWORD", "pweb");
   define("DB_NAME", "pweb");
   
   /**
    * date timezone
    */
    date_default_timezone_set("GMT");
?>