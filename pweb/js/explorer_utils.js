/**
 * @author qwattash (Alfredo Mazzinghi)
 */

unilib.include("unilib/UI/popup.js");
unilib.include("unilib/ajax/ajax.js");

/**
 * utility function used to add files to the file list
 * @param {number} id id of the file
 */
function createFileListEntry(id, name, date) {
  var list = document.getElementById("file_list");
  var xmlString = 
  "<li id='" + id + "' class='file'>" +
    "<span class='icon file_icon'></span>" + 
    "<span class='file_name'>" + name + "</span>" +
    "<ul class='menu'>" +
      "<li class='item in_button'>" +
        "<span class='menu_command'>Open</span>" +
      "</li>" + 
      "<li class='item in_button'>" +
        "<span class='menu_command'>Delete</span>" +
      "</li>" +
    "</ul>" +
    "<span class='file_date'>" + date + "</span>" +
  "</li>";
  var parser = new DOMParser();
  var item = parser.parseFromString(xmlString, "text/html");
  var li = item.getElementsByTagName("li")[0];
  list.appendChild(li);
}

var init = function () {
  /*
   * initialisation code is run as soon as unilib has finished loading
   */
  var container = document.getElementById("prompt_popup");
  var popup = new unilib.ui.PromptPopup(container, "in_button");
  
  var createNewProject = function() {
    var request = new unilib.ajax.Request("project.php",
      unilib.ajax.Method.GET, 
      new unilib.ajax.NOPSerializer());
    request.addEventListener(
      unilib.ajax.ResponseStatus.COMPLETE,
      function (status, code, data) {
        var separator = data.indexOf(":");
        var responseCode = data.substr(0, separator);
        var message = data.substr(separator + 1);
        if (responseCode == "SUCCESS") {
          //ok, create entry
          var fields = message.split(",");
          var name = fields[0];
          var id = fields[1];
          var date = fields[2];
          createFileListEntry(id, name, date);
        }
        else {
          //error message
          var errorField = document.getElementById("prompt_popup_error_field");
          if (errorField.firstChild == null) {
            errorField.appendChild(document.createTextNode(""));
          }
          errorField.firstChild.nodeValue = message;
          popup.show();
        }
      }
    );
    request.addEventListener(
      unilib.ajax.ResponseStatus.ERROR,
      function (status, code, data) {
        var errorField = document.getElementById("prompt_popup_error_field");
        if (errorField.firstChild == null) {
          errorField.appendChild(document.createTextNode(""));
        }
        errorField.firstChild.nodeValue = data;
        popup.show();
      }
    );
    projectName = document.getElementById("prompt_popup_name_field").value;
    request.send({
      command: "create",
      name: projectName
    });
  };
  
  popup.bind("click", document.getElementById("menu_new"));
  popup.addEventListener(unilib.ui.PopupCode.OK, createNewProject);
  popup.addEventListener(unilib.ui.PopupCode.CANCEL, 
    function() {
      var errorField = document.getElementById("prompt_popup_error_field");
        if (errorField.firstChild == null) {
            errorField.appendChild(document.createTextNode(""));
        }
        else {
          errorField.firstChild.nodeValue = "";
        }
    });
  //if the file list is empty enable the empty message
  if (document.getElementById('file_list').getElementsByTagName("li").length == 0) {
    var msg = document.getElementById("file_list_empty_message");
    msg.style.visibility = "visible";
  }
};

/*
 * other functions for menu handling
 */

function openProject(item) {
  var fileID = item.parentNode.parentNode.getAttribute("id");
  var lastSeparator = location.href.lastIndexOf("/");
  var base = location.href.substr(0, lastSeparator);
  location.href = base + "/editor.php?edit=" + fileID;
};

function deleteProject(item) {
  if (unilib && unilib.ajax) {
    var fileID = item.parentNode.parentNode.getAttribute("id");
    var request = new unilib.ajax.Request("project.php",
      unilib.ajax.Method.GET, new unilib.ajax.NOPSerializer());
    request.addEventListener(unilib.ajax.ResponseStatus.COMPLETE, 
      function(status, code, data) {
        var button_list = item.parentNode;
        var file_list_item = button_list.parentNode;
        var file_list = file_list_item.parentNode;
        file_list.removeChild(file_list_item);
        if (file_list.getElementsByTagName("li").length == 0) {
          var msg = document.getElementById("file_list_empty_message");
          msg.style.visibility = "visible";
        }
      });
    request.addEventListener(unilib.ajax.ResponseStatus.ERROR,
      function(status, code, data) {
        var errorPopup = document.getElementById("error_popup");
        var errorField = errorPopup.getElementById("error_popup_error_field");
        errorField.firstChild.nodeValue = data;
        var popup = new unilib.ui.Popup(errorPopup);
        popup.show();
      });
    request.send({
      command: "delete",
      name: fileID
    });
  }
};

/*
 * logout callback from menu
 */
function logout() {
  var lastSeparator = location.href.lastIndexOf("/");
  var base = location.href.substr(0, lastSeparator);
  location.href = base + "/logout.php";
}

unilib.dependencyManager.addEventListener("load", init);
