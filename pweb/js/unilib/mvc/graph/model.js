/**
 * @fileOverview model for graph-like representations
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @todo
 * [FEAT] add flags to Pin::removeEdge to remove edges from both ends when keepEdges==false
 * [FEAT] add flag to Pin::clearConnections to remove edge from both ends of the connection
 * [FEAT] check for cross-model inconsistencies (something in a model linked to something in another model)
 * [REFACTORING] reduce possible errors in accessing the model from GraphElements by getModel.
 *   May decide to change visibility to GraphModel from parameter to internal instance in GraphElement
 * so that it is always accessible no matter if the GraphElement is currently in the model or not.
 *   This will reduce error likelihood since removes:
 *   i) strict order dependency among certain function calls
 *   ii) (maybe) possibility to change model of an element while it is linked
 *       to elements from the model, resulting in a cross-model inconsistency
 * [REFACTORING] make GraphElement implement the drawable interface (e.g. extending CompositeDrawableShape)
 *    this removes the need of a duplicate strategy inside the view and gives more consistency to the model
 *    moreover that moves all the burden of creating and updating drawables either in a model factory or 
 *    in the model elements themselves (by subclassing). 
 *    This is good again because changes are more localised, in particular
 *    i) GraphElementData might no more be needed since data stored is modified by subclassing 
 *      base model elements
 *    ii) Drawables are already updated since now the drawable IS the model (as it should be) so it
 *      is sufficient for the view to call draw() on it with the right renderer context
 *    iii) The element drawable composition logic is delgated to a single factory class rather then being
 *      replicated among the model factory and the drawable strategies
 *    This is bad because
 *    i) the view and the model are tightly coupled, a different view (e.g. something that shows a list of
 *      coordinates does not need the drawables implemented in the model)
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
    message = 'GraphModelError > ' + message;
    unilib.error.UnilibError.apply(this, [message]);
  };
  unilib.inherit(unilib.mvc.graph.GraphModelError,
      unilib.error.UnilibError.prototype);
  
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
  
  /* General rules followed when implementing the notification of changes;
   * event types are shown in round brackets.
   * i) after creation of an element the creator is responsible of notifying
   *   the addition (ADD) and eventually a change in its internal state (UPDATE)
   *   other than the addition of the object in the internal buffer
   * ii) after removal of an element the remover is responsible of notifying
   *   the removal (REMOVE) of the element and the change in its internal state
   *   (UPDATE) other than the removal of the object in the internal buffer; 
   *   cascade operations MUST be notified.
   * iii) after the update of and element, the element updated is responsible of
   *   notifying the change in its state (UPDATE)
   */
  
  /**
   * helper class used to merge notification requests in a unique event
   * to be sent to Observers
   * @class
   */
  unilib.mvc.graph.NotificationManager = function() {
    /**
     * event list used to regroup all received events
     * @type {Array.<unilib.mvc.model.ModelEvent>}
     * @private
     */
    this.eventList_ = [];
  };
  
  /**
   * handle notification conflicts among notifications.
   * Conflicting notifications:
   * <ul>
   * <li>
   * i) occur only with notifications with same source
   * </li>
   * <li>
   * i.i) REMOVE notification deletes all other notifications from
   *   that object since ADD or UPDATES are rendered useless by the removal but
   *   REMOVE event is added to the buffer.
   * </li>
   * <li>
   * i.ii) ADD after a REMOVE is changed to an UPDATE since some changes may
   *   have been made while the element was removed
   * </li>
   * <li>
   * i.iii) UPDATE after an ADD is ignored since the ADD event is supposed to
   *   cause a full read of the state of the element added
   * </li>
   * <li>
   * i.iv) UPDATE after a REMOVE is illegal, causes exception
   * </li>
   * <li>
   * i.v) ADD after an UPDATE is illegal, causes exception
   * </li>
   * <li>
   * i.vi) in case of same event present in buffer evt is ignored
   * </li>
   * <li>
   * ii) due to this handling only a resulting event is kept in the buffer
   *   for each source
   * </li>
   * <ul>
   * @param {unilib.mvc.model.ModelEvent} evt
   * @returns {boolean} true if the evt passed should be added to the buffer
   * @private
   */
  unilib.mvc.graph.NotificationManager.prototype.handleConflicts_ = 
    function(evt) {
    var i = 0;
    var keepEvt = true; //tells if evt should be added to the buffer
    while (i < this.eventList_.length) {
      /* (see other notes on break below)
       * note: for reason (ii) after having found a match the cycle breaks
       * since no other event can be in the buffer with the same source.
       */
      // if (i) is true: check for conflicts
      if (this.eventList_[i].getTarget() == evt.getTarget()) {
        switch (evt.getEventType()) {
        //if (i.vi)
        case this.eventList_[i].getEventType():
          //same event is already in the buffer, ignore
          keepEvt = false;
          break;
        //if (i.i) REMOVE
        case unilib.mvc.model.ModelEventType.REMOVE:
          //remove events from notifications buffer
          this.eventList_.splice(i, 1);
          break;
        //if (i.ii) || (i.v) ADD after REMOVE or UPDATE
        case unilib.mvc.model.ModelEventType.ADD:
          switch (this.eventList_[i].getEventType()) {
          //if (i.ii) ADD after REMOVE
          case unilib.mvc.model.ModelEventType.REMOVE:
            //change to UPDATE
            this.eventList_[i] = new unilib.mvc.model.ModelEvent(
                unilib.mvc.model.ModelEventType.UPDATE,
                this.eventList_[i].getTarget()); 
            //note that this UPDATE event can not be duplicate in the buffer
            //because of (i.i) and (i.iv)
            keepEvt = false;
            break;
          //if (i.v) ADD after UPDATE
          case unilib.mvc.model.ModelEventType.UPDATE:
            //illegal
            throw new unilib.mvc.graph.GraphModelError('Illegal event found:' +
                ' ADD after UPDATE');
            break; //useless but included for readability
          }
          break;
        //if (i.iii) || (i.iv) UPDATE after ADD or REMOVE
        case unilib.mvc.model.ModelEventType.UPDATE:
          switch (this.eventList_[i].getEventType()) {
          //if (i.iii) UPDATE after ADD
          case unilib.mvc.model.ModelEventType.ADD:
            //ignore
            keepEvt = false;
            break;
          //if (i.iv) UPDATE after REMOVE
          case unilib.mvc.model.ModelEventType.REMOVE:
            //illegal
            throw new unilib.mvc.graph.GraphModelError('Illegal event: ' + 
                'UPDATE after REMOVE');
            break; //useless  but included for readability
          }
          break; //useless  but included for readability
        }
      /* break while cycle since it has been found a correspondence in
       * the event buffer.
       * For reason (ii) after having found a match the cycle breaks
       * since no other event can be in the buffer with the same source.
       */
      break; 
      }
      i++;
    }
    return keepEvt;
  };
  
  /**
   * add notification event to the buffer if same event is not present.
   * In addition conflicting events are resolved i.e. ADD + REMOVE of same
   * element results in a null modification, so the will not be in the final
   * notification.
   * @param {!unilib.mvc.model.ModelEvent} evt
   */
  unilib.mvc.graph.NotificationManager.prototype.notify = function(evt) {
    if (! evt) {
      throw new unilib.mvc.graph.GraphModelError('Invalid ' + 
          'NotificationManager::notify arguments');
    }
    var addEvt = this.handleConflicts_(evt);
    if (addEvt) this.eventList_.push(evt);
  };
  
  /**
   * flush event buffer, all stored notifications are lost
   */
  unilib.mvc.graph.NotificationManager.prototype.flush = function() {
    this.eventList_ = [];
  };
  
  /**
   * return the unique notification event
   * @param {unilib.interfaces.observer.Observer} observer
   */
  unilib.mvc.graph.NotificationManager.prototype.notifyTo = 
    function(observer) {
    for (var i = 0; i < this.eventList_.length; i++) {
      observer.update(this.eventList_[i]);
    }
  };
  
  /**
   * notification helper for update events
   * @param {unilib.mvc.graph.GraphElement} source source of the event
   */
  unilib.mvc.graph.NotificationManager.prototype.notifyUpdate = 
    function(source) {
      this.notify(new unilib.mvc.model.ModelEvent(
          unilib.mvc.model.ModelEventType.UPDATE, source));
  };
  
  /**
   * notification helper for remove events
   * @param {?object} source source of the event
   */
  unilib.mvc.graph.NotificationManager.prototype.notifyRemoval = 
    function(source) {
      this.notify(new unilib.mvc.model.ModelEvent(
          unilib.mvc.model.ModelEventType.REMOVE, source));
  };
  
  /**
   * notification helper for add events
   * @param {?object} source source of the event
   */
  unilib.mvc.graph.NotificationManager.prototype.notifyAddition = 
    function(source) {
      this.notify(new unilib.mvc.model.ModelEvent(
          unilib.mvc.model.ModelEventType.ADD, source));
  };
  
  // ----------------------------- Graph Element Data -------------------------
  
  /**
   * basic data needed for the position, shape and resize of elements of 
   * the graph
   * @class
   * @extends {unilib.interfaces.clonable.IClonable}
   */
  unilib.mvc.graph.BaseGraphElementData = function() {
    
    /**
     * positioning of the element
     * @type {unilib.geometry.Point3D}
     * @public
     */
    this.position = new unilib.geometry.Point3D(0, 0, 0);
    
    /**
     * array of points used to create the shape of the element using
     * some rule
     * @type {Array.<unilib.geometry.Point}
     * @public
     */
    this.points = [];
    
    /**
     * text associated with the element
     * @type {string}
     * @public
     */
    this.text = '';
  };
  unilib.inherit(unilib.mvc.graph.BaseGraphElementData, 
      unilib.interfaces.clonable.IClonable.prototype);
  
  /**
   * @see {unilib.interfaces.clonable.IClonable#clone}
   */
  unilib.mvc.graph.BaseGraphElementData.prototype.clone = function() {
    return unilib.cloneObject(this);
  };
  
  // ----------------------------- Graph Model --------------------------------
  
  /**
   * model class, implements observable interface. It helps coordinating all 
   * the work of internal elements.
   * @class
   * @extends unilib.interfaces.observer.Observable
   *   for checking the consistency of the graph
   */
  unilib.mvc.graph.GraphModel = function() {
    unilib.interfaces.observer.Observable.call(this);
    /**
     * nodes array
     * @type {Array.<unilib.mvc.graph.Node>}
     * @private
     */
    this.nodes_ = [];
    
    /**
     * notification manager, used by GraphElements to handle cascade 
     *   notifications
     * @type {unilib.mvc.graph.NotificationManager}
     * @public
     */
    this.notificationManager = new unilib.mvc.graph.NotificationManager();
  };
  unilib.inherit(unilib.mvc.graph.GraphModel,
      unilib.interfaces.observer.Observable.prototype);
  
  /**
   * create a node and add it to the graph
   * @returns {unilib.mvc.graph.Node}
   */
  unilib.mvc.graph.GraphModel.prototype.makeNode = function() {
    var node = new unilib.mvc.graph.Node(this);
    this.nodes_.push(node);
    //the adder notifies the addition
    if (this.notificationManager)
      this.notificationManager.notifyAddition(node);
    return node;
  };
  
  /**
   * add given node to the graph
   * @param {unilib.mvc.graph.Node} node
   */
  unilib.mvc.graph.GraphModel.prototype.addNode = function(node) {
    if (! (node instanceof unilib.mvc.graph.Node)) { 
      throw new unilib.mvc.graph.GraphModelError('Invalid node instance');
    }
    var index = this.nodes_.indexOf(node);
    if (index == -1) {
      this.nodes_.push(node);
      //adder notify addition
      this.notificationManager.notifyAddition(node);
      if (node.getModel() != this) node.setModel(this);
    }
    //else node is already in the graph
  };
  
  /**
   * remove node from graph, note that this has cascade effects on Pins and
   *   Edges connected to deleted Node
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
      //remover notify removal
      this.notificationManager.notifyRemoval(node);
      if (node.getModel() == this) {
        //update node since node::model == this
        for (var i = node.createIterator(); ! i.end(); i.next()) {
          node.removePin(i.item(), false);
        }
        /*
         * WARNING: it is crucial to issue a setModel(null) AFTER having 
         * removed the pins, otherwise the node will not be able to
         * send notifications to the model
         */
        node.setModel(null);
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
    //note that copyObject make a shallow copy
    return new unilib.interfaces.iterator.ArrayIterator(
        unilib.copyObject(this.nodes_));
  };
  
  /**
   * override Observable::notify to check notificationManager status
   * @see {unilib.interfaces.observer.Observable#notify}
   */
  unilib.mvc.graph.GraphModel.prototype.notify = function(evt) {
    //evt passed is ignored since what has to be notified is found in the
    //notification manager
    if (this.notificationManager) {
      for (var i = 0; i < this.observers_.length; i++) {
        this.notificationManager.notifyTo(this.observers_[i]);
      }
      this.notificationManager.flush();
    }
    else {
      throw new unilib.mvc.graph.GraphModelError('Missing ' +
          'notification manager');
    }
  };
  
  //----------------------------------- GraphElement -------------------------
  
  /**
   * base class for all elements of the graph, it provides all functionalities
   * to handle drawing and positioning of graph elements, as well as a 
   * notification interface that is used to implement the observer pattern
   * in the model.
   * @private
   * @abstract
   * @class
   */
  unilib.mvc.graph.GraphElement = function() {
    
    /**
     * ID of the descriptor, useful for distinguishing elements
     * it is not assumed to be unique
     * @type {string | number}
     * @protected
     */
    this.id_;
    
    /**
     * data object that can be used to customise graph informations
     * @type {unilib.interfaces.clonable.IClonable}
     * @protected
     */
    this.data_ = new unilib.mvc.graph.BaseGraphElementData();
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawableProvider#setID}
   */
  unilib.mvc.graph.GraphElement.prototype.setID = function(id) {
    this.id_ = id;
    this.notifyUpdate_(this);
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawableProvider#getID}
   */
  unilib.mvc.graph.GraphElement.prototype.getID = function() {
    return this.id_;
  };
  
  /**
   * set custom data for the element
   * @param {unilib.interfaces.clonable.IClonable} data data to be set
   */
  unilib.mvc.graph.GraphElement.prototype.setData = function(data) {
    this.data_ = data.clone();
    this.notifyUpdate_(this);
  };
  
  /**
   * get custom data for the element
   * @returns {unilib.interfaces.clonable.IClonable} the custom data
   */
  unilib.mvc.graph.GraphElement.prototype.getData = function() {
    return this.data_.clone();
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
   * @param {unilib.mvc.graph.GraphElement} src source of the event
   * @protected
   */
  unilib.mvc.graph.GraphElement.prototype.notifyUpdate_ = function(src) {
    var model = this.getModel();
    if (model && model.notificationManager) 
      model.notificationManager.notifyUpdate(src);
  };
  
  /**
   * notification helper for remove events
   * @param {unilib.mvc.graph.GraphElement} src source of the event
   * @protected
   */
  unilib.mvc.graph.GraphElement.prototype.notifyRemoval_ = function(src) {
    var model = this.getModel();
    if (model && model.notificationManager) 
      model.notificationManager.notifyRemoval(src);
  };
  
  /**
   * notification helper for add events
   * @param {unilib.mvc.graph.GraphElement} src source of the event
   * @protected
   */
  unilib.mvc.graph.GraphElement.prototype.notifyAddition_ = function(src) {
    var model = this.getModel();
    if (model && model.notificationManager) 
      model.notificationManager.notifyAddition(src);
  };
  
  // --------------------------------- Node -----------------------------------
  
  /**
   * Node class represents a node of the graph, it provides some drawing
   * informations and a number of Pins that are used to group Edges.
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
    unilib.mvc.graph.GraphElement.call(this);
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
  };
  unilib.inherit(unilib.mvc.graph.Node, 
      unilib.mvc.graph.GraphElement.prototype);
  
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
      //notify removal to old model is done by removeNode since 
      //the model is the remover
    }
    if (model && ! model.hasNode(this)) {
      model.addNode(this);
      //addition to new model is notified by model since it is the
      //adder that has to notify
    }
  };
  
  /**
   * create a new Pin and add it to the node, a Pin is private to the Node
   *   and can not be assigned to other nodes.
   * @param {unilib.mvc.graph.PinDirection} 
   *   [direction=unilib.mvc.graph.PinDirection.UNKNOWN]
   * @returns {unilib.mvc.graph.Pin}
   */
  unilib.mvc.graph.Node.prototype.makePin = function(direction) {
      var pin = new unilib.mvc.graph.Pin(this, direction);
      this.pins_.push(pin);
      //adder notify addition
      this.notifyAddition_(pin);
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
      this.notifyAddition_(pin);
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
   *   all linked edges from the pin
   * @param {unilib.mvc.graph.Pin} pin pin to remove
   * @param {boolean} [keepEdges=true] whether to preserve edge 
   *   linking or not
   * @throws {unilib.mvc.graph.GraphModelError}
   * @todo {FEATURE} add flag to give possibility to remove edges from model
   *   instead of leaving them pending from other pins  
   */
  unilib.mvc.graph.Node.prototype.removePin = function(pin, keepEdges) {
    if (! (pin instanceof unilib.mvc.graph.Pin)) {
      throw new unilib.mvc.graph.GraphModelError('Invalid pin instance');
    }
    keepEdges = (keepEdges == undefined) ? true : keepEdges;
    var index = this.pins_.indexOf(pin);
    if (index != -1) {
      this.pins_.splice(index, 1);
      //remover notify removal
      this.notifyRemoval_(pin);
      //unlink pin from all edges and set pin model to null
      if (! keepEdges) {
        for (i = pin.createIterator(); ! i.end(); i.next()) {
          pin.unlink(i.item());
        }
      }
      /*
       * WARNING setOwner(null) MUST be issued AFTER unlinking
       * otherwise the pin will non be able to notify to model
       */
      pin.setOwner(null);
    }
  };
  
  /**
   * moves a pin from a node to another preserving edges
   * @param {unilib.mvc.graph.Pin} pin pin to be moved, must belong to the Node
   *   on which is called the method.
   * @param {unilib.mvc.graph.Node} dst destination node, 
   *   where to move the pin.
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
  };
  
  // ---------------------------- Pin -----------------------------------------
  
  /**
   * Pin class represents a Pin from/to which a Edge can be created.
   * @private
   * @class
   * @extends {unilib.mvc.graph.GraphElement}
   * @param {unilib.mvc.graph.Node} owner node containing the pin
   * @param {unilib.mvc.graph.PinDirection} [direction=
   *   unilib.mvc.graph.PinDirection.UNKNOWN] direction of the pin
   * @throws {unilib.mvc.graph.GraphModelError}
   */
  unilib.mvc.graph.Pin = function(owner, direction) {
    if (! (owner) || ! (owner instanceof unilib.mvc.graph.Node)) {
      throw new unilib.mvc.graph.GraphModelError('Invalid Pin ' + 
          'constructor arguments');
    }
    unilib.mvc.graph.GraphElement.call(this);
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
  };
  unilib.inherit(unilib.mvc.graph.Pin,
      unilib.mvc.graph.GraphElement.prototype);
  
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
      //old owner will notify the removal as it is the remover
    }
    if (node) {
      if (! node.hasPin(this)) node.addPin(this);
      //node will notify the addition as it is the adder
    }
  };
  
  /**
   * set direction for this Pin, note that this may create inconsistencies
   * in the model if not properly handled
   * @param {unilib.mvc.graph.PinDirection} direction new direction
   */
  unilib.mvc.graph.Pin.prototype.setDirection = function(direction) {
    this.direction_ = direction;
    this.notifyUpdate_(this);
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
    //this.notifyAddition_(edge); not needed, link function does that
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
      for (var i = this.createIterator(); ! i.end(); i.next()) {
        if (i.item().linksTo(pin)) {
          this.unlink(i.item());
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
    //notification of addition or update of the edge is done by the edge
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
   *   is set to null.
   * @param {unilib.mvc.graph.Edge} edge edge to remove
   * @throws {unilib.mvc.graph.GraphModelError}
   */
  unilib.mvc.graph.Pin.prototype.unlink = function(edge) {
    if (! (edge instanceof unilib.mvc.graph.Edge)) {
      throw new unilib.mvc.graph.GraphModelError('Invalid Edge');
    }
    var removed = this.removeEdge_(edge);
    if (removed) {
      //removal or update of the edge is notified by setEndPin or setStartPin
      //note that removal can not lead to inconsistency (see Pin::link)
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
   *   a particular position for undirected graph
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
  };
  
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
   *   it stores informations about direction of the edge
   *   and Pins involved
   * @param {?unilib.mvc.graph.Pin} [start=null] start Pin
   * @param {?unilib.mvc.graph.Pin} [end=null] end Pin
   * @extends {unilib.mvc.graph.GraphElement}
   * @class
   */
  unilib.mvc.graph.Edge = function(start, end) {
    unilib.mvc.graph.GraphElement.call(this);
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
  unilib.inherit(unilib.mvc.graph.Edge, 
      unilib.mvc.graph.GraphElement.prototype);
  
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
      //notification must be done before assignment of the pin, since
      //the model is reachable only before removing the Edge
      if (this.start_ != null && this.end_ == null && pin == null) {
        //edge removed from model
        this.notifyRemoval_(this);
      }
      else if ((this.start_ != null || this.end_ != null) && 
                (pin != null || this.end_ != null)) {
        //edge changed start pin
        this.notifyUpdate_(this);
      }
      //proceed with assignment
      var old = this.start_;
      this.start_ = pin;
      //notification of the addition must be done after assignment since
      //the model is not reachable before.
      if (old == null && this.end_ == null && pin != null) {
        //edge added to the model
        this.notifyAddition_(this);
      }
      //update connected nodes
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
      //notification must be done before assignment of the pin, since
      //the model is reachable only before removing the Edge
      if (this.end_ != null && this.start_ == null && pin == null) {
        //edge removed from model
        this.notifyRemoval_(this);
      }
      else if ((this.end_ != null || this.start_ != null) && 
          (pin != null || this.start_ != null)) {
        //edge changed start pin
        this.notifyUpdate_(this);
      }
      //proceed with assignment
      var old = this.end_;
      this.end_ = pin;
      //notification of the addition must be done after assignment since
      //the model is not reachable before.
      if (old == null && this.start_ == null && pin != null) {
        //edge added to the model
        this.notifyAddition_(this);
      }
      //update connected nodes
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
    if (this.start_ && this.start_.getModel()) {
      return this.start_.getModel();
    }
    else if (this.end_ && this.end_.getModel()) {
      return this.end_.getModel();
    }
    else {
      return null;
    }
  };
  
}, ['unilib/error.js', 'unilib/interface/observer.js', 
    'unilib/interface/iterator.js', 'unilib/mvc/model.js', 
    'unilib/interface/clonable.js', 'unilib/geometry/geometry.js']);
unilib.notifyLoaded();