<?php
  include("config.php");
  session_start();
  session_destroy();
  header("Location: http://".SERVER_BASE_URI."/pages/index.php");
?>