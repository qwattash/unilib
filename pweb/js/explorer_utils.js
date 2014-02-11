/**
 * @author qwattash (Alfredo Mazzinghi)
 */

unilib.include("unilib/UI/popup.js");
unilib.include("unilib/ajax/ajax.js");

/*
 * utility function used to add files to the file list
 * @param {number} id id of the file
 */
function createFileListEntry(id, name, date) {
  var list = document.getElementById("file_list");
  //do this manually because IE8 doesn't like parsing it
  //from a string and appending to the DOM
  var li = document.createElement("li");
  li.setAttribute("id", id);
  li.setAttribute("class", "file");
  //icon span inside the li
  var spanIcon = document.createElement("span");
  spanIcon.setAttribute("class", "icon file_icon");
  li.appendChild(spanIcon);
  //file name span
  var spanName = document.createElement("span");
  spanName.setAttribute("class", "file_name");
  spanName.appendChild(document.createTextNode(name));
  li.appendChild(spanName);
  //submenu
  var ulMenu = document.createElement("ul");
  ulMenu.setAttribute("class", "menu");
  var liOpen = document.createElement("li");
  liOpen.setAttribute("class", "item in_button");
  liOpen.setAttribute("onclick", "openProject(this)");
  var liOpenSpan = document.createElement("span");
  liOpenSpan.setAttribute("class", "menu_command");
  liOpenSpan.appendChild(document.createTextNode("Open"));
  liOpen.appendChild(liOpenSpan);
  ulMenu.appendChild(liOpen);
  var liDel = document.createElement("li");
  liDel.setAttribute("class", "item in_button");
  liDel.setAttribute("onclick", "deleteProject(this)");
  var liDelSpan = document.createElement("span");
  liDelSpan.setAttribute("class", "menu_command");
  liDelSpan.appendChild(document.createTextNode("Delete"));
  liDel.appendChild(liDelSpan);
  ulMenu.appendChild(liDel);
  li.appendChild(ulMenu);
  //date span
  var spanDate = document.createElement("span");
  spanDate.setAttribute("class", "file_date");
  spanDate.appendChild(document.createTextNode(date));
  li.appendChild(spanDate);
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
