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
<link rel="stylesheet" type="text/css" href="../css/main.css"/>
<link rel="stylesheet" type="text/css" href="../css/button.css"/>
<link rel="stylesheet" type="text/css" href="../css/menu.css"/>
<link rel="stylesheet" type="text/css" href="../css/editor.css"/>
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
      <li class="item in_button" onclick="save();"><span class="menu_text">Save</span></li>
      <li class="item in_button" onclick="logout();"><span class="menu_text">Logout</span></li>
    </ul>
  </div>
  <div id="canvas_container" class="block_container">
    <div id='container' class='canvas'></div>
  </div>
</body>
</html>
<?php
  session_write_close();
?>
