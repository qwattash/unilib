/**
 * @fileOverview Command Factory Modules
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.bc
 */
unilib.provideNamespace('unilib.mvc.bc', function() {
    
  
  /**
   * command factory module for click events.
   * @class
   * @extends {unilib.interfaces.factory.IFactoryModule}
   * @param {unilib.mvc.bc.BooleanCircuitController} controller
   */
  unilib.mvc.bc.ClickEventObserver = function(controller) {
    
    /**
     * command handler object to handle undo redo and execution of commands
     * @type {unilib.mvc.bc.BooleanCircuitController}
     * @private
     */
    this.controller_ = controller;
    
    /**
     * list of selected drawables, used as shorthand to
     * avoid traversing the drawableManager to look for them
     * @type {Array.<Object>}
     * @private
     */
    this.selected_ = [];
  };
  unilib.inherit(unilib.mvc.bc.ClickEventObserver,
    unilib.interfaces.observer.Observer.prototype);
  
  /**
   * build select command for given element
   * @param {Object} element
   * @private
   */
  unilib.mvc.bc.ClickEventObserver.prototype.getSelectCommand_ = 
    function(element) {
    return new unilib.mvc.bc.command.SelectElementCommand(element, 
      this.controller_.drawableManager);    
  };
  
  /**
   * build deselect command for given element
   * @param {Object} element
   * @private
   */
  unilib.mvc.bc.ClickEventObserver.prototype.getDeselectCommand_ = 
    function(element) {
    return new unilib.mvc.bc.command.DeselectElementCommand(element, 
      this.controller_.drawableManager);    
  };
  
  /**
   * helper, select given element
   * @param {?Object} element
   * @private
   */
  unilib.mvc.bc.ClickEventObserver.prototype.select_ = function(element) {
    if (element == null) return;
    for (var i = 0; i < this.selected_.length; i++) {
      if (this.selected_[i] == element) {
        //if already selected do nothing
        return;
      }
    }
    this.selected_.push(element);
    var cmd = this.getSelectCommand_(element);
    this.controller_.exec(cmd);
  };
  
  /**
   * helper, deselect all elements except given one,
   * if element is null all elements are deselected
   * @param {?Object} element
   * @private
   */
  unilib.mvc.bc.ClickEventObserver.prototype.deselect_ = function(element) {
    var i = 0;
    while (i < this.selected_.length) {
      if (element == null || this.selected_[i] != element) {
        var cmd = this.getDeselectCommand_(this.selected_[i]);
        this.controller_.exec(cmd);
        this.selected_.splice(i, 1);
      }
      else {
        //skip the element that is not removed
        i++;
      }
    }
  };
  
  /**
   * close all menu
   * @private
   */
  unilib.mvc.bc.ClickEventObserver.prototype.closeMenu_ = function() {
    if (this.controller_.mainMenuModel.getPosition() != null) {
      var cmd = new unilib.mvc.bc.command.HideCtxMenuCommand(
        this.controller_.mainMenuModel);
      this.controller_.exec(cmd);
    }
  };
  
  /**
   * @see {unilib.interfaces.observer.Observer#update}
   */
  unilib.mvc.bc.ClickEventObserver.prototype.update = function(evt) {
    if (! this.canHandle_(evt)) return;
    switch (evt.keymap.button) {
      case unilib.mvc.controller.EventButtonType.BUTTON_LEFT:
        this.closeMenu_();
        if (evt.keymap.shiftKey) {
          //if the shift key is pressed just select the target
          this.select_(evt.getTarget());
        }
        else {
          //if the shift key is not pressed
          //deselect all selected elements (except the one to be selected
          // if it is already selected)
          this.deselect_(evt.getTarget());
          //now select the target
          this.select_(evt.getTarget());
        }
        break;
      case unilib.mvc.controller.EventButtonType.BUTTON_RIGHT:
        if (evt.getTarget() == null) {
          //deselect all
          this.deselect_(null);
          //show main menu in target position
          var menuPosition = new unilib.geometry.Point3D(evt.position.x, 
            evt.position.y, 1);
          var cmd = new unilib.mvc.bc.command.ShowCtxMenuCommand(
            this.controller_.mainMenuModel, menuPosition);
          this.controller_.exec(cmd);
        }
        break;
    }
  };
  
  /**
   * tells if this observer can handle an event
   * @private
   * @param {unilib.mvc.controller.ViewEvent} evt
   * @returns {boolean}
   */
  unilib.mvc.bc.ClickEventObserver.prototype.canHandle_ = function(evt) {
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
  unilib.mvc.bc.DragDropEventObserver = function(commandHandler) {
    
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
  unilib.inherit(unilib.mvc.bc.DragDropEventObserver,
    unilib.interfaces.observer.Observer.prototype);
  
  /**
   * store starting state of the graph
   * @private
   * @param {unilib.mvc.graph.GraphElement} target
   */
  unilib.mvc.bc.DragDropEventObserver.prototype.storeStartingData_ = 
    function(target) {
      //save starting state of the target (drag events always have one)
      this.startingTargetData_ = target.getData();
      
  };
  
  /**
   * get command for the specific target
   * @param 
   * @returns {unilib.mvc.controller.BaseCommand}
   */
  unilib.mvc.bc.DragDropEventObserver.prototype.getCommand_ = function(target, 
    targetPosition, undo, startingData) {
    var cmd;
    if (target.getID() == unilib.mvc.bc.GraphElementType.PIN) {
      cmd = new unilib.mvc.bc.command.MovePinElementCommand(target, 
        targetPosition, undo, startingData);
    }
    else if (target.getID() == unilib.mvc.bc.GraphElementType.EDGE) {
      cmd = new unilib.mvc.bc.command.MoveEdgeElementCommand(target, 
        targetPosition, undo, startingData);
    }
    else {
      //some node type
      cmd = new unilib.mvc.bc.command.MoveNodeElementCommand(target, 
        targetPosition, undo, startingData);
    }
    return cmd;
  };
  
  /**
   * @see {unilib.interfaces.observer.Observer#update}
   */
  unilib.mvc.bc.DragDropEventObserver.prototype.update = function(evt) {
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
  unilib.mvc.bc.DragDropEventObserver.prototype.canHandle_ = function(evt) {
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
    'unilib/mvc/boolean_circuit_graph/command.js',
    'unilib/mvc/boolean_circuit_graph/drawable_strategy.js',
    'unilib/mvc/menu/model.js',
    'unilib/geometry/geometry.js']);
unilib.notifyLoaded();