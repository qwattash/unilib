<?php
  include("config.php");
  /**
   * check if a new project with given name can be created
   */
  session_start();
   
  if (!isset($_SESSION['user'])) {
     header('HTTP/1.1 401 Unauthorized', true, 401);
  }
  else {
    //connect to DB
    $conn = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) or die(mysql_error());
    mysql_select_db(DB_NAME, $conn);
    //the following prevent sqli
    $safe_name = mysql_real_escape_string($_GET['name']);
    if ($_GET['command'] == "create") {
      //check if the name is free
      $query_select = "SELECT * FROM projects WHERE owner='%s' AND name='%s'";
      $query = sprintf($query_select, $_SESSION['user'], $safe_name);
      $handle = mysql_query($query);
      if (mysql_affected_rows() == 0) {
        //add project to DB
        $query_insert = "INSERT INTO projects (name, date, owner) VALUES ('%s', '%s', '%s')";
        $query = sprintf($query_insert, $safe_name, date("Y-m-d H:i:s"), $_SESSION['user']);
        mysql_query($query);
        $query = sprintf($query_select, $_SESSION['user'], $safe_name);
        $handle = mysql_query($query);
        if ($handle && $row = mysql_fetch_assoc($handle)) {
          echo "SUCCESS:".$_GET['name'].",".$row['id'].",".$row['date'];
        }
        else {
          echo "Internal Error";
        }
      }
      else {
        echo "ERROR:Project with same name already exists.";
      }
    }
    else if ($_GET['command'] == "delete") {
      $query_delete = "DELETE FROM projects WHERE owner='%s' AND id='%s'";
      $query = sprintf($query_delete, $_SESSION['user'], $safe_name);
      $result = mysql_query($query);
      echo $result;
    }
  }
  session_write_close();
?>