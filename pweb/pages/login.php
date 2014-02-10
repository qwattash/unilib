<?php

include("config.php");

/**
 * get form data and check user identity
 * Note that the DB api is deprecated, PDO should be
 * used instead
 */
function failure() {
  header("Location: http://".SERVER_BASE_URI."/pages/index.php");
}

function success() {
  header("Location: http://".SERVER_BASE_URI."/pages/explorer.php");
}

if (!isset($_POST['user']) || !isset($_POST['pwd'])) {
  failure();  
}
else {
  session_start();
  $_SESSION['auth_attempt_user'] = $_POST['user'];
  $_SESSION['auth_attempt_pwd'] = $_POST['pwd'];
  //connect to DB
  $conn = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) or die(mysql_error());
  mysql_select_db(DB_NAME, $conn);
  //the following prevent sqli
  $safe_name = mysql_real_escape_string($_POST['user']);
  //get user with given name
  $handle = mysql_query("SELECT password FROM users WHERE name='".$safe_name."'");
  if ($handle) {
    $pwd_row = mysql_fetch_row($handle);
    $pwd = $pwd_row[0];
    //now test the password against the hash
    //extract salt
    $salt = substr($pwd, 0, strpos($pwd, ':'));
    $challenge = substr($pwd, strpos($pwd, ':') + 1);
    //ripemd256 is used because according to wikipedia it
    //is not vulnerable to collision, first and second
    //preimage
    $hash = hash("ripemd256", $salt.$_POST['pwd']);
    if ($hash == $challenge) {
      //set user session and bring him to the profile page
      $_SESSION['user'] = $safe_name;
      unset($_SESSION['auth_attempt_user']);
      unset($_SESSION['auth_attempt_pwd']);
      unset($_SESSION['auth_error']);
      success();
    }
    else {
      //back to login
      $_SESSION['auth_error'] = "Invalid username or password";
      failure();
    }
  }
  else {
    $_SESSION['auth_error'] = "Invalid username or password";
    failure();
  }
  session_write_close();
}





?>