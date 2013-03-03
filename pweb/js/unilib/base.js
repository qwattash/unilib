/**
 * @fileOverview provide dependency and namespace handling
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 * @version 1.0
 */

/*
 * Note: in future versions may be introduced a more powerful
 * dependency handling system such as
 * the one provided by the google closure library
 */

/**
 * base namespace for the unilib library
 * @namespace unilib
 */
var unilib = {};

/**
 * create new namespace
 * @param {string} name
 */
unilib.provideNamespace = function(name){
  //provide name
  var parts = name.split('.');
  var current = window; //global scope
  for (var i = 0; i < parts.length; i++) {
    current[parts[i]] = current[parts[i]] || {};
    current = current[parts[i]];
  }
};

/**
 * configuration section
 * @type {Object}
 */
unilib.config = {
  jsBase: 'js/'
};

/**
 * load an additional script
 * @param {string} path path to include
 * @param {string} [base] optional base path, default unilib.config.jsBase
 */
unilib.include = function(path, base) {
  if (document.readyState != 'complete') {
    base = base || unilib.config.jsBase;
    var fullPath = (base.charAt(base.length - 1) == '/') ? base : base + '/';
    fullPath += (path.charAt(0) == '/') ? path.substring(1) : path;
    document.write('<script language = "javascript" src = "' + fullPath + '"></script>');
  }
  else {
    throw Error('Cannot load resource, lazy loading not yet supported');
  }
};
