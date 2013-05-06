/**
 * @fileOverview provide dependency and namespace handling
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 * @version 1.0
 */

/*
 * @todo:
 * load unilib.config from external php 
 * provide support for lazy loading
 * need something to check for circular dependencies
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
 * @todo import config with include and generate them with php
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
 * use an ordered queue to init interdependant modules respecting the
 * dependency ordering.
 * Since no standard way to determine the loading of a script exists 
 * in HTML 4.01 (no document.onload for dynamically added scripts, 
 * nor script.onload attribute) dependencyManager has to enforce some 
 * restrictions to the usage of this feature in order to remain 
 * standard-compliant. 
 * Generally unilib handles everything transparently using 
 * unilib.provideNamespace function with correct parameters, 
 * the only thing a developer MUST do while writing library files is to call
 * unilib.notifyLoading at the END of every library file that will be included
 * using the dependency handling system.
 * 
 *  Usage Notes:
 *  <ul>
 *  <li> Each included script MUST notify its loading by calling
 *  	ONCE unilib.notifyLoading().
 *    Note that if a file define more than one namespace it MUST call
 *  	unilib.dependencyManager.notifyLoaded() only ONCE.
 *    Calling notifyLoaded() assumes that the file issuing the call will
 *    be used only as imported by unilib and will NEVER be added to the 
 *    page manually (at least while using unilib dependencies). 
 *    This is especially important if you make other includes because an 
 *    extra notifyLoaded would break the dependency management system causing
 *    headaches to you and to maintainers (that is
 *  	why using script.onload would be more reliable, but non-standard ouch!)
 *  </li>
 *  <li> Inclusions done by main html document MUST use either unilib.include
 *  	or unilib.provideNamespace(inline=true) in order to inform 
 *  	dependencyManager to not try to find a running script name for the inline
 *  	script.
 *  	Inline scripts MUST NOT notify their loading with unilib.notifyLoaded 
 *  	(they are not dynamically imported, they may request inclusion
 *  	of some file but cannot be included).
 *  </li>
 *  </ul>
 * @example spare examples.
 * //no dependencies
 * unilib.provideNamespace("foo", function() {foo.bar = 'baz';});
 * //dependencies: baz in unilib.config.jsBase/baz.js and 
 * //bazbaz in external/path/to/bazbaz.js 
 * unilib.provideNamespace("foo", function() {foo.bar = new baz();}, 
 * 	["baz.js", ["bazbaz.js", "external/path/to/"]]);
 * //define a namespace in inline script
 * unilib.provideNamespace("foo", function() {foo.bar = 'bar';}, [], true);
 * 
 * @example simple scenario including a lib file.
 * -------------- inline ------------
 * unilib.include('myLib.js');
 * function doStuffWithMyLib() {
 * 	[...]
 * }
 * unilib.dependencyManager.addEventListener(doStuffWithMyLib, 'load');
 * ---------------- myLib.js --------
 * unilib.provideNamespace('myLib.aModule', function() {
 * 	[...]
 * }); //note that namespace has not dependencies.
 * unilib.notifyLoaded();
 */

/**
 * group private dependency handling functions and variables
 * @namespace
 */
unilib.dependencyManager = {
		
		/**
		 * id to assign to next inline namespace found
		 * @private
		 */
		nextInlineNSID_: 0,
		
		/**
		 * stores included scripts, associated callbacks and dependencies
		 * nsRecords_ is organised so that executing callbacks from last element to
		 * first will respect dependencies.
		 * @type {Array.<unilib.NamespaceRecord>}
		 * @private
		 */
		nsRecords_: [],
		
		/** number of loading notifications received
		 * @type {number}
		 * @private
		 */
		notifications_: 0,
		
		/** indicates when onload event has been triggered, i.e. when callbacks in
		 * 	this.onload have been called
		 * @type {boolean}
		 * @private
		 */
		done_: false,
		
		/** callbacks to execute after all dependencies have been resolved and
		 * 	initialised.
		 * @type {Array.<function>}
		 * @private
		 */
		callbacks_: [],
		
		/** keep track of included files.
		 * @see dependencyManager.isIncluded
		 * @see dependencyManager.inlineInclude
		 * @see dependencyManager.libraryInclude_
		 * @see dependencyManager.getCurrentScript_
		 * @type {Array.<string>}
		 * @private
		 */
		included_: [],
		
		/**
		 * helper class used to keep track of included namespaces
		 * @param {string} id id of the record or some reserved value
		 * @param {function=} callback init callback for the namespace
		 * @param {Array.<string> | Array.<Array.<string>>} dependencies 
		 * 	dependencies of the namespace
		 * @constructor
		 */
		NamespaceRecord: function(id, callback, dependencies) {
			/** id of the record, may be a reserved value
			 * @type {string}
			 */
			this.id = id;
			/** callback for this record
			 * @type {?function}
			 */
			this.callback = callback || null;
			/** dependencies for this record
			 * @type {Array.<string> | Array.<Array.<string>>}
			 */
			this.dependencies = dependencies || [];
		},
		
		/**
		 * execute init callbacks in order.
		 * @private
		 * @todo
		 */
		exec_: function() {
			console.log('<Exec> ' + this.nsRecords_.length);
			for (var i = this.nsRecords_.length - 1; i >= 0; i--) {
				console.log('<record ' + i + '> ' + this.nsRecords_[i].id + ' deps: ' + this.nsRecords_[i].dependencies);
				if (this.nsRecords_[i].callback) this.nsRecords_[i].callback.call();
			}
			for (var i = 0; i< this.callbacks_.length; i++) {
				this.callbacks_[i].call();
			}
			this.done_ = true;
			//may be an idea to clear this.nsRecord array
		},
		
		/**
		 * notify that an included file has been loaded.
		 * 	This is used to determine if all files has been included by just
		 * 	comparing number of notification received with number of dependencies
		 * 	registered. If all notification have been received than 
		 * 	call init callbacks.
		 *  No standard way can be used to notify loading of a script
		 *  dynamically added to the page, i.e. window.onload can fire when there
		 *  are still scripts downloading and script.onload (script.onreadystatechange)
		 *  is not part of the HTML 4.01 specification. For this reason by now the best
		 *  we can do is provide a simple way to scripts to notify dependencyManager 
		 *  when they have done, so it can begin calling init callback stack.
		 *  This is done by unilib.dependencyManager.notifyLoaded() function.
		 */
		notifyLoaded: function() {
			this.notifications_++;
			if (this.notifications_ == this.included_.length) this.exec_();
		},
		
		/** 		
		 * this callback is used to tell dependencyManager that document has 
		 * 	loaded (window.onload Event). This necessary because if no dependency
		 * 	is included, all callbacks attached to dependencyManager will never 
		 * 	be executed (example unittest.js).
		 * 	Note that document.onload cannot be called before script elements
		 * 	present in the page (not dynamically added) have been parsed, so if
		 * 	one of them has uninitialised dependencies this.notifications_ != 
		 * 	unilib.included.length_ always (at least in HTLM 4.01).
		 * @private
		 */
		documentLoaded_: function() {
			console.log('<docLoaded>');
			/* check this.done_ to avoid double calls 
			 * if callbacks have been already triggered by notifyLoaded
			 */
			if ((this.notifications_ == this.included_.length) && 
					!this.done_) this.exec_();
		},
		
		/**
		 * check if a file has already been included
		 * @param {string} path path of the file
		 * @returns {boolean}
		 */
		isIncluded: function(path) {
			for (var i = 0; i < this.included_.length; i++) {
				if (this.included_[i] == path) return true;
			}
			return false;
		},
		
		/**
		 * load an additional script. This function is meant to be used from inline
		 *  scripts to include a library. Note: a non-standard implementation may 
		 *  permit to invoke a callback after a script has loaded using 
		 *  script.onload or script.onreadystatechange (IE), this may permit to 
		 *  include scripts that do not use unilib to notify they have loaded.
		 * @param {string} path path to include
		 * @param {string=} base optional base path, default unilib.config.jsBase
		 */
		inlineInclude: function(path, base) {
		  fullPath = this.buildFullPath_(path, base);
		  if (! this.isIncluded(fullPath)) {
		  	var script = document.createElement('script');
		  	script.setAttribute('type', 'text/javascript');
		  	script.setAttribute('src', fullPath);
		  	/* shut down possibly supported HTML5 async attribute that 
		  	 * defaults to true.
		  	 * This attribute cause the script to be executed asyncrously so
		  	 * DOM can continue parsing, the script is then executed as soon as it is
		  	 * fetched. In FF >= 4.0 IE and WebKit (see MDN) injected scripts have 
		  	 * async = true by default. This is done problably to speed up the
		  	 * rendering of the page.
		  	 * Here async is set to false because it would break the assumption of 
		  	 * the dependency system that scripts are executed sequentially.
		  	 */
		  	if (script.async) {
		  		script.async = false;
		  	}
		  	console.log('<append> ' + fullPath);
		  	document.getElementsByTagName('head')[0].appendChild(script);
		  	this.included_.push(fullPath);
		  }
		},
		
		/**
		 * load an additional script from a library file (not inline).
		 * @see unilib.dependencyManager.inlineInclude
		 * @param {string} path path to include
		 * @param {string=} base optional base path, default unilib.config.jsBase
		 * @private
		 */
		libraryInclude_: function(path, base) {
			fullPath = this.buildFullPath_(path, base);
		  if (! this.isIncluded(fullPath)) {
		  	var script = document.createElement('script');
		  	script.setAttribute('type', 'text/javascript');
		  	script.setAttribute('src', fullPath);
		  	if (script.async) {
		  		/* @see unilib.DepenencyManager.inlineInclude */ 
		  		script.async = false;
		  	}
		  	console.log('<append> ' + fullPath);
		  	document.getElementsByTagName('head')[0].appendChild(script);
		  	this.included_.push(fullPath);
		  }
		},
		
		/**
		 * add a namespace to be handled.
		 * @param {function} callback init callback for the namespace
		 * @param {Array.<string> | Array.<Array.<string>>=} dependencies files 
		 * 	required for this namespace
		 * @param {boolean} inline tells if namespace to 
		 * 	register is declared inline
		 * @private
		 */
		registerNamespace_: function(callback, dependencies, inline) {
			var filePath;
			if (inline) {
				filePath = this.nextInlineNSID_;
				this.nextInlineNSID_++;
			}
			else {
				 filePath = this.getCurrentScript_()
			}
			if (dependencies) {
				for (var i = 0; i < dependencies.length; i++) {
					if (dependencies[i] instanceof Array) {
						dependencies [i] = this.buildFullPath_(dependencies[i][0], 
								dependencies[i][1]);
					}
					else {
						dependencies[i] = this.buildFullPath_(dependencies[i], null);
					}
				}
			}
			console.log('<register> \n' + 
					' <src> '+ filePath + '\n <deps>' + dependencies + '\n <inline>' + inline + '\n <nsRecords_>' + this.nsRecords_.length + ' | ' + this.included_.length);
			var record = new unilib.dependencyManager.NamespaceRecord(filePath, callback, 
					dependencies);
			/* a typical nsRecords_ array is:
			 * +------------------+
			 * | A | init | B, C	| nsRecords_[0]
			 * +------------------+
			 * | B | init | C, E	| nsRecords_[1]
			 * +------------------+
			 * | C | init | --		| nsRecords_[2]
			 * +------------------+
			 * assume we want to insert a record like this
			 * | E | init | X, Y |
			 * E must be inserted after the max index of all namespaces 
			 * 	requiring it, and before any requirement it has.
			 * So define:
			 * 	firstDependencyIndex = min(i = {index of nsRecords_} 
			 * 		such that nsRecords_[i] is required by E);
			 * 	lastDependantIndex = max(i = {index of nsRecords_} 
			 * 		such that nsRecords_[i] requires E).
			 * Then if firstDependencyIndex <= lastDependantIndex, we have
			 * 	a circular dependency and system will raise an exception.
			 */
			
			//handle special case of self dependant modules.
			if (record.dependsOn(record.id)) {
				throw new Error('Detected self-dependant file ' + record.id);
			}
			if (this.nsRecords_.length == 0) {
				//handle starting case
				this.nsRecords_.push(record);
			}
			else {
				console.log('<DepSort>\n ');
				/*remind that the last nsRecords_ element will be initialised first
					Index of first record that is a dependency for the one 
					we are inserting, starting form index 0 as lowest.
					A value of -1 means that no dependency is currently
					registered.
				*/
				var firstDependencyIndex = -1;
				/* index of last record that depends on the one
				 * we are currently inserting.
				 * A value of -1 is allowed only if a new module
				 * is loaded manually and there are no other modules that have
				 * requested it.
				 */
				var lastDependantIndex = -1;
				for (var i = 0; i < this.nsRecords_.length; i++) {
					if (this.nsRecords_[i].dependsOn(record.id)) lastDependantIndex = i;
				}
				console.log('<LstDependantIndex> ' + lastDependantIndex + '\n');
				for (var i = (this.nsRecords_.length - 1); i >= 0; i--) {
					if (record.dependsOn(this.nsRecords_[i].id)) firstDependencyIndex = i;
				}
				console.log('<FstDependencyIndex> ' + firstDependencyIndex + '\n');
				if (firstDependencyIndex == -1) {
					//handle no dependency found, just append record
					this.nsRecords_.push(record);
					console.log('<noDependencyFound>');
				}
				else if (lastDependantIndex == -1) {
					//note that firstDependencyIndex is not -1
					this.nsRecords_.splice(firstDependencyIndex, 0, record);
					console.log('<noDependantFound>');
				}
				else if (firstDependencyIndex <= lastDependantIndex) {
					throw new Error('Circular dependency detected for ' + record.id);
				}
				else {
					this.nsRecords_.splice(lastDependantIndex + 1, 0, record);
					console.log('<normalFlow>');
				}
			}
			console.log('<EOR> \n <nsRecords_>' + this.nsRecords_.length + ' | ' + this.included_.length);
		},
		
		/**
		 * create new namespace, import dependencies and call init callback.
		 * @param {string} name name of the namespace i.e. 'unilib.myNamespace'
		 * @param {function} init initialization callback for the namespace, called 
		 * 	after all dependencies are loaded, parsed and initialized
		 * @param {Array.<Array.<string> || string>=} deps array of dependencies of the
		 *  namespace as ["path", "base"] or just "path", 
		 *  where base is nullable @see unilib.include
		 * @param {boolean=} inline tells if namespace is declared inline. 
		 *  Default false.
		 * @example
		 * //no dependencies
		 * unilib.provideNamespace("foo", function() {foo.bar = 'baz';});
		 * //dependencies: baz in unilib.config.jsBase/baz.js and 
		 * //bazbaz in external/path/to/bazbaz.js 
		 * unilib.provideNamespace("foo", function() {foo.bar = new baz();}, 
		 * 	["baz.js", ["bazbaz.js", "external/path/to/"]]);
		 * //define a namespace in inline script
		 * unilib.provideNamespace("foo", function() {foo.bar = 'bar';}, [], true);
		 */
		provideNamespace: function(name, init, deps, inline) {
			//set defaults
			inline = (inline == undefined) ? false : inline;
			if (deps) {
				for (var i = 0; i < deps.length; i++) {
					if (typeof deps[i] == 'string' || deps[i] instanceof String) {
						//dependency located in unilib.config.jsBase
						if (inline) this.inlineInclude(deps[i]);
						else this.libraryInclude_(deps[i]);
					}
					else if (deps[i] instanceof Array) {
						//dependency in the form [path, base]
						if (inline) this.inlineInclude(deps[i][0], deps[i][1]);
						else this.libraryInclude_(deps[i][0], deps[i][1]);
					}
					else {
						//not supported, throw exception
						throw new Error("invalid dependency format " + deps[i]);
					}
				}
			}
			//provide name
		  var parts = name.split('.');
		  var current = window; //global scope
		  for (var i = 0; i < parts.length; i++) {
		    current[parts[i]] = current[parts[i]] || {};
		    current = current[parts[i]];
		  }
		  this.registerNamespace_(init, deps, inline);
		},
		
		/**
		 * get file path of the currently loading/executing script
		 * Note that HTML5 provides a standard (and more general) way to do so
		 * 	by using document.currentScript (see MDN). note that this function 
		 *  gives a reliable result only if it is asked about an executing script
		 *  that have been included using unilib.
		 * Current executing script is assumed to be requested only when running
		 * 	included scripts, its index is obtained from the number of 
		 * 	notifications received from library files, since there must be only a
		 * 	notification for each file loaded.
		 * @returns {?string}
		 * @private
		 */
		getCurrentScript_: function() {
			/* search for the correct current script running considering
			 * origin of inclusions, if running an inline script return null.
			 */
			return this.included_[this.notifications_];
		},
		
		/**
		 * build full path string form a couple relativePath, base
		 * @param {string} relativePath relative path of the file
		 * @param {string=} base base path, defaults to unilib.config.jsBase
		 * @return {string}
		 * @private
		 */
		buildFullPath_: function(relativePath, base) {
			//assign defaults
		  base = base || unilib.config.jsBase;
		  //build include path
		  var fullPath = (base.charAt(base.length - 1) == '/') ? base : base + '/';
		  fullPath += (relativePath.charAt(0) == '/') ? 
		  		relativePath.substring(1) : relativePath;
		  return fullPath;
		},
		
		/**
		 * Add given event listener if eventType is 'load', callback is invoked
		 * after every dependency has been initialised
		 * @param {function} listener listener to append
		 * @param {string} eventType 
		 */
		addEventListener: function(eventType, listener){
			if (eventType == 'load') {
				for (var i = 0; i < this.callbacks_.length; i++) {
						if (this.nsRecord[i].callback == listener) return;
					}
				//push back the callback to add
				this.callbacks_.push(listener);
			}
		},
		
		/**
		 * Remove given event listener if eventType is 'load'
		 * @param {function} listener listener to append
		 * @param {string} eventType 
		 */
		removeEventListener: function(eventType, listener) {
			if (eventType == 'load') {
				for (var i = 0; i < this.nsRecords_.length; i++) {
					if (this.callbacks_[i] == listener) {
						this.nsRecords_.splice(i, 1);
						return;
					}
				}
			}
		}
};

/**
 * check if record depends on given file
 * @param {string} file file to check for dependency, this is 
 * 	actually a full path
 * @returns {boolean}
 */
unilib.dependencyManager.NamespaceRecord.prototype.dependsOn = function(file) {
	if (this.dependencies.indexOf(file) == -1) return false;
	return true;
};

//add event listener to window.onload for dependencyManager
unilib.addEventListener(window, 'load', unilib.createCallback(
		unilib.dependencyManager, unilib.dependencyManager.documentLoaded_));

/**
 * expose private unilib.dependencyManager.notifyLoaded method,
 * notify loading of a dependency file
 * @see unilib.dependencyManager.notifyLoaded
 */
unilib.notifyLoaded = function() {
	unilib.dependencyManager.notifyLoaded();
};

/**
 * @see unilib.dependencyManager.provideNamespace
 */
unilib.provideNamespace = function(name, init, deps, inline) {
	unilib.dependencyManager.provideNamespace(name, init, deps, inline);
};

/**
 * load an additional script. Note: a non-standard implementation may permit
 * 	to invoke a callback after a script has loaded using script.onload or
 * 	script.onreadystatechange (IE), this may permit to include scripts that
 * 	do not use unilib to notify they have loaded.
 * @param {string} path path to include
 * @param {string} [base] optional base path, default unilib.config.jsBase
 */
unilib.include = function(path, base) {
  unilib.dependencyManager.inlineInclude(path, base);
};