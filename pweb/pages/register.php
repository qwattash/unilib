<?php

  include("config.php");

  function failure() {
    header("Location: http://".SERVER_BASE_URI."/pages/index.php");
  }
  
  function success() {
    header("Location: http://".SERVER_BASE_URI."/pages/explorer.php");
  }

  if (!isset($_POST['user']) || !isset($_POST['pwd'])) {
    failure();  
  }
  session_start();
  $_SESSION['auth_attempt_user'] = $_POST['user'];
  $_SESSION['auth_attempt_pwd'] = $_POST['pwd'];
  //connect to DB
  $conn = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) or die(mysql_error());
  mysql_select_db(DB_NAME, $conn);
  //the following prevent sqli
  $safe_name = mysql_real_escape_string($_POST['user']);
  //get user with given name
  $handle = mysql_query("SELECT * FROM users WHERE name='".$safe_name."'");
  $matches = mysql_affected_rows();
  if ($matches == 0) {
    //store username and password
    //generate salt
    srand();
    $salt = rand();
    $challenge = hash("ripemd256", $salt.$_POST['pwd']);
    $pwd = $salt.":".$challenge;
    mysql_query("INSERT INTO users (name, password) VALUES ('".$safe_name."','".$pwd."')");
    //set user session and bring him to the profile page
    $_SESSION['user'] = $safe_name;
    unset($_SESSION['auth_attempt_user']);
    unset($_SESSION['auth_attempt_pwd']);
    unset($_SESSION['auth_error']);
    success();
  }
  else {
    //back to login
    $_SESSION['auth_error'] = "Username already exists";
    failure();
  }  
  session_write_close();
?>