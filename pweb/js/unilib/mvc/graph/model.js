/**
 * @fileOverview model for graph-like representations
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @todo
 * [FEAT] add flags to remove edges from both ends when keepEdges==false
 * [FEAT] make notifications be issued by user or library and not automatically by all functions? Or make a function to blind
 * 	an object or the model itself from sending notifications(i.e. RLock object) in order to avoid duplicate notifications?
 * 	better to revert back to not having getter/setters for all variables, make user/library functions notify changes ans in 
 * 	first implementation idea.
 */


/**
 * @namespace unilib.mvc.graph
 */
unilib.provideNamespace('unilib.mvc.graph', function() {
	
	/**
	 * error class for GraphModel
	 * @class
	 * @extends unilib.error.UnilibError
	 * @param {string} message
	 */
	unilib.mvc.graph.GraphModelError = function(message) {
		message = 'GraphModelError: ' + message;
		unilib.error.UnilibError.apply(this, [message]);
	};
	unilib.mvc.graph.GraphModelError.prototype = new unilib.error.UnilibError();
	
	/**
	 * enumeration for pin directions, i.e. output, input, etc.
	 * @enum {number}
	 */
	unilib.mvc.graph.PinDirection = {
			IN: 1,
			OUT: 2,
			UNKNOWN: 0
	};
	
	// --------------------------- Notification Manager -----------------------
	
	/**
	 * enumeration for NotificationManager status
	 * @enum {number}
	 */
	unilib.mvc.graph.NotificationManagerStatus = {
			FREE: 1,
			LOCKED: 0
	};
	
	/**
	 * helper class used to reserve access to notifications to a specific object
	 * preventing others to send notifications
	 */
	unilib.mvc.graph.NotificationManager = function() {
		/**
		 * specify if notifications are blocked or not
		 * @type {unilib.mvc.graph.NotificationManagerStatus}
		 * @private
		 */
		this.status_ = unilib.mvc.graph.NotificationManagerStatus.FREE;
		
	};
	
	/**
	 * lock the notification manager
	 */
	unilib.mvc.graph.NotificationManager.prototype.lock = function() {
		this.status_ = unilib.mvc.graph.NotificationManagerStatus.LOCKED;
	};
	
	/**
	 * unlock the notification manager
	 */
	unilib.mvc.graph.NotificationManager.prototype.free = function() {
		this.status_ = unilib.mvc.graph.NotificationManagerStatus.FREE;
	};
	
	/**
	 * check if notification manager is free
	 * @returns {boolean}
	 */
	unilib.mvc.graph.NotificationManager.prototype.isFree = function() {
		return this.status_ == unilib.mvc.graph.NotificationManagerStatus.FREE;
	};
	
	// ----------------------------- Graph Model --------------------------------
	
	/**
	 * model class, implements observable interface. It helps coordinating all 
	 * the work of internal elements.
	 * @class
	 * @extends unilib.interfaces.observer.Observable
	 * 	for checking the consistency of the graph
	 */
	unilib.mvc.graph.GraphModel = function() {
		/**
		 * nodes array
		 * @type {Array.<unilib.mvc.graph.Node>}
		 * @private
		 */
		this.nodes_ = [];
		
		/**
		 * notification manager, used by GraphElements to handle cascade notifications
		 * @type {unilib.mvc.graph.NotificationManager}
		 * @public
		 */
		this.notificationManager = new unilib.mvc.graph.NotificationManager();
	};
	unilib.mvc.graph.GraphModel.prototype = new unilib.interfaces.observer.Observable();
	
	/**
	 * create a node and add it to the graph
	 * @returns {unilib.mvc.graph.Node}
	 */
	unilib.mvc.graph.GraphModel.prototype.addNode = function() {
		var node = new unilib.mvc.graph.Node(this);
		this.nodes_.push(node);
		return node;
	};
	
	/**
	 * remove node from graph, note that this has cascade effects on Pins and
	 * 	Edges connected to deleted Node
	 * @param {unilib.mvc.graph.Node} node node to add
	 * @throws {unilib.mvc.graph.GraphModelError} if Node does not exists
	 */
	unilib.mvc.graph.GraphModel.prototype.removeNode = function(node) {
		if (! (node instanceof unilib.mvc.graph.Node)) { 
			throw new unilib.mvc.graph.GraphModelError('Invalid node instance');
		}
		var index = this.nodes_.indexOf(node);
		if (index != -1) {
			this.nodes_.splice(index, 1);
			if (node.getModel() == this) {
				//update node if needed
				node.setModel(null);
				for (var i = node.createIterator(); ! i.end(); i.next()) {
					var pin = i.item();
					for (var j = pin.createIterator(); ! j.end(); j.next()) {
						//iterate all edges connected to the node and unlink them
						pin.unlink(j.item());
					}
				}
			}
		}
		else {
			throw new unilib.mvc.graph.GraphModelError('can\'t remove' + 
					' unexisting node');
		}
	};
	
	/**
	 * shorthand to check if the model contains a certain node
	 * @param {unilib.mvc.graph.Node} node
	 * @returns {boolean}
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.GraphModel.prototype.hasNode = function(node) {
		if (! (node instanceof unilib.mvc.graph.Node)) { 
			throw new unilib.mvc.graph.GraphModelError('Invalid node instance');
		}
		if (this.nodes_.indexOf(node) != -1) return true;
		return false;
	};
	
	/**
	 * create an iterator for Nodes in the graph
	 * @returns {unilib.interfaces.iterator.Iterator}
	 */
	unilib.mvc.graph.GraphModel.prototype.createIterator = function() {
		return new unilib.interfaces.iterator.ArrayIterator(unilib.copyObject(this.nodes_));
	};
	
	//----------------------------------- GraphElement -------------------------
	
	/**
	 * base class for all elements of the graph, it provides all functionalities
	 * to handle drawing and positioning of graph elements, as well as a 
	 * notification interface that is used to implement the observer pattern
	 * in the model.
	 * @private
	 * @extends {unilib.graphics.IDrawableDescriptor}
	 * @abstract
	 * @class
	 */
	unilib.mvc.graph.GraphElement = function() {
		
		/** position of the element
		 * @type {unilib.geometry.Point}
		 * @protected
		 */
		this.position_ = new unilib.geometry.Point(0, 0);
		
		/** shape informations
		 * @type {unilib.geometry.Shape}
		 * @protected
		 */
		this.shape_ = null;
		
		/** style assigned
		 * @type {string | number}
		 * @protected
		 */
		this.styleID_ = null;
		
		/** text associated with the drawable
		 * @type {string}
		 * @protected
		 */
		this.label_ = '';
		
		/**
		 * ID of the descriptor, useful for distinguishing elements
		 * it is assumed to be unique
		 * @type {string | number}
		 * @protected
		 */
		this.id_;
	};
	unilib.mvc.graph.GraphElement.prototype = 
		new unilib.graphics.IDrawableDescriptor();
	
	/**
	 * setter for element's label
	 * @param {string} label
	 */
	unilib.mvc.graph.GraphElement.prototype.setLabel = function(label) {
		this.label_ = label;
		this.notifyUpdate_();
	};
	
	/**
	 * getter for element's label
	 * @returns {string}
	 */
	unilib.mvc.graph.GraphElement.prototype.getLabel = function() {
		return new String(this.label_);
	};
	
	/**
	 * setter for id
	 * @param {string | number} id
	 */
	unilib.mvc.graph.GraphElement.prototype.setID = function(id) {
		this.id_ = id;
		this.notifyUpdate_();
	};
	
	/**
	 * getter for id
	 * @returns {number | string}
	 */
	unilib.mvc.graph.GraphElement.prototype.getID = function() {
		return this.id_;
	};
	
	/**
	 * setter for position
	 * @param {unilib.geometry.Point} point
	 */
	unilib.mvc.graph.GraphElement.prototype.setPosition = function(point) {
		this.position_ = point;
		this.notifyUpdate_();
	};
	
	/**
	 * getter for position
	 * @returns {unilib.geometry.Point}
	 */
	unilib.mvc.graph.GraphElement.prototype.getPosition = function() {
		//protect private var from not notified modifications 
		return unilib.cloneObject(this.position_);
	};
	
	/**
	 * setter for shape
	 * @param {unilib.geometry.Shape} shape
	 */
	unilib.mvc.graph.GraphElement.prototype.setShape = function(shape) {
		this.shape_ = shape;
		this.notifyUpdate_();
	};
	
	/**
	 * getter for shape
	 * @returns {unilib.geometry.Shape}
	 */
	unilib.mvc.graph.GraphElement.prototype.getShape = function() {
		return unilib.cloneObject(this.shape_);
	};
	
	/**
	 * setter for style ID
	 * @param {string | number} id
	 */
	unilib.mvc.graph.GraphElement.prototype.setStyleID = function(id) {
		this.styleID_ = id;
		this.notifyUpdate_();
	};
	
	/**
	 * getter for style ID
	 * @returns {string | number}
	 */
	unilib.mvc.graph.GraphElement.prototype.getStyleID = function() {
		return this.styleID_;
	};
	
	/**
	 * getter for the main model object, used to access Strategies and more.
	 * @returns {unilib.mvc.graph.GraphModel}
	 * @abstract
	 */
	unilib.mvc.graph.GraphElement.prototype.getModel = function() {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * notification helper for update events
	 * @private
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.GraphElement.prototype.notifyUpdate_ = function() {
		var model = this.getModel();
		if (model) {
			model.notify(new unilib.interfaces.observer.ObserverEvent(
					unilib.interfaces.observer.ObserverEventType.UPDATE, this));
		}
	};
	
	/**
	 * notification helper for remove events
	 * @private
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.GraphElement.prototype.notifyRemoval_ = function() {
		var model = this.getModel();
		if (model) {
			model.notify(new unilib.interfaces.observer.ObserverEvent(
					unilib.interfaces.observer.ObserverEventType.REMOVE, this));
		}
	};
	
	/**
	 * notification helper for add events
	 * @private
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.GraphElement.prototype.notifyAddition_ = function() {
		var model = this.getModel();
		if (model) {
			model.notify(new unilib.interfaces.observer.ObserverEvent(
					unilib.interfaces.observer.ObserverEventType.ADD, this));
		}
	};
	
	// --------------------------------- Node -----------------------------------
	
	/**
	 * Node class represents a node of the graph, it provides some drawing
	 * informations and a number of Pins that are used to group Edges.
	 * @private
	 * @class
	 * @extends {unilib.mvc.graph.GraphElement}
	 * @param {unilib.mvc.graph.GraphModel} model model that created the node
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Node = function(model) {
		if (! model || ! model instanceof unilib.mvc.graph.GraphModel) {
			throw new unilib.mvc.graph.GraphModelError('Invalid Node ' + 
					'constructor arguments');
		}
		
		/**
		 * @see unilib.mvc.graph.GraphElement
		 * @private
		 */
		this.model_ = model;
		
		/**
		 * array of pins in the node
		 * @type {Array.<unilib.mvc.graph.Pin>}
		 * @private
		 */
		this.pins_ = [];
		
		//notify node addition
		this.notifyAddition_();
	};
	unilib.mvc.graph.Node.prototype = new unilib.mvc.graph.GraphElement();
	
	/**
	 * getter returns the model
	 * @returns {?unilib.mvc.graph.GraphModel}
	 */
	unilib.mvc.graph.Node.prototype.getModel = function() {
		return this.model_;
	};
	
	/**
	 * setter for model
	 * here it is needed to set whether the node is in the graph or not.
	 * @param {?unilib.mvc.graph.GraphModel}
	 */
	unilib.mvc.graph.Node.prototype.setModel = function(model) {
		if (! (model instanceof unilib.mvc.graph.GraphModel) && model != null) {
			throw new unilib.mvc.graph.GraphModelError(
					'Invalid Node.setModel arguments');
		}
		var oldModel = this.model_;
		this.model_ = model;
		//generally a node does not change model (it just doesn't make much sense) 
		//but just passes from null to a model or from a model to null.
		if (oldModel) {
			if (oldModel.hasNode(this)) oldModel.removeNode(this);
			//notify removal to old model
			var evt = new unilib.interfaces.observer.ObserverEvent(
					unilib.interfaces.observer.ObserverEventType.REMOVE, this);
			oldModel.notify(evt);
		}
		if (model) {
			//notify addition to new model
			var evt = new unilib.interfaces.observer.ObserverEvent(
					unilib.interfaces.observer.ObserverEventType.ADD, this);
			model.notify(evt);
		}
	};
	
	/**
	 * create a new Pin and add it to the node, a Pin is private to the Node
	 * 	and can not be assigned to other nodes.
	 * @param {unilib.mvc.graph.PinDirection} 
	 * 	[direction=unilib.mvc.graph.PinDirection.UNKNOWN]
	 * @returns {unilib.mvc.graph.Pin}
	 */
	unilib.mvc.graph.Node.prototype.makePin = function(direction) {
			var pin = new unilib.mvc.graph.Pin(this, direction);
			this.pins_.push(pin);
			return pin;
	};
	
	/**
	 * add an existing pin to this node, note that a pin can belong to only 
	 * one node at a time.
	 * @param {unilib.mvc.graph.Pin} pin pin to be added
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Node.prototype.addPin = function(pin) {
		if (! (pin instanceof unilib.mvc.graph.Pin)) { 
			throw new unilib.mvc.graph.GraphModelError('Invalid pin instance');
		}
		if (this.pins_.indexOf(pin) == -1) {
			this.pins_.push(pin);
			if (pin.getOwner() != this) pin.setOwner(this);
		}
	};
	
	/**
	 * check if the node owns a given Pin
	 * @param {unilib.mvc.graph.Pin} pin pin to be added
	 * @returns {boolean}
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Node.prototype.hasPin = function(pin) {
		if (! (pin instanceof unilib.mvc.graph.Pin)) { 
			throw new unilib.mvc.graph.GraphModelError('Invalid pin instance');
		}
		if (this.pins_.indexOf(pin) != -1) return true;
		return false;
	};
	
	/**
	 * remove pin from Node, this function can preserve edge linking or remove
	 * 	all linked edges from the pin
	 * @param {unilib.mvc.graph.Pin} pin pin to remove
	 * @param {boolean} [keepEdges=true] whether to preserve edge 
	 * 	linking or not
	 * @throws {unilib.mvc.graph.GraphModelError}
	 * @todo {FEATURE} add flag to give possibility to remove edges from model
	 * 	instead of leaving them pending from other pins  
	 */
	unilib.mvc.graph.Node.prototype.removePin = function(pin, keepEdges) {
		if (! (pin instanceof unilib.mvc.graph.Pin)) {
			throw new unilib.mvc.graph.GraphModelError('Invalid pin instance');
		}
		keepEdges = (keepEdges == undefined) ? true : keepEdges;
		var index = this.pins_.indexOf(pin);
		if (index != -1) {
			this.pins_.splice(index, 1);
			//unlink pin from all edges and set pin model to null
			pin.setOwner(null);
			if (! keepEdges) {
				for (i = pin.createIterator(); ! i.end(); i.next()) {
					pin.unlink(i.item());
				}
			}
		}
	};
	
	/**
	 * moves a pin from a node to another preserving edges
	 * @param {unilib.mvc.graph.Pin} pin pin to be moved, must belong to the Node
	 * 	on which is called the method.
	 * @param {unilib.mvc.graph.Node} dst destination node, 
	 * 	where to move the pin.
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Node.prototype.movePin = function(pin, dst) {
		if (! (pin instanceof unilib.mvc.graph.Pin)) {
			throw new unilib.mvc.graph.GraphModelError('Invalid Pin');
		}
		if (! (dst instanceof unilib.mvc.graph.Node)) {
			throw new unilib.mvc.graph.GraphModelError('Invalid destination Node');
		}
		if (! this.hasPin(pin)) {
			throw new unilib.mvc.graph.GraphModelError('Cannot move a pin not ' +
					'belonging to this Node');
		}
		this.removePin(pin);
		dst.addPin(pin);
	};
	
	/**
	 * create an iterator for Pin elements in the node
	 * @returns {unilib.interfaces.iterator.Iterator}
	 */
	unilib.mvc.graph.Node.prototype.createIterator = function() {
		return new unilib.interfaces.iterator.ArrayIterator(unilib.copyObject(this.pins_));
	}
	
	// ---------------------------- Pin -----------------------------------------
	
	/**
	 * Pin class represents a Pin from/to which a Edge can be created.
	 * @private
	 * @class
	 * @extends {unilib.mvc.graph.GraphElement}
	 * @param {unilib.mvc.graph.Node} owner node containing the pin
	 * @param {unilib.mvc.graph.PinDirection} [direction=
	 * 	unilib.mvc.graph.PinDirection.UNKNOWN] direction of the pin
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Pin = function(owner, direction) {
		if (! (owner) || ! (owner instanceof unilib.mvc.graph.Node)) {
			throw new unilib.mvc.graph.GraphModelError('Invalid Pin ' + 
					'constructor arguments');
		}
		/**
		 * Edges attached to this pin
		 * @type {Array.<unilib.mvc.graph.Pin>}
		 * @private
		 */
		this.edges_ = [];
		/**
		 * direction of the pin
		 * @type {unilib.mvc.graph.PinDirection}
		 * @private
		 */
		this.direction_ = (direction == undefined) ? 
				unilib.mvc.graph.PinDirection.UNKNOWN : direction;
		/**
		 * owner Node
		 * @type {unilib.mvc.graph.Node}
		 * @private
		 */
		this.owner_ = owner;
		
		//notify addition
		this.notifyAddition_();
	};
	unilib.mvc.graph.Pin.prototype = new unilib.mvc.graph.GraphElement();
	
	/**
	 * helper for adding an edge
	 * @param {unilib.mvc.graph.Edge} edge
	 * @returns {boolean}
	 * @private
	 */
	unilib.mvc.graph.Pin.prototype.appendEdge_ = function(edge) {
		var index = this.edges_.indexOf(edge);
		if (index == -1) {
			this.edges_.push(edge);
			return true;
		}
		return false;
	};
	
	/**
	 * helper for removing an edge
	 * @param {unilib.mvc.graph.Edge} edge
	 * @returns {boolean}
	 * @private
	 */
	unilib.mvc.graph.Pin.prototype.removeEdge_ = function(edge) {
		var index = this.edges_.indexOf(edge);
		if (index != -1) {
			this.edges_.splice(index, 1);
			return true;
		}
		return false;
	};
	
	/**
	 * get owner Node of this Pin
	 * @returns {unilib.mvc.graph.Node}
	 */
	unilib.mvc.graph.Pin.prototype.getOwner = function() {
		return this.owner_;
	};
	
	/**
	 * set owner Node of this Pin
	 * @param  {?unilib.mvc.graph.Node} node
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Pin.prototype.setOwner = function(node) {
		if (! (node instanceof unilib.mvc.graph.Node) && node != null) {
			throw new unilib.mvc.graph.GraphModelError('Invalid ' + 
					'setOwner arguments');
		}
		var oldOwner = this.owner_;
		// assign owner before calling functions on the nodes,
		// so if they check the owner they see it already changed and do not
		// attempt to re-update it 
		// (with the same value, resulting in an useless call)
		this.owner_ = node;
		if (oldOwner) {
			//remove pin from old node
			if (oldOwner.hasPin(this)) oldOwner.removePin(this);
			var evt = new unilib.interfaces.observer.ObserverEvent(
					unilib.interfaces.observer.ObserverEventType.REMOVE, this);
			var oldModel = oldOwner.getModel();
			if (oldModel) oldModel.notify(evt);
		}
		if (node) {
			if (! node.hasPin(this)) node.addPin(this);
			var evt = new unilib.interfaces.observer.ObserverEvent(
					unilib.interfaces.observer.ObserverEventType.ADD, this);
			var model = node.getModel();
			if (model) model.notify(evt);
		}
	};
	
	/**
	 * set direction for this Pin, note that this may create inconsistencies
	 * in the model if not properly handled
	 * @param {unilib.mvc.graph.PinDirection} direction new direction
	 */
	unilib.mvc.graph.Pin.prototype.setDirection = function(direction) {
		this.direction_ = direction;
	};
	
	/**
	 * get direction for this Pin
	 * @returns {unilib.mvc.graph.PinDirection}
	 */
	unilib.mvc.graph.Pin.prototype.getDirection = function() {
		return this.direction_;
	};
	
	/**
	 * Link this pin and another by creating an edge
	 * @param {unilib.mvc.graph.Pin} pin pin to be linked
	 * @returns {unilib.mvc.graph.Edge} edge describing the link
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Pin.prototype.makeConnection = function(pin) {
		if (! pin || ! pin instanceof unilib.mvc.graph.Pin) {
			throw new unilib.mvc.graph.GraphModelError('Invalid ' + 
					'makeConnection arguments');
		}
		if (this.direction_ == pin.getDirection() && 
				this.direction_ != unilib.mvc.graph.PinDirection.UNKNOWN) {
			throw new unilib.mvc.graph.GraphModelError('Inconsistent edge ' + 
					'can not be created');
		}
		for (var i = 0; i < this.edges_.length; i++) {
			if (this.edges_[i].linksTo(pin)) {
				throw new unilib.mvc.graph.GraphModelError('Edge already ' + 
						'existing, can not be created');
			}
		}
		var edge = new unilib.mvc.graph.Edge();
		this.link(edge);
		pin.link(edge);
		return edge;
	};
	
	/**
	 * Remove all connections between this and a given pin
	 * @param {unilib.mvc.graph.Pin} pin pin to be unlinked
	 * @throws {unilib.mvc.graph.GraphModelError}
	 * @todo {FEATURE} add flag (preserveEdge) to give possibility to remove 
	 * edges from model instead of leaving them pending from other pins 
	 */
	unilib.mvc.graph.Pin.prototype.clearConnections = function(pin) {
		if (! pin || ! pin instanceof unilib.mvc.graph.Pin) {
			throw new unilib.mvc.graph.GraphModelError('Invalid ' + 
					'clearConnection arguments');
		}
		if (pin != this) {
			/* keep in mind that unlink uses a splice() that each time shortens 
			 * the array.
			 */
			while (this.edges_[0]) {
				if (this.edges_[0].getStartPin() == pin || 
						this.edges_[0].getEndPin() == pin) {
					this.unlink(this.edges_[0]);
				}
			}
		}
		else {
			throw new unilib.mvc.graph.GraphModelError('clearConnections: can not ' +
					'remove conections to self');
		}
	};
	
	/**
	 * @see {unilib.mvc.graph.Pin#link}
	 * @param {unilib.mvc.graph.Edge} edge edge to be added
	 * @throws {unilib.mvc.graph.GraphModelError}
	 * @private
	 */
	unilib.mvc.graph.Pin.prototype.directedLink_ = function(edge) {
		//handle both IN and OUT directions
		var edgePin = (this.direction_ == unilib.mvc.graph.PinDirection.IN) ?
				edge.getEndPin() : edge.getStartPin();
		
		if (edgePin == this) {
			//edge is already set up (in a consistent way), just update the pin
			this.appendEdge_(edge);
		}
		else {
			//if (edgePin == any other pin)
			//the edge is not set up, needs to be initialised
			// push edge first so if setEndPin will check if this pin has the edge
			// it will find it and understand that the pin is already ok
			//edge.setEndPip will deal with previous linked pin update
			this.appendEdge_(edge);
			try {
				if (this.direction_ == unilib.mvc.graph.PinDirection.IN) {
					edge.setEndPin(this);
				}
				else {
					edge.setStartPin(this);
				}
			}
			catch(e) {
				this.removeEdge_(edge);
				throw new unilib.mvc.graph.GraphModelError('linking forbidden: ' +
				'model inconsistency detected');
			}
		}
	};
	
	/**
	 * @see {unilib.mvc.graph.Pin#link}
	 * @param {unilib.mvc.graph.Edge} edge edge to be added
	 * @param {unilib.mvc.graph.PinDirection} [position required to decide 
	 * where to put the pin reference if both start and end of the edge are 
	 * already not null (i.e. the function is used to change an existing 
	 * connection between two pins)
	 * @throws {unilib.mvc.graph.GraphModelError}
	 * @private
	 */
	unilib.mvc.graph.Pin.prototype.undirectedLink_ = function(edge, position) {
	//search for a free place where to put this pin
		if (edge.linksTo(this)) {
			//edge is already set up, just update the pin
			this.appendEdge_(edge);
		}
		else if (edge.getStartPin() == null) {
			this.appendEdge_(edge);
			//in case of failure remove the edge to
			//stay in a consistent state
			try {
				edge.setStartPin(this);
			}
			catch(e) {
				this.removeEdge_(edge);
				throw new unilib.mvc.graph.GraphModelError('linking forbidden: ' +
						'model inconsistency detected');
			}
		}
		else if (edge.getEndPin() == null) {
			this.appendEdge_(edge);
			//same as above, maintain consistency
			try {
				edge.setEndPin(this);
			}
			catch(e) {
				this.removeEdge_(edge);
				throw new unilib.mvc.graph.GraphModelError('linking forbidden: ' +
				'model inconsistency detected');
			}
		}
		else {
			// the edge is moved and it must be given a position argument
			// to know which side of the edge must be overwritten
			if (! position || position == unilib.mvc.graph.PinDirection.UNKNOWN) {
				throw new unilib.mvc.graph.GraphModelError('Unable to link ' + 
						'the Edge given, position argument is required and must ' +
						'be IN or OUT');
			}
			this.appendEdge_(edge);
			try {
				if (position == unilib.mvc.graph.PinDirection.IN) {
					//any other pin in edge.end will be detached by the edge
					edge.setEndPin(this);
				}
				else {
					edge.setStartPin(this);
				}
			}
			catch(e) {
				this.removeEdge_(edge);
				throw new unilib.mvc.graph.GraphModelError('linking forbidden: ' +
				'model inconsistency detected');
			}
		}
	};
	
	
	/**
	 * Adds an Edge to this Pin. This function can be used to register in the pin
	 * an already setup edge (that have a reference to this pin in it), to move
	 * an edge from a pin to this pin, to initialise an edge to point to this pin.
	 * @param {unilib.mvc.graph.Edge} edge edge to be added
	 * @param {unilib.mvc.graph.PinDirection} [position] if this pin has 
	 * unknown direction (undirected graph) a position is required to decide 
	 * where to put the pin reference if both start and end of the edge are 
	 * already not null (i.e. the function is used to change an existing 
	 * connection between two pins)
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Pin.prototype.link = function(edge, position) {
		if (! (edge instanceof unilib.mvc.graph.Edge)) {
			throw new unilib.mvc.graph.GraphModelError('Invalid Edge');
		}
		//in case of undirected graph
		if (this.direction_ == unilib.mvc.graph.PinDirection.UNKNOWN) {
			this.undirectedLink_(edge, position);
		}
		// in case of directed graph
		else if (this.direction_ == unilib.mvc.graph.PinDirection.IN || 
				this.direction_ == unilib.mvc.graph.PinDirection.OUT) {
			this.directedLink_(edge);
		}
	};
	
	/**
	 * Remove a Edge from pin. The edge side pointing to this pin
	 * 	is set to null.
	 * @param {unilib.mvc.graph.Edge} edge edge to remove
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Pin.prototype.unlink = function(edge) {
		if (! (edge instanceof unilib.mvc.graph.Edge)) {
			throw new unilib.mvc.graph.GraphModelError('Invalid Edge');
		}
		var removed = this.removeEdge_(edge);
		if (removed) {
			//note that removal can not lead to inconsistency
			if (edge.getEndPin() == this) {
				edge.setEndPin(null);
			}
			else if(edge.getStartPin() == this){
				edge.setStartPin(null);
			}
		}
		else {
			throw new unilib.mvc.graph.GraphModelError(
					'Edge not found, cannot remove it.');
		}
	};
	
	/**
	 * move an edge in the Pin to another pin, no need to specify
	 * 	a particular position for undirected graph
	 * @param {unilib.mvc.graph.Edge} edge edge to move
	 * @param {unilib.mvc.graph.Pin} dst destination Pin
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Pin.prototype.moveEdge = function(edge, dst) {
		if (! (edge instanceof unilib.mvc.graph.Edge)) {
			throw new unilib.mvc.graph.GraphModelError('Invalid Edge');
		}
		if (! (dst instanceof unilib.mvc.graph.Pin)) {
			throw new unilib.mvc.graph.GraphModelError('Invalid destination Pin');
		}
		if (! this.hasEdge(edge)) {
			throw new unilib.mvc.graph.GraphModelError('Cannot move an edge not ' +
					'linked to this Pin');
		}
		var start = (this == edge.getStartPin()) ? dst : edge.getStartPin();
		var end = (this == edge.getEndPin()) ? dst : edge.getEndPin();
		if (edge.canLink(start, end)) {
			this.unlink(edge);
			dst.link(edge);
		}
		else {
			throw new unilib.mvc.graph.GraphModelError('Can not move edge, ' + 
					'inconsistent pin linking');
		}
	};
	
	/**
	 * helper that search for an edge in the pin
	 * @param {unilib.mvc.graph.Edge} edge
	 * @returns {boolean}
	 */
	unilib.mvc.graph.Pin.prototype.hasEdge = function(edge) {
		var index = this.edges_.indexOf(edge);
		return (index == -1) ? false : true;
	};
	
	/**
	 * create an iterator for Edge elements attached to the pin
	 * @returns {unilib.interfaces.iterator.Iterator}
	 */
	unilib.mvc.graph.Pin.prototype.createIterator = function() {
		return new unilib.interfaces.iterator.ArrayIterator(unilib.copyObject(this.edges_));
	}
	
	/**
	 * @see {unilib.mvc.graph.GraphElement#getModel}
	 */
	unilib.mvc.graph.Pin.prototype.getModel = function() {
		if (this.owner_) {
			return this.owner_.getModel();
		}
		return null;
	};
	
	// ----------------------------------- Edge ---------------------------------
	
	/**
	 * Edge class represents a connection between two Pins, 
	 * 	it stores informations about direction of the edge
	 * 	and Pins involved
	 * @param {?unilib.mvc.graph.Pin} [start=null] start Pin
	 * @param {?unilib.mvc.graph.Pin} [end=null] end Pin
	 * @extends {unilib.mvc.graph.GraphElement}
	 * @class
	 */
	unilib.mvc.graph.Edge = function(start, end) {
		/**
		 * start Pin
		 * @type {?unilib.mvc.graph.Pin}
		 * @private
		 */
		this.start_ = start || null;
		
		/**
		 * end Pin
		 * @type {?unilib.mvc.graph.Pin}
		 * @private
		 */
		this.end_ = end || null;
	};
	unilib.mvc.graph.Edge.prototype = new unilib.mvc.graph.GraphElement();
	
	/**
	 * get start Pin of this Edge
	 * @returns {unilib.mvc.graph.Pin}
	 */
	unilib.mvc.graph.Edge.prototype.getStartPin = function() {
		return this.start_;
	};
	
	/**
	 * helper function to update a pin linked to this Edge
	 * @param {?unilib.mvc.graph.Pin} pin pin to update
	 */
	unilib.mvc.graph.Edge.prototype.updatePin_ = function(pin) {
		if (pin) {
			var isOldPin = (pin != this.start_) && (pin != this.end_);
			if (! isOldPin && ! pin.hasEdge(this)) {
				pin.link(this);
			}
			else if(isOldPin && pin.hasEdge(this)) {
				pin.unlink(this);
			}
		}
	};
	
	/**
	 * set start Pin of this Edge
	 * @param {?unilib.mvc.graph.Pin} pin pin to set as start
	 * @throw {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Edge.prototype.setStartPin = function(pin) {
		if (! (pin instanceof unilib.mvc.graph.Pin) && pin != null) {
			throw new unilib.mvc.graph.GraphModelError('Invalid Pin');
		}
		if (this.canLink(pin, this.end_)) {
			var old = this.start_;
			this.start_ = pin;
			this.updatePin_(pin);
			this.updatePin_(old);
		}
		else {
			throw new unilib.mvc.graph.GraphModelError(
					'Edge direction inconsistency.');
		}
	};
	
	/**
	 * get end Pin of this Edge
	 * @returns {unilib.mvc.graph.Pin}
	 */
	unilib.mvc.graph.Edge.prototype.getEndPin = function() {
		return this.end_;
	};
	
	/**
	 * set end Pin of this Edge
	 * @param {?unilib.mvc.graph.Pin} pin pin to set as end
	 * @throw {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Edge.prototype.setEndPin = function(pin) {
		if (! (pin instanceof unilib.mvc.graph.Pin) && pin != null) {
			throw new unilib.mvc.graph.GraphModelError('Invalid Pin');
		}
		if (this.canLink(this.start_, pin)) {
			var old = this.end_;
			this.end_ = pin;
			this.updatePin_(pin);
			this.updatePin_(old);
		}
		else {
			throw new unilib.mvc.graph.GraphModelError(
					'Edge direction inconsistency.');
		}
	};
	
	/**
	 * shorthand to check if the edge is connected to a pin
	 * @param {unilib.mvc.graph.Pin} pin pin to look for
	 * @returns {boolean}
	 */
	unilib.mvc.graph.Edge.prototype.linksTo = function(pin) {
		if (this.start_ == pin || this.end_ == pin) return true;
		return false;
	};
	
	/**
	 * check if making a Edge between two given pins is correct
	 * @param {unilib.mvc.graph.Pin} src
	 * @param {unilib.mvc.graph.Pin} dst
	 * @returns {boolean}
	 * @public
	 */
	unilib.mvc.graph.Edge.prototype.canLink = function(src, dst) {
		//can always link a pin to nothing
		if (src == null || dst == null) {
			if (src != null &&
					src.getDirection() != unilib.mvc.graph.PinDirection.IN) {
				return true;
			}
			if (dst != null && 
					dst.getDirection() != unilib.mvc.graph.PinDirection.OUT) {
				return true;
			}
			if (src == null && dst == null) {
				return true;
			}
			return false;
		}
		if (src == dst) {
			//self linking not allowed
			return false;
		}
		if (src.getDirection() != unilib.mvc.graph.PinDirection.IN && 
				dst.getDirection() != unilib.mvc.graph.PinDirection.OUT) {
			/*
			 * all these cases are compatible directions IN-OUT, OUT-IN or
			 * mixed something-UNKNOWN
			 */
			//check for redundant connections (2 edges linking the same 2 pins)
			var srcEdges = src.createIterator();
			for (srcEdges.begin(); ! srcEdges.end(); srcEdges.next()) {
				var edge = srcEdges.item();
				//check if exists another edge that kinks the two pins.
				//note that at the time of calling this edge may already result
				//linked in dst or src and the call was made to update this edge
				//for that linking, so we need to check that the edge is != this
				if (edge.linksTo(dst) && edge != this) {
					//a new edge between src and dst would be redundant
					return false;
				}
			}
			return true;
		}
		return false;
	};
	
	/**
	 * get model where the edge is linked, if the edge is not linked
	 * return null. Note that if the edge is linked both pins are in the
	 * same model.
	 * @see {unilib.mvc.graph.GraphElement#getModel}
	 */
	unilib.mvc.graph.Edge.prototype.getModel = function() {
		if (this.start_) {
			return this.start_.getModel();
		}
		else if (this.end_) {
			return this.end_.getModel();
		}
		else {
			return null;
		}
	};
	
}, ['unilib/error.js', 'unilib/interface/observer.js', 
    'unilib/interface/iterator.js', 'unilib/graphics/drawable.js']);
unilib.notifyLoaded();