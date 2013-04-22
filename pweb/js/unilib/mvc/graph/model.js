/**
 * @fileOverview model for graph-like representations
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.graph
 */
unilib.provideNamespace('unilib.mvc.graph', function() {
	
	/**
	 * base iterator class for traversing graph
	 * @todo put this in the interface namespace??
	 * @constructor
	 */
	unilib.mvc.graph.Iterator = function() {};
	
	/**
	 * error class for GraphModel
	 * @constructor
	 * @extends unilib.error.UnilibError
	 */
	unilib.mvc.graph.GraphModelError = function() {};
	unilib.mvc.graph.GraphModelError.prototype = new unilib.error.UnilibError();
	
	/**
	 * enumeration for pin directions, i.e. output, input, etc.
	 * @enum {string}
	 */
	unilib.mvc.graph.PinDirection = {
			IN: 'input',
			OUT: 'output',
			UNKNOWN: 'unknown'
	};
	
	/**
	 * model class, implements observable interface. Graph is stored 
	 * 	as adjacency matrix
	 * @constructor
	 * @extends unilib.interfaces.Observable
	 */
	unilib.mvc.graph.GraphModel = function() {
		/**
		 * nodes array
		 * @type {Array.<unilib.mvc.graph.Node>}
		 * @private
		 */
		this.nodes_ = [];
	};
	unilib.mvc.graph.GraphModel.prototype = new unilib.interfaces.Observable();
	
	/**
	 * create a Node bound to this model
	 * @returns {unilib.mvc.graph.Node}
	 */
	unilib.mvc.graph.GraphModel.prototype.createNode = function() {
		return new unilib.mvc.graph.Node(this);
	};
	
	/**
	 * add a node to graph
	 * @param {unilib.mvc.graph.Node} node node to add
	 * @throws {unilib.mvc.graph.GraphModelError} if Node already exists
	 */
	unilib.mvc.graph.GraphModel.prototype.addNode = function(node) {
		if (this.nodes_.indexOf(node) == -1) {
			this.nodes_.push(node);
		}
		else {
			throw new unilib.mvc.graph.GraphModelError('can\'t add given node, ' + 
					'node already in the graph');
		}
	};
	
	/**
	 * remove node from graph, note that this has cascade effects on Pins and
	 * 	Links connected to deleted Node
	 * @param {unilib.mvc.graph.Node} node node to add
	 * @throws {unilib.mvc.graph.GraphModelError} if Node does not exists
	 */
	unilib.mvc.graph.GraphModel.prototype.removeNode = function(node) {
		var index = this.nodes_.indexOf(node);
		if (index != -1) {
			this.nodes_.splice(index, 1);
		}
		else {
			throw new unilib.mvc.graph.GraphModelError('can\'t remove unexisting node');
		}
	};
	
	/**
	 * add given pin to given Node
	 * @param {unilib.mvc.graph.Node} node node to which add the pin
	 * @param {unilib.mvc.graph.Pin} pin pin to add
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.GraphModel.prototype.addPin = function(node, pin) {};
	
	/**
	 * remove pin from given node
	 * @param {unilib.mvc.graph.Node} node node from which remove the pin
	 * @param {unilib.mvc.graph.Pin} pin pin to remove
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.GraphModel.prototype.removePin = function(node, pin) {};
	
	/**
	 * add a link to model
	 * @param {unilib.mvc.graph.Link} link link to add
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.GraphModel.prototype.link = function(link) {};
	
	/**
	 * remove a link from model
	 * @param {unilib.mvc.graph.Link} link link to remove
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.GraphModel.prototype.unlink = function(link) {};
	
	/**
	 * create an iterator for Nodes in the graph
	 * @returns {unilib.mvc.graph.Iterator}
	 */
	unilib.mvc.graph.GraphModel.prototype.createNodeIterator = function() {};
	
	/**
	 * create an iterator for Pins in the graph
	 * @returns {unilib.mvc.graph.Iterator}
	 */
	unilib.mvc.graph.GraphModel.prototype.createPinIterator = function() {};
	
	/**
	 * create an iterator for Links in the graph
	 * @returns {unilib.mvc.graph.Iterator}
	 */
	unilib.mvc.graph.GraphModel.prototype.createLinkItrator = function() {};
	
	/**
	 * base class for all elements of the graph
	 * @constructor
	 */
	unilib.mvc.graph.GraphElement = function() {
		//@todo
	};
	
	/**
	 * Node class represents a node of the graph, it has a content and a number
	 * 	of Pins attached to it.
	 * @param {unilib.mvc.graph.GraphModel} owner model that owns the node
	 * @extends {unilib.mvc.graph.GraphElement}
	 * @constructor
	 */
	unilib.mvc.graph.Node = function(owner) {
		if (!owner) throw new unilib.mvc.graph.GraphModelError('Node constructor' +
				' require an owner');
		/**
		 * model that owns the Node
		 * @type {unilib.mvc.graph.GraphModel}
		 * @private
		 */
		this.owner_ = owner;
		/**
		 * array of pins in the node
		 * @type {Array.<unilib.mvc.graph.Pin>}
		 * @private
		 */
		this.pins_ = [];
	};
	unilib.mvc.graph.Node.prototype = new unilib.mvc.graph.GraphElement();
	
	/**
	 * getter for owner model
	 * @returns {unilib.mvc.graph.GraphModel}
	 */
	unilib.mvc.graph.Node.prototype.getOwner = function() {
		return this.owner_;
	};
	
	/**
	 * create a pin bound to this Node
	 * @returns {unilib.mvc.graph.Pin}
	 */
	unilib.mvc.graph.Node.prototype.createPin = function() {
		return new unilib.mvc.graph.Pin(this);
	};
	
	/**
	 * add pin to this node
	 * @param {unilib.mvc.graph.Pin} pin pin to add to the Node
	 * @throw {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Node.prototype.addPin = function(pin) {
		if (this.pins_.indexOf(pin) == -1) {
			this.pins_.push(pin);
		}
		else {
			throw new unilib.mvc.graph.GraphModelError('can\'t add a pin already' +
					' present in the Node');
		}
	};
	
	/**
	 * remove pin from Node
	 * @param {unilib.mvc.graph.Pin} pin pin to remove
	 * @throws {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Node.prototype.removePin = function(pin) {
		var index = this.pins_.indexOf(pin);
		if (index != -1) {
			this.pins_.splice(index, 1);
		}
		else {
			throw new unilib.mvc.graph.GraphModelError('can\'t remove' + 
					' unexisting pin');
		}
	};
	
	/**
	 * Pin class represents a Pin from/to which a Link can be created.
	 * @param {unilib.mvc.graph.Node} owner node containing the pin
	 * @param {unilib.mvc.graph.PinDirection=} direction direction of the pin
	 * 	default unilib.mvc.graph.PinDirection.UNKNOWN
	 * @throws {unilib.mvc.graph.GraphModelError}
	 * @extends {unilib.mvc.graph.GraphElement}
	 * @constructor
	 */
	unilib.mvc.graph.Pin = function(owner, direction) {
		/**
		 * links attached to this pin
		 * @type {Array.<unilib.mvc.graph.Pin>}
		 * @private
		 */
		this.links_ = [];
		/**
		 * direction of the pin
		 * @type {unilib.mvc.graph.PinDirection}
		 * @private
		 */
		this.direction_ = direction || unilib.mvc.graph.PinDirection.UNKNOWN;
		if (! owner instanceof unilib.mvc.graph.Node) {
			throw new unilib.mvc.graph.GraphModelError('An owner Node must be ' + 
					'specified when crating a Pin');
		}
		/**
		 * owner Node
		 * @type {unilib.mvc.graph.Node}
		 * @private
		 */
		this.owner_ = owner;
	};
	unilib.mvc.graph.Pin.prototype = new unilib.mvc.graph.GraphElement();
	
	/**
	 * get owner Node of this Pin
	 * @returns {unilib.mvc.graph.Node}
	 */
	unilib.mvc.graph.Pin.prototype.getOwner = function() {
		return this.owner_;
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
	 * create a Link with proper start/end on this pin
	 * @returns {unilib.mvc.graph.Link}
	 */
	unilib.mvc.graph.Pin.prototype.createLink = function() {
		var start = (this.direction_ == unilib.mvc.graph.PinDirection.OUT) ? 
				this : null;
		var end = (this.direction_ == unilib.mvc.graph.PinDirection.IN) ?
				this : null;
		return new unilib.mvc.graph.Link(start, end);
	};
	
	/**
	 * Link class represents a connection between two Pins, 
	 * 	it stores informations about direction of the link
	 * 	and Pins involved
	 * @param {?unilib.mvc.graph.Pin=} start start Pin
	 * @param {?unilib.mvc.graph.Pin=} end end Pin
	 * @extends {unilib.mvc.graph.GraphElement}
	 * @constructor
	 */
	unilib.mvc.graph.Link = function(start, end) {
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
	unilib.mvc.graph.Link.prototype = new unilib.mvc.graph.GraphElement();
	
	/**
	 * get start Pin of this Link
	 * @returns {unilib.mvc.graph.Pin}
	 */
	unilib.mvc.graph.Link.prototype.getStartPin = function() {
		return this.start_;
	};
	
	/**
	 * set start Pin of this Link
	 * @param {?unilib.mvc.graph.Pin} pin pin to set as start
	 * @throw {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Link.prototype.setStartPin = function() {
//		//throw new Error('Not Yet Implemented');
		//@todo
	};
	
	/**
	 * get end Pin of this Link
	 * @returns {unilib.mvc.graph.Pin}
	 */
	unilib.mvc.graph.Link.prototype.getEndPin = function() {
		return this.end_;
	};
	
	/**
	 * set end Pin of this Link
	 * @param {?unilib.mvc.graph.Pin} pin pin to set as end
	 * @throw {unilib.mvc.graph.GraphModelError}
	 */
	unilib.mvc.graph.Link.prototype.setEndPin = function(pin) {
		//throw new Error('Not Yet Implemented');
		//@todo
	};
	
}, ['unilib/error.js', 'unilib/interface/observer.js']);