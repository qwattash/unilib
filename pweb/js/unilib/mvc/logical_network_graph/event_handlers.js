/**
 * @fileOverview Command Factory Modules
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.ln
 */
unilib.provideNamespace('unilib.mvc.ln', function() {
    
  
  /**
   * command factory module for click events.
   * @class
   * @extends {unilib.interfaces.factory.IFactoryModule}
   * @param {unilib.mvc.graph.GraphModel} model
   * @param {unilib.mvc.view.StrategyView} view
   * @param {unilib.mvc.graph.GraphController} controller
   */
  unilib.mvc.ln.ClickEventObserver = function() {
    
  };
  unilib.inherit(unilib.mvc.ln.ClickEventObserver,
    unilib.interfaces.observer.Observer.prototype);
    
  /**
   * @see {unilib.interfaces.observer.Observer#update}
   */
  unilib.mvc.ln.ClickEventObserver.prototype.update = function(evt) {
    if (! this.canHandle_(evt)) return;
    //@todo
  };
  
  /**
   * tells if this observer can handle an event
   * @private
   * @param {unilib.mvc.controller.ViewEvent} evt
   * @returns {boolean}
   */
  unilib.mvc.ln.ClickEventObserver.prototype.canHandle_ = function(evt) {
    if (evt.getEventType() == 'click') {
      return true;
    }
    return false;
  };
  
  /**
   * command factory module for drag & drop events.
   * @class
   * @extends {unilib.interfaces.observer.Observer}
   * @param {unilib.mvc.command.CommandHandler} commandHandler
   */
  unilib.mvc.ln.DragDropEventObserver = function(commandHandler) {
    
    /**
     * command handler object to handle undo redo and execution of commands
     * @type {unilib.mvc.command.CommandHandler}
     * @private
     */
    this.commandHandler_ = commandHandler;
    
    /**
     * target data property at the beginning of the operation to be used in
     * case of abortion
     * @type {unilib.mvc.graph.BaseGraphElementData}
     * @private
     */
    this.startingTargetData_ = null;
    
    /**
     * difference between mouse x and position.x at the beginning of
     * the drag
     * @type {number}
     * @private
     */
    this.mouseOffsetX_ = 0;
    
    /**
     * difference between mouse y and position.y at the beginning of
     * the drag
     * @type {number}
     * @private
     */
    this.mouseOffsetY_ = 0;
    
  };
  unilib.inherit(unilib.mvc.ln.DragDropEventObserver,
    unilib.interfaces.observer.Observer.prototype);
  
  /**
   * store starting state of the graph
   * @private
   * @param {unilib.mvc.graph.GraphElement} target
   */
  unilib.mvc.ln.DragDropEventObserver.prototype.storeStartingData_ = 
    function(target) {
      //save starting state of the target (drag events always have one)
      this.startingTargetData_ = target.getData();
      
  };
  
  /**
   * get command for the specific target
   * @param 
   * @returns {unilib.mvc.controller.BaseCommand}
   */
  unilib.mvc.ln.DragDropEventObserver.prototype.getCommand_ = function(target, 
    targetPosition, undo, startingData) {
    var cmd;
    if (target.getID() == unilib.mvc.ln.GraphElementType.PIN) {
      cmd = new unilib.mvc.ln.command.MovePinElementCommand(target, 
        targetPosition, undo, startingData);
    }
    else if (target.getID() == unilib.mvc.ln.GraphElementType.EDGE) {
      cmd = new unilib.mvc.ln.command.MoveEdgeElementCommand(target, 
        targetPosition, undo, startingData);
    }
    else {
      //some node type
      cmd = new unilib.mvc.ln.command.MoveNodeElementCommand(target, 
        targetPosition, undo, startingData);
    }
    return cmd;
  };
  
  /**
   * @see {unilib.interfaces.observer.Observer#update}
   */
  unilib.mvc.ln.DragDropEventObserver.prototype.update = function(evt) {
    if (this.canHandle_(evt) == false) return;
    if (evt.getEventType() == unilib.mvc.controller.DragDropEvent.DRAGSTART) {
      this.storeStartingData_(evt.getTarget());
      //save mouse offset relative to target origin
      this.mouseOffsetX_ = evt.position.x - 
        (this.startingTargetData_.position.x + 
         this.startingTargetData_.points[0].x);
      this.mouseOffsetY_ = evt.position.y - 
        (this.startingTargetData_.position.y + 
         this.startingTargetData_.points[0].y);
    }
    else if (evt.getEventType() == unilib.mvc.controller.DragDropEvent.DRAG ||
      evt.getEventType() == unilib.mvc.controller.DragDropEvent.DRAGEND) {
      //perform dragging operation
      //get target event position relative to mouse and get element translation
      var targetPosition = new unilib.geometry.Point3D(
        evt.position.x - this.mouseOffsetX_,
        evt.position.y - this.mouseOffsetY_,
        evt.getTarget().getData().position.z);
      //create command that takes care of translation
      var undo = (evt.getEventType() == 
        unilib.mvc.controller.DragDropEvent.DRAG) ? false : true;
      var startingData = (undo) ? this.startingTargetData_ : null;
      var cmd = this.getCommand_(evt.getTarget(), targetPosition, undo, startingData);
      this.commandHandler_.exec(cmd);
    }
    else if (evt.getEventType() == unilib.mvc.controller.DragDropEvent.DROP) {
      //note that drop event, if generated, is fired immediately 
      //AFTER! the DRAGEND
      //forbid any collision by undoing reversible translation executed before
      this.commandHandler_.undo();
    }
  };
  
  /**
   * tells if this observer can handle an event
   * @private
   * @param {unilib.mvc.controller.ViewEvent} evt
   * @returns {boolean}
   */
  unilib.mvc.ln.DragDropEventObserver.prototype.canHandle_ = function(evt) {
    if (evt.getEventType() == unilib.mvc.controller.DragDropEvent.DRAGSTART ||
      evt.getEventType() == unilib.mvc.controller.DragDropEvent.DRAGEND ||
      evt.getEventType() == unilib.mvc.controller.DragDropEvent.DRAG ||
      evt.getEventType() == unilib.mvc.controller.DragDropEvent.DROP) {
      return true;
    }
    return false;
  };
  
}, ['unilib/error.js', 'unilib/mvc/graph/model.js', 
    'unilib/mvc/controller/event_manager.js', 
    'unilib/mvc/logical_network_graph/command.js',
    'unilib/mvc/logical_network_graph/drawable_strategy.js',
    'unilib/geometry/geometry.js']);
unilib.notifyLoaded();