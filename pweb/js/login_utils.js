/*
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

/*
 * focus event clear the default content
 * @param {DOMElement} elem
 */
function inputFocus(elem) {
  if (elem.value == elem.defaultValue) {
    elem.value = "";
  }
}

/*
 * focus event for the password field, replace dummy field with another
 * @param {DOMElement} elem
 * @param {string} other
 */
function pwdFocus(elem, other) {
  /*
  if (elem.value == elem.defaultValue || elem.value == "") {
    elem.value = "";
    elem.type = "password";
  }
  */
  
}

/*
 * blur or focus password field and replace it with given generic input
 * @param {DOMElement} dummy
 */
function pwdDummySwap(dummy) {
  var real = document.getElementById("real_in_pwd");
  dummy.style.display = "none";
  real.style.display = "inline";
  real.focus();
}

/*
 * blur or focus password field and replace it with given generic input
 * @param {DOMElement} real
 */
function pwdRealSwap(real) {
  if (real.value == real.defaultValue || real.value == "") {
    real.value = "";
  var dummy = document.getElementById("dummy_in_pwd");
  real.style.display = "none";
  dummy.style.display = "inline";
  }
}

/*
 * submit form
 * @param {string} formID
 * @param {string} url
 */
function formSubmit(formID, url) {
  var form = document.getElementById(formID);
  form.action = url;
  form.submit();
}
