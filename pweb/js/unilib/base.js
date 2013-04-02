/**
 * @fileOverview provide dependency and namespace handling
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 * @version 1.0
 */

/*
 * refactor dependency system to allow callbacks on finishing using 
 * 	CallbackGroup and CallbackGroupManager 
 * provide support for lazy loading
 */

/*
 * functionality extensions for browsers with js version 1.3 (i.e. IE8)
 * this is aimed to provide higher version functions to older browsers 
 * without compromising efficency and code repetitions in newer ones
 */
if (!Array.prototype.indexOf) {
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

/*
 * definition of unilib base library
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
 * Event helpers
 */

/**
 * add event listener to object (support IE)
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
 * remove event listener from object (support IE)
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
 * @static
 * @example 
 * var cbg = new CallbackGroup(someEl, someType);
 * cbg.attach(myCallback, CallbackGroup.FIRST);
 */
unilib.CallbackGroup.FIRST = 0;

/** last position in CallbackGroup callback list
 * @type {number}
 * @constant
 * @static
 * @example 
 * var cbg = new CallbackGroup(someEl, someType);
 * cbg.attach(myCallback, CallbackGroup.LAST);
 */
unilib.CallbackGroup.LAST = -1;


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
		for (var i = 0; i < this.groups_.length; i++) {
			if (this.groups_[i].element == element && this.groups_[i].type == type) {
				return this.groups_[i];
			}
		}
		return null;
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

/*
 * dependency system handling
 * use a LIFO queue to queue callbacks and init everything as soon as
 * every dependency has notified its loading. This is necessary beacuse no
 * standard way to determine the loading of a script exists in HTML 4.01
 * (no document.onload for dynamically added scripts, nor script.onload
 * attribute). Generally unilib handles everything transparently using
 * unilib.provideNamespace function with correct parameters, if an user
 * wants to handle manually dependency notification he should use instead
 * unilib.include and unilib.notifyLoading (i.e. for lazy loading inclusions)
 */

/**
 * group private dependency handling functions and variables
 * @type {object}
 * @private
 */
unilib.dependencyManager_ = {
		/** number of notifications received
		 * @type {number}
		 * @private
		 */
		notifications_: 0,
		/** callback group to trigger after initialisation of dependencies is made
		 * @type {Array.<function>}
		 */
		onload: [],
		/** indicates when onload event has been triggered, i.e. when callbacks in
		 * 	this.onload have been called
		 * @type {boolean}
		 */
		done_: false,
		/**
		 * notify that an included file has been loaded.
		 * 	This is used to determine if all files has been included by just
		 * 	comparing number of notification received with number of dependencies
		 * 	registered
		 */
		notifyLoaded: function() {
			this.notifications_++;
			if (this.notifications_ == unilib.included_.length) {
				for (var i = 0; i < this.onload.length; i++) {
					this.onload[i].call();
				}
				this.done_ = true;
			}
		},
		/** 		
		 * this callback is used to tell dependencymanager_ that document has 
		 * 	loaded (window.onload Event). This necessary because if no dependency
		 * 	is included, all callbacks attached to the group that is listening
		 * 	on dependencyManager_ will never be executed (example unittest.js).
		 * 	Note that document.onload cannot be called before script elements
		 * 	present in the page (not dynamically added) have been parsed, so if
		 * 	one of them has uninitialised dependencies this.notifications_ != 
		 * 	unilib.included.length_ always.
		 * @todo may be removed if, after refactoring unittest, it is proved
		 * 	that it is not safe (or it is useless) to fire a load event on 
		 * 	subscribed CallbackGroup when document is loaded.
		 * @private
		 */
		documentLoaded_: function() {
			//check this.done_ to avoid double calls 
			// if callbacks have been already triggered by notifyLoaded
			if ((this.notifications_ == unilib.included_.length) && !this.done_) {
				for (var i = 0; i < this.onload.length; i++) {
					this.onload[i].call();
				}
				this.done_ = true;
			}
		},
		/**
		 * event source interface, used to make dependencymanager_ compatible with
		 * 	CallbackGroup. Add given event listener if eventType is 'load'
		 * @param {function} listener listener to append
		 * @param {string} eventType 
		 */
		addEventListener: function(eventType, listener){
			if (this.onload.indexOf(listener) && eventType == 'load') {
				this.onload.push(listener);
			}
		},
		/**
		 * event source interface, used to make dependencymanager_ compatible with
		 * 	CallbackGroup. Remove given event listener if eventType is 'load'
		 * @param {function} listener listener to append
		 * @param {string} eventType 
		 */
		removeEventListener: function(eventType, listener) {
			if (eventType == 'load') {
				var index = this.onload.indexOf(listener);
				if (index != -1) this.onload.splice(index, 1);
			}
		}
};

//add event listener to window.onload for dependencyManager_
unilib.addEventListener(window, 'load', unilib.createCallback(
		unilib.dependencyManager_, unilib.dependencyManager_.documentLoaded_));

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

/**
 * expose private unilib.dependencyManager_.notifyLoaded method,
 * notify loading of a dependency file
 * @see unilib.dependencyManager_.notifyLoaded
 */
unilib.notifyLoaded = function() {
	unilib.dependencyManager_.notifyLoaded();
};

/**
 * create new namespace, import dependencies and call init callback.
 *  No standard way can be used to notify loading of a script
 *  dynamically added to the page, i.e. window.onload can fire when there
 *  are still scripts downloading and script.onload (script.onreadystatechange)
 *  is not part of the HTML 4.01 specification. For this reason by now the best
 *  we can do is provide a simple way to scripts to notify dependencyManager 
 *  when they have done, so it can begin calling init callback stack.
 *  This is done by unilib.dependencyManager_.notifyLoaded() function.
 *  unilib.provideNamespace provide a shorthand by calling notifyLoaded itself
 *  if the notify flag is set to true (or left default).
 *  Usage Notes:
 *  <ul>
 *  <li> Each included script MUST notify its loading by calling
 *  	ONCE unilib.notifyLoading or unilib.provideNamespace function.
 *  </li>
 *  <li> Note that if a file define more than one namespace it MUST call
 *  	unilib.dependencyManager_.notifyLoaded() only ONCE.
 *  </li>
 *  <li> Calling provideNamespace(notify=true) or notifyLoaded() assumes that
 *  	the file issuing the call will be used only as imported by unilib and 
 *  	not added to the page manually. This is especially important if you
 *  	make other includes because an extra notifyLoaded would break the
 *  	dependency management system causing headaches to maintainers (that is
 *  	why using script.onload would be more reliable)
 *  </li>
 *  <li> Inclusions done by main html document MUST use either unilib.include
 *  	or unilib.provideNamespace(notify=false) in order to not pollute the
 *  	notification count since inline scripts should not notify their
 *  	loading (they are not dynamically imported, they may request inclusion
 *  	of some file but cannot be included).
 *  </li>
 *  </ul>
 *  @see unilib.dependencyManager_.notifyLoaded
 * @param {string} name name of the namespace i.e. 'unilib.myNamespace'
 * @param {function} init initialization callback for the namespace, called 
 * 	after all dependencies are loaded, parsed and initialized
 * @param {Array.<Array.<string> || string>=} deps array of dependencies of the
 *  namespace as ["path", "base"] or just "path", 
 *  where base is nullable @see unilib.include
 * @param {boolean=} notify if true providenamespace will notify loading of a
 * 	file, default true
 * @example
 * //no dependencies
 * unilib.provideNamespace("foo", function() {foo.bar = 'baz';});
 * //dependencies: baz in unilib.config.jsBase/baz.js and 
 * //bazbaz in external/path/to/bazbaz.js 
 * unilib.provideNamespace("foo", function() {foo.bar = new baz();}, 
 * 	["baz.js", ["bazbaz.js", "external/path/to/"]]);
 * //do not notify file loading
 * unilib.provideNamespace("foo", function() {foo.bar = 'bar';}, [], false);
 */
unilib.provideNamespace = function(name, init, deps, notify) {
	//set defaults
	notify = (notify == undefined) ? true : notify;
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
	//if group already exists, it is returned 
	// @see unilib.callbackGroupmanager.createGroup
	var group = unilib.callbackGroupManager.
		createGroup(unilib.dependencyManager_, 'load');
	//callbacks must be executed in LIFO order
	group.attach(init, unilib.CallbackGroup.FIRST);
	//provide name
  var parts = name.split('.');
  var current = window; //global scope
  for (var i = 0; i < parts.length; i++) {
    current[parts[i]] = current[parts[i]] || {};
    current = current[parts[i]];
  }
  if (notify) {
  	unilib.notifyLoaded();
  }
};

/** keep track of included files to avoid repeated inclusions
 * and to count number of dependencies
 * @type {Array.<string>}
 * @private
 */
unilib.included_ = [];

/**
 * load an additional script. Note: a non-standard implementation may permit
 * 	to invoke a callback after a script has loaded using script.onload or
 * 	script.onreadystatechange (IE), this may permit to include scripts that
 * 	do not use unilib to notify they have loaded.
 * @param {string} path path to include
 * @param {string} [base] optional base path, default unilib.config.jsBase
 */
unilib.include = function(path, base) {
  //assign defaults
  base = base || unilib.config.jsBase;
  //build include path
  var fullPath = (base.charAt(base.length - 1) == '/') ? base : base + '/';
  fullPath += (path.charAt(0) == '/') ? path.substring(1) : path;
  if (unilib.included_.indexOf(fullPath) == -1) {
  	var script = document.createElement('script');
  	script.setAttribute('type', 'text/javascript');
  	script.setAttribute('src', fullPath);
  	document.getElementsByTagName('head')[0].appendChild(script);
    unilib.included_.push(fullPath);
  }
};