<?php
  include("config.php");
  session_start();
  if (! isset($_SESSION['user'])) {
    //back to login
    $_SESSION['auth_error'] = "Authentication required";
    header("Location: http://".SERVER_BASE_URI."/pages/index.php");
  }
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
   "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>Graph Designer <?php echo VERSION; ?></title>
  <meta name="author" content="qwattash">
  
  <link rel="stylesheet" type="text/css" href="../css/main.css">
  <link rel="stylesheet" type="text/css" href="../css/button.css">
  <link rel="stylesheet" type="text/css" href="../css/menu.css">
  <link rel="stylesheet" type="text/css" href="../css/explorer.css">
  <script type="text/javascript" src="../js/unilib/base.php"></script>
  <script type="text/javascript" src="../js/explorer_utils.js"></script>
  <script type="text/javascript" src="../js/login_utils.js"></script>
</head>
<body>
  <div class="header">
    <div class="title"><h2>Your Graphs</h2></div>
    <div id="logout_button" class="in_button" onclick="logout()"><span class="menu_text">Logout</span></div>
  </div>
  <div class="block_container">
    <div>
      <ul class="menu">
        <li id="menu_new" class="item in_button">
          <span class="command_name">Create New Project</span>
        </li>
      </ul>
    </div>
    <div class="file_list_container">
      <div id="file_list_empty_message">You have no projects, create one to get started!</div>
      <ul id="file_list" class="file_list">
      <?php
        $conn = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) or die(mysql_error());
        mysql_select_db(DB_NAME, $conn);
        $query_select = "SELECT id, name, date FROM projects WHERE owner='%s'";
        $query = sprintf($query_select, $_SESSION['user']);
        $handle = mysql_query($query);
        while ($handle && $row = mysql_fetch_assoc($handle)) {
      ?>
        <li class="file"
            id="<?php echo "prefix_".$row['id']; ?>">
          <span class="icon file_icon">
          </span>
          <span class="file_name"><?php echo $row['name']; ?></span>
          <ul class="menu">
            <li class="item in_button" onclick="openProject(this);">
              <span class="command_name">Open</span>
            </li>
            <li class="item in_button" onclick="deleteProject(this);">
              <span class="command_name">Delete</span>
            </li>
          </ul>
          <span class="file_date"><?php echo $row['date']; ?></span>
        </li>    
      <?php
        }
      ?>
      </ul>
    </div>
  </div>
  <div id="prompt_popup">
    <h3>Create New Project</h3>
    <div id="prompt_popup_error_field"></div>
    <input 
      id="prompt_popup_name_field" 
      type="text" 
      class="in_text" 
      value="Name"
      onfocus="inputFocus(this);"
      onblur="inputBlur(this);">
  </div>
  <div id="error_popup">
    <h3>Error</h3>
    <div id="error_popup_error_field"></div>
  </div>
</body>
</html>
<?php
  session_write_close();
?>