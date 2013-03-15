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
 * configuration section to be modified at deployment
 * @type {Object}
 */
unilib.config = {
  jsBase: 'http://localhost/eclipse/pweb.git/pweb/js/'
};

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
 * keep track of included files
 * @type {Array.<string>}
 * @private
 */
unilib.included_ = [];

/**
 * load an additional script
 * @param {string} path path to include
 * @param {string} [base] optional base path, default unilib.config.jsBase
 * @param {function} [callback] callback to execute one script is loaded
 */
unilib.include = function(path, base, callback) {
  if (document.readyState != 'complete') {
  	//assign defaults
    base = base || unilib.config.jsBase;
    callback = callback || function() {};
    //build include path
    var fullPath = (base.charAt(base.length - 1) == '/') ? base : base + '/';
    fullPath += (path.charAt(0) == '/') ? path.substring(1) : path;
    if (unilib.included_.indexOf(fullPath) == -1) {
    	var script = document.createElement('script');
    	script.setAttribute('type', 'text/javascript');
    	script.setAttribute('src', fullPath);
    	script.onload = unilib.createCallback(null, unilib.scriptLoaded_, [fullPath]);
    	document.head.appendChild(script);
      unilib.loadCallbacks_[fullPath] = callback;
      unilib.included_.push(fullPath);
    }
  }
  else {
    throw Error('Cannot load resource, lazy loading not yet supported');
  }
};

/**
 * map callbacks to included files
 * @type {Object}
 * @private
 */
unilib.loadCallbacks_ = {};

/**
 * invoke right callback once file is loaded
 * @param {string} path
 * @private
 */
unilib.scriptLoaded_ = function(path) {
  //do init stuff
  var item = unilib.loadCallbacks_[path];
  //call relative callback
  item.call();
  delete unilib.loadCallbacks_[path];
};

/**
 * holds informations about a group of scripts
 * @constructor
 */
unilib.IncludeGroup = function() {
	/** group callback to be called when all scripts in the group are loaded
	 * @type {function}
	 */
	this.callback = function() {};
	/** number of scripts in the group
	 * @type {Array.<Array.<string>>}
	 * @private
	 */
	this.scripts_ = [];
	/** number of scripts loaded
	 * @type {number}
	 * @private
	 */
	this.loaded_ = 0;
};

/**
 * callback that notify loading of a script
 * @private
 */
unilib.IncludeGroup.prototype.scriptLoaded_ = function() {
	this.loaded_++;
	if (this.loaded_ == this.scripts_.length) {
		//call group callback
		this.callback.call();
	}
};

/**
 * register script to load
 * @param {string} path @see unilib#include
 * @param {string} base @see unilib#include
 */
unilib.IncludeGroup.prototype.addScript = function(path, base) {
	var item = [path, base];
	this.scripts_.push(item);
};

/**
 * include all scripts currently registered to the group
 */
unilib.IncludeGroup.prototype.include = function() {
	for (var i = 0; i < this.scripts_.length; i++) {
		unilib.include(this.scripts_[i][0], this.scripts_[i][1], 
				unilib.createCallback(this, this.scriptLoaded_));
	}
};

/**
 * create an include group, this permits to execute a callback after all
 * 	scripts in the group have finished
 * @param {function} [callback]
 * @returns {unilib.IncludeGroup}
 */
unilib.createIncludeGroup = function(callback) {
	var grp = new unilib.IncludeGroup();
	grp.callback = callback;
	return grp;
};

/**
 * create a function invoking a particular method of an object with given args
 * 	useful for creating callback functions without messing with variables and
 * 	object references
 * @param {?Object} object "this" object
 * @param {function} method method to call
 * @param {?Array} args parameters of the method as passed to method.apply() 
 */
unilib.createCallback = function(object, method, args) {
	return function() {
		method.apply(object, args);
	};
};