/**
 * @fileOverview provide dependency and namespace handling
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 * @version 1.0
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

/*
 * dependency system handling
 * use a LIFO queue to queue callbacks and init everything on document.onload()
 */

/**
 * group private dependency handling functions and variables
 * @type {object}
 * @private
 */
unilib.dependencyManager_ = {
		/** LIFO queue of callbacks
		 * @type {Array.<function>}
		 * @private
		 */
		callbackQueue_: [],
		/**
		 * add callback to callbackQueue_
		 * @param {function} callback callback function to add
		 */
		addCallback: function(callback) {
			this.callbackQueue_.push(callback);
		},
		/**
		 * execute all callbacks in the queue, users should not call this function
		 */
		execute: function() {
			for (var i = 0; i < this.callbackQueue_.length; i++) {
				this.callbackQueue_[i].call();
			}
			//free array
			this.callbackQueue_ = [];
		}
};

/**
 * export all symbols in source into given namespace
 * @param {object} source object containing symbols to export
 * @param {object} namespace namespace where to export to
 */
unilib.exportNamespace = function(source, namespace) {
	for (var symbol in source) {
		namespace[symbol] = source[symbol];
	}
};

/** @todo name of the function is temporary
 * create new namespace, import dependencies and call init callback
 * @param {string} name name of the namespace i.e. 'unilib.myNamespace'
 * @param {object} body namespace definition as an object to be exported 
 * 	in the global scope as 'name'
 * @param {function} init initialization callback for the namespace, called 
 * 	after all dependencies are loaded, parsed and initialized
 * @param {Array.<Array.<string>>} [deps] dependencies of the namespace as 
 * 	[path, base], where base is nullable, @see unilib#include
 */
unilib.provideNamespace = function(name, body, init, deps) {
	if (deps) {
		for (var i = 0; i < deps.length; i++) {
			unilib.include(deps[i][0], deps[i][1]);
		}
	}
	unilib.dependencyManager_.addCallback(init);
	//provide name
  var parts = name.split('.');
  var current = window; //global scope
  for (var i = 0; i < parts.length; i++) {
    current[parts[i]] = current[parts[i]] || {};
    current = current[parts[i]];
  }
  unilib.exportNamespace(body, current);
};

/**
 * keep track of included files to avoid repeated inclusions
 * @type {Array.<string>}
 * @private
 */
unilib.included_ = [];

/**
 * load an additional script
 * @param {string} path path to include
 * @param {string} [base] optional base path, default unilib.config.jsBase
 * @param {function} [callback] callback to execute one script is loaded,
 * 	useful if including a script manually, when not using more powerful
 * 	unilib functions such as unilib.provideNamespace
 */
unilib.include = function(path, base, callback) {
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

/*
 * Event listeners helpers
 */

/*
 * event handling Xbrowser primitives
 */
/**
 * add event listener to object (IE8+)
 * @param {Object} element DOM element where to add listener
 * @param {string} eventType event type string
 * @param {function} listener listener to add
 */
unilib.addEventListener = function(element, eventType, listener) {
	try {
		element.addEventListener(eventType, listener);
	}
	catch (e) {
		try {
		element.attachEvent('on' + eventType, listener);
		}
		catch (e) {
			throw new Error('Unableto add event listener ' + eventType + 
					' to ' + element.toString());
		}
	}
};

/**
 * remove event listener from object (IE8+)
 * @param {Object} element DOM element from which remove listener
 * @param {string} eventType event type string
 * @param {function} listener listener to remove
 */
unilib.removeEventListener = function(element, eventType, listener) {
	try {
		element.removeEventListener(eventType, listener);
	}
	catch (e) {
		try {
		element.detachEvent('on' + eventType, listener);
		}
		catch (e) {
			throw new Error('Unableto add event listener ' + eventType + 
					' to ' + element.toString());
		}
	}
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
		if (!args) args = arguments;
		method.apply(object, args || arguments);
	};
};

/**
 * helper class that handle multiple callbacks of the same type on an element
 * @constructor
 * @param {Object=} element DOM element to register to
 * @param {string=} type callback type to handle, 
 * 	MUST be given if element is specified
 */
unilib.CallbackGroup = function(element, type) {
	/** callbacks of this group are attached to this element
	 * @type {Object}
	 * @private
	 */
	this.element_ = element || null;
	/** type of the callbacks in the group
	 * @type {string}
	 * @private
	 */
	this.type_ = type || null;
	/** callbacks list
	 * @type {Array.<function(event=)>}
	 * @private
	 */
	this.callbacks_ = [];
	/** callback attached to this.element_
	 * @type {function}
	 */
	this.generatedCallback_ = null;
	//if an element is specified subscribe to it.
	if (element && type) this.subscribe();
};

/**
 * add a callback to the group
 * @param {function(event=)} callback callback to add
 * @param {number} order integer index of the callback array 
 * 	where to insert callback, negative indexes are treated as
 * 	beginning from the bottom; indexes with modulus greater than
 * 	callbacks number are treated as maximum length allowed
 */
unilib.CallbackGroup.prototype.attach = function(callback, order) {
	//avoid duplicates
	this.detach(callback);
	var sign = (order < 0) ? -1 : +1;
	if (Math.abs(order) >= this.callbacks_.length) {
		order = sign * this.callbacks_.length;
	}
	this.callback_.splice(order, 0, callback);
};

/**
 * remove callback from group
 * @param {function(event=)} callback callback to remove
 */
unilib.CallbackGroup.prototype.detach = function(callback) {
	var index = this.callbacks_.indexOf(callback);
	if (index != -1) {
		this.callbacks_.splice(index, 1);
	}
};

/**
 * subscribe to specified element with given type
 * @param {Object=} element DOMElement to subscribe to
 * @param {type=} type type of events to listen
 */
unilib.CallbackGroup.prototype.subscribe = function(element, type) {
	if (element != this.element_ || type != this.type) {
		this.unsubscribe();
		this.element_ = element || this.element_;
		this.type_ = type || this.type_;
		this.generatedCallback_ = unilib.createCallback(this, this.trigger_);
		unilib.addEventListener(this.element_, this.type_, 
				this.generatedCallback_);
	}
};

/**
 * unsubscribe group from element currently subscribed
 */
unilib.CallbackGroup.prototype.unsubscribe = function() {
	unilib.removeEventLister(this.element_, this.type_, this.generatedCallback_);
};

/**
 * callback attached to element to inform group to call every other callback
 * @param {Object=} event
 * @private
 */
unilib.CallbackGroup.prototype.trigger_ = function(event) {
	
};

//setup code
/*
 * register global load callback to handle include callbacks
 */
unilib.addEventListener(window, 'load', 
		unilib.createCallback(unilib.dependencyManager_, 
				unilib.dependencyManager_.execute));

// functionality extensions for browsers with js version 1.3 (i.e. IE8)
// this is aimed to provide higher version functions to older browsers 
// without compromising efficency and code repetitions in newer ones

if (! Array.prototype.indexOf) {
	//IE 8
	/**
	 * searches the array for the specified item, and returns its position
	 * @param {Object} item item to search
	 * @param {number=} start start index
	 * @returns {number} index of first occurrence or -1
	 */
	Array.prototype.indexOf = function(item, start) {
		for (var i = (start) ? start : 0; i < this.length; i++) {
			if (this[i] === item) return i;
		}
		return -1;
	};
}