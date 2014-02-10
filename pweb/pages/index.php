<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
   "http://www.w3.org/TR/html4/strict.dtd">
<?php
  include("config.php");
  session_start();
?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Graph Designer <?php echo VERSION; ?></title>
	<meta name="author" content="qwattash" />
	<!-- Date: 2013-02-06 -->
	<link rel="stylesheet" type="text/css" href="../css/main.css"/>
	<link rel="stylesheet" type="text/css" href="../css/button.css"/>
	<link rel="stylesheet" type="text/css" href="../css/login.css"/>
	<script type="text/javascript" src="../js/login_utils.js"></script>
</head>
<body>
<div class="block_container title_block">
  <h2>Design tool for boolean circuits</h2>
</div>
<div class="block_container main_block">
  <div class="tile_row">
    <div class="tile tile_author tile_blue">
      <div class="tile_content">
        <h2>Author</h2>
        <p>
          This application has been created by Alfredo Mazzinghi for the web programming module at the University of Pisa.
          The software comes with no warranty whatsoever, under the MIT License.
        </p>
      </div>
    </div>
    <div class="tile tile_form tile_orange">
      <div class="tile_content">
        <!-- form action is set by the formSubmit callback -->
        <form id="login_form" class="login_form" action="" method="POST">
          <ul>
            <li>
              <div class="error"><?php 
                if (isset($_SESSION['auth_error'])) {
                  echo $_SESSION['auth_error'];
                  unset($_SESSION['auth_error']);
                }
                ?>
              </div>
            </li>
            <li>
              <input 
                onfocus="inputFocus(this);" 
                onblur="inputBlur(this);" 
                class="in_text" 
                type="text"
                name="user" 
                value=<?php 
                  if (isset($_SESSION['auth_attempt_user']) && $_SESSION['auth_attempt_user'] != "") {
                    echo $_SESSION['auth_attempt_user'];
                  }
                  else {
                    echo "User";
                  }
                ?> 
                tabindex="1"/>
            </li>
            <li>
              <input 
                onfocus="inputFocus(this); pwdFocus(this);" 
                onblur="inputBlur(this);" 
                class="in_text" 
                type="text" 
                name="pwd" 
                value=<?php 
                  if (isset($_SESSION['auth_attempt_pwd']) && $_SESSION['auth_attempt_pwd'] != "") {
                    echo $_SESSION['auth_attempt_pwd'];
                  }
                  else {
                    echo "Password";
                  }
                ?> 
                tabindex="2"/>
            </li>
            <li>
              <input 
                class="in_button" 
                type="button" 
                value="Login" 
                tabindex="3" 
                onclick="formSubmit('login_form', 'login.php')"/>
              <input 
                class="in_button" 
                type="button" 
                value="Signup" 
                tabindex="4" 
                onclick="formSubmit('login_form', 'register.php')"/>
            </li>
          </ul>
        </form>
      </div>
    </div>
    <div class="tile tile_doc tile_green">
      <div class="tile_content">
        <h2>Documentation</h2>
        <ul>
          <li><a href="../tests/index.php">Testing</a></li>
          <li><a href="">JsDoc</a></li>
        </ul>
      </div>
    </div>
  </div>
</div>
</body>
</html>
<?php
  session_write_close();
?>