<?php

include("config.php");
session_start();
  if (! isset($_SESSION['user'])) {
    header('HTTP/1.1 401 Unauthorized', true, 401);
  }
  else if (! isset($_POST['token'])) {
    header('HTTP/1.1 400 Bad Request', true, 400);
  }
  
  $conn = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) or die(mysql_error());
  mysql_select_db(DB_NAME, $conn);
  $safe_id = mysql_real_escape_string($_POST['token']);
  $safe_command = mysql_real_escape_string($_POST['command']);
  if ($safe_command == "save") {
    $safe_data = mysql_real_escape_string($_POST['graph_model']);
    $query_update = "UPDATE projects SET data='%s', date='%s' WHERE owner='%s' AND id='%s'";
    $query = sprintf($query_update, $safe_data, date("Y-m-d H:i:s"), $_SESSION['user'], $safe_id);
    $handle = mysql_query($query);
  }
  else if ($safe_command == "load") {
    $query_select = "SELECT data FROM projects WHERE owner='%s' AND id='%s'";
    $query = sprintf($query_select, $_SESSION['user'], $safe_id);
    $handle = mysql_query($query);
    if ($handle) {
      $row = mysql_fetch_row($handle);
      echo $row[0];
    }
  }
  
session_write_close();
?>