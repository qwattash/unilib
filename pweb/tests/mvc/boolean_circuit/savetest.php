<?php

session_start();

if (!isset($_SESSION['saved'])) {
  $_SESSION['saved'] = "NULL";
}

if (isset($_REQUEST['command']) && $_REQUEST['command'] == 'save') {
  $_SESSION['saved'] = $_REQUEST['graph_model'];
}
else {
  echo $_SESSION['saved'];
}

session_write_close();

?>