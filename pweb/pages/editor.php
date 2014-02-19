<?php
  include("config.php");
  session_start();
  if (! isset($_SESSION['user'])) {
    //back to login
    $_SESSION['auth_error'] = "Authentication required";
    header("Location: http://".SERVER_BASE_URI."/pages/index.php");
  }
  if (! isset($_GET['edit'])) {
    header("Location: http://".SERVER_BASE_URI."/pages/explorer.php");
  }
?>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<link rel="stylesheet" type="text/css" href="../css/main.css">
<link rel="stylesheet" type="text/css" href="../css/button.css">
<link rel="stylesheet" type="text/css" href="../css/menu.css">
<link rel="stylesheet" type="text/css" href="../css/editor.css">
<title>Graph Designer <?php echo VERSION; ?></title>
<script type="text/JavaScript" src="../js/unilib/base.php"></script>
<script type="text/javascript">
  /**
   * id of the project currently edited
   * @type {number}
   */
  var CURRENT_PROJECT_ID = <?php echo $_GET['edit']; ?>;
</script>
<script type="text/JavaScript" src="../js/editor_util.js"></script>
</head>
<body>
  <noscript>
    The editor can not be run with javascript disables, please enable javascript.
  </noscript>
  <div class="header">
    <div class="title">
      <h2>
        <?php 
          $conn = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) or die(mysql_error());
          mysql_select_db(DB_NAME, $conn);
          $safe_id = mysql_real_escape_string($_GET['edit']);
          $query_select = "SELECT name, date FROM projects WHERE owner='%s' AND id='%s'";
          $query = sprintf($query_select, $_SESSION['user'], $safe_id);
          $handle = mysql_query($query);
          if ($handle) {
            $row = mysql_fetch_assoc($handle);
            echo $row['name'];
          }
          else {
            echo "Error, the requested project could not be found.";
          }
        ?>
      </h2>
    </div>
    <ul id="header_menu" class="menu">
      <li class="item in_button" id="menu_help"><span class="menu_text">Help</span></li>
      <li class="item in_button" onclick="save();"><span class="menu_text">Save</span></li>
      <li class="item in_button" onclick="logout();"><span class="menu_text">Logout</span></li>
    </ul>
  </div>
  <div id="canvas_container" class="block_container">
    <div id='container' class='canvas'></div>
  </div>
  <div id="help_popup">
    <h2>Help</h2>
    <p>
      <h3>Creating an element</h3>
      To create an elment right click on the canvas and select "create node" from the context menu, then
      select the desired element to create.
    </p>
    <p>
      <h3>Selecting multiple elements</h3>
      To select more than one element hold the "shift" key and select the elements using the left click.
    </p>
    <p>
      <h3>Connect two elements</h3>
      Two elements can be connected by selecting two pins and then right clicking on one of them and
      selecting the "link" option. Note that if two input or output pins are selected they will not
      be connected since it would be an error.
    </p>
    <p>
      <h3>Delete an element</h3>
      To delete an element right click on it and select the "delete" command.
    </p>
    <p>
      <h3>Moving an element</h3>
      An element can be moved by dragging it with the mouse. It is also possible to select one or more
      elements and move them using the arrow keys.
    </p>
    <p>
      <h3>Save the project</h3>
      The project can be saved by clicking the "save" button or by chosing the "save" option in the
      context menu that is opened with the right click.
    </p>
  </div>
</body>
</html>
<?php
  session_write_close();
?>
