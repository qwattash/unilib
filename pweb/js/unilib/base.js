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
			if (callback && typeof callback == 'function') {
				this.callbackQueue_.unshift(callback);
			}
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
unilib.copyObject = function(source, destination) {
	for (var symbol in source) {
		destination[symbol] = source[symbol];
	}
};

/** @todo name of the function is temporary
 * create new namespace, import dependencies and call init callback
 * @param {string} name name of the namespace i.e. 'unilib.myNamespace'
 * @param {function} init initialization callback for the namespace, called 
 * 	after all dependencies are loaded, parsed and initialized
 * @param {Array.<Array.<string> || string>=} deps array of dependencies of the
 *  namespace as ["path", "base"] or just "path", 
 *  where base is nullable @see unilib.include
 * @example
 * //no dependencies
 * unilib.provideNamespace("foo", function() {foo.bar = 'baz';});
 * //dependencies: baz in unilib.config.jsBase/baz.js and 
 * //bazbaz in external/path/to/bazbaz.js 
 * unilib.provideNamespace("foo", function() {foo.bar = new baz();}, 
 * 	["baz.js", ["bazbaz.js", "external/path/to/"]]);
 */
unilib.provideNamespace = function(name, init, deps) {
	if (deps) {
		for (var i = 0; i < deps.length; i++) {
			if (typeof deps[i] == 'string' || deps[i] instanceof String) {
				//dependency located in unilib.config.jsBase
				unilib.include(deps[i]);
			}
			else if (deps[i] instanceof Array) {
				//dependency in the form [path, base]
				unilib.include(deps[i][0], deps[i][1]);
			}
			else {
				//not supported, throw exception
				throw new Error("invalid dependency format " + deps[i]);
			}
		}
	}
	//var cbk = unilib.createCallback(body, init);
	unilib.dependencyManager_.addCallback(init);
	//provide name
  var parts = name.split('.');
  var current = window; //global scope
  for (var i = 0; i < parts.length; i++) {
    current[parts[i]] = current[parts[i]] || {};
    current = current[parts[i]];
  }
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
 * Event helpers
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
			throw new Error('Unableto remove event listener ' + eventType + 
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
	 *	WARNING use CallbackGroup.subscribe() CallbackGroup.unsubscribe()
	 *	and do no edit this  directly
	 * @type {Object}
	 */
	this.element = element || null;
	/** type of the callbacks in the group
	 *  WARNING use CallbackGroup.subscribe() CallbackGroup.unsubscribe()
	 *	and do no edit this field directly
	 * @type {string}
	 */
	this.type = type || null;
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

/** first position in CallbackGroup callback list
 * @type {number}
 * @constant
 * @example 
 * var cbg = new CallbackGroup(someEl, someType);
 * cbg.attach(myCallback, CallbackGroup.FIRST);
 */
unilib.CallbackGroup.prototype.FIRST = 0;

/** last position in CallbackGroup callback list
 * @type {number}
 * @constant
 * @example 
 * var cbg = new CallbackGroup(someEl, someType);
 * cbg.attach(myCallback, CallbackGroup.LAST);
 */
unilib.CallbackGroup.prototype.LAST = -1;


/**
 * add a callback to the group
 * @param {function(event=)} callback callback to add
 * @param {number=} position position where to put new callback
 * 	a negative number corresponds to last position,
 * 	default unilib.CallbackGroup.LAST
 */
unilib.CallbackGroup.prototype.attach = function(callback, position) {
	//avoid duplicates
	this.detach(callback);
	//handle default values
	position = (position != undefined) ? position : unilib.CallbackGroup.LAST;
	//handle negative values
	position = (position >= 0) ? position : (this.callbacks_.length);
	this.callbacks_.splice(position, 0, callback);
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
	if (element != this.element || type != this.type) {
		this.unsubscribe();
		this.element = element || this.element;
		this.type = type || this.type;
		this.generatedCallback_ = unilib.createCallback(this, this.trigger_);
		unilib.addEventListener(this.element, this.type, 
				this.generatedCallback_);
	}
};

/**
 * unsubscribe group from element currently subscribed
 */
unilib.CallbackGroup.prototype.unsubscribe = function() {
	unilib.removeEventListener(this.element, this.type, this.generatedCallback_);
};

/**
 * callback attached to element to inform group to call every other callback
 * @param {Object=} event
 * @private
 */
unilib.CallbackGroup.prototype.trigger_ = function(event) {
	for (var i = 0; i < this.callbacks_.length; i++) {
		this.callbacks_[i](event);
	}
};

/**
 * manage CallbackGroups to be accessible from everywhere
 * @type {Object}
 */
unilib.callbackGroupManager = {
 /** CallbackGroup list
	* @type {Array.<unilib#CallbackGroup>}
	* @private
	*/
	groups_: [],
	
	/** 
	 * find group by giving target element and event type
	 * @param {Object} element DOMElement where the group is subscribed
	 * @param {string?} type event type string, if omitted any type match
	 * @returns {Array.<unilib.CallbackGroup>}
	 */
	getGroupWithElement: function(element, type) {
		var match = null;
		for (var i = 0; i < this.groups_.length; i++) {
			if (this.groups_[i].element == element && this.groups_[i].type == type) {
				match = this.groups_[i];
				break;
			}
		}
		return match;
	},
	
	/**
	 * add CallbackGroup to manager
	 * @param {unilib.CallbackGroup} group group to add
	 */
	addGroup: function(group) {
		if (group.element && group.type) {
			if (! this.getGroupWithElement(group.element, group.type)) {
				this.groups_.push(group);
			}
			//else group is already in
		}
		else {
			throw new Error('group has no element or event type, subscribe it before adding');
		}
	},
	
	/**
	 * remove CallbackGroup from manager, this also unsubscribe 
	 * 	the group from its element 
	 * @param {unilib.CallbackGroup} group group to remove
	 */
	removeGroup: function(group) {
		var index = this.groups_.indexOf(group);
		if (index != -1) {
			this.groups_.splice(index, 1);
		}
	},
	
	/**
	 * create CallbackGroup, this is a convenience function that add the
	 * 	group to the manager
	 * @param {Object} element DOMElement to subscribe to
	 * @param {string} type type of the event to listen
	 * @returns {unilib.CallbackGroup} group created
	 */
	createGroup: function(element, type) {
		var group = this.getGroupWithElement(element, type);
		if (group) return group;
		group = new unilib.CallbackGroup(element, type);
		this.groups_.push(group);
		return group;
	}
};

//setup code
/*
 * register global load callback to handle include callbacks
 */
unilib.callbackGroupManager.createGroup(window, 'load').attach(
		unilib.createCallback(unilib.dependencyManager_, 
				unilib.dependencyManager_.execute), unilib.CallbackGroup.FIRST);
		

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