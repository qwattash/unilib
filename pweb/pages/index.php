<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
   "http://www.w3.org/TR/html4/strict.dtd">
<?php
  include("config.php");
  session_start();
?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>Graph Designer <?php echo VERSION; ?></title>
	<meta name="author" content="qwattash">
	<!-- Date: 2013-02-06 -->
	<link rel="stylesheet" type="text/css" href="../css/main.css">
	<link rel="stylesheet" type="text/css" href="../css/button.css">
	<link rel="stylesheet" type="text/css" href="../css/login.css">
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
          The software comes with no warranty whatsoever, under the GPL License.
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
                value="<?php 
                  if (isset($_SESSION['auth_attempt_user']) && $_SESSION['auth_attempt_user'] != "") {
                    echo $_SESSION['auth_attempt_user'];
                    unset($_SESSION['auth_attempt_user']);
                  }
                  else {
                    echo "User";
                  }
                ?>"
                tabindex="1">
            </li>
            <li>
              <input 
                id="real_in_pwd"
                onblur="pwdRealSwap(this)"
                class="in_text"
                type="password"
                name="pwd"
                value="<?php 
                  if (isset($_SESSION['auth_attempt_pwd']) && $_SESSION['auth_attempt_pwd'] != "") {
                    echo ""; //$_SESSION['auth_attempt_pwd'];
                    unset($_SESSION['auth_attempt_pwd']);
                  }
                ?>"
                tabindex="2">
              <input 
                id="dummy_in_pwd"
                onfocus="pwdDummySwap(this);"  
                class="in_text" 
                type="text" 
                name="dummy" 
                value="Password"
                tabindex="2">
            </li>
            <li>
              <input 
                class="in_button" 
                type="button" 
                value="Login" 
                tabindex="3" 
                onclick="formSubmit('login_form', 'login.php')">
              <input 
                class="in_button" 
                type="button" 
                value="Signup" 
                tabindex="4" 
                onclick="formSubmit('login_form', 'register.php')">
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
        </ul>
      </div>
    </div>
  </div>
  <div class="tile_row tile_row_description">
    <div class="tile tile_description tile_blue">
      <div class="tile_content">
        <h2>Usage and Scope</h2>
        <p>
          The scope of the project is to provide a fairly extensible system, based on the model-view-controller pattern, that
          enables the creation and editing of graphs while abstracting from the representation system. For example it may
          be possible to render the graph to an HTML5 canvas only by changing a component in the software. The graph chosen
          for the demonstration represents a boolean circuit, the software provides the creation, editing and saving of 
          boolean circuit models using a context-menu based navigation approach.
        </p>
        <p>
          The UI has been kept simple both to avoid to put too much burden into the event handling architecture, that is the
          part that has the most questionable architecture (in other words could have been better organised).
          The software is fairly intuitive to use, once you signup or log in you can create a new project and open it.
        </p>
        <p>
          The editor interface is accessed by right-clicking on the "canvas", this will open a submenu that enables the
          creation of nodes, similarly other context menus are used to define specific actions on each element.
          To link two pins it is necessary to select both of them by holding the shift key during the selection and then chose
          link form the context menu.
          Additionally arrows can be used to move the elements, this may give better precision in some circumstances.
        </p>
      </div>
    </div>
  </div>
</div>
</body>
</html>
<?php
  session_write_close();
?>