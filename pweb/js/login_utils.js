/**
 * callback on form input that clears it when nothing is
 * inside
 * @param {DOMElement} elem
 */
function inputBlur(elem) {
  if (elem.value == "") {
    elem.value = elem.defaultValue;
    if (elem.type == "password") {
      //back to text input to show the default value
      elem.type = "text";
    }
  }
}

/**
 * focus event clear the default content
 * @param {DOMElement} elem
 */
function inputFocus(elem) {
  if (elem.value == elem.defaultValue) {
    elem.value = "";
  }
}

/**
 * focus event for the password field
 * @param {DOMElement} elem
 */
function pwdFocus(elem) {
  if (elem.value == elem.defaultValue || elem.value == "") {
    elem.value = "";
    elem.type = "password";
  }
}

function formSubmit(formID, url) {
  var form = document.getElementById(formID);
  form.action = url;
  form.submit();
}
