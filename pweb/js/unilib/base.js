/**
 * @fileOverview provide dependency and namespace handling
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 * @version 1.0
 */

/*
 * Note: in future versions may be introduced a more powerful
 * dependency handling system with import support such as
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
 * check if a namespace or object are available
 * this is useful to check that required stuff has been loaded
 * @param {string} name
 * @throws {Error}
 */
unilib.require = function(name){
    var parts = name.split('.');
    current = window; //global scope
    for (var i = 0; i < parts.length; i++) {
      if (!current[parts[i]]) {
        throw Error('Requirement ' + name + ' not available');
      }
    }
};
