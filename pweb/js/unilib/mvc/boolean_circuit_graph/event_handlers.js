/**
 * @fileOverview Command Factory Modules
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.notifyStart('unilib/mvc/boolean_circuit_graph/event_handlers.js');

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
  };
  unilib.inherit(unilib.mvc.bc.ClickEventObserver,
    unilib.interfaces.observer.Observer.prototype);
  
  /**
   * helper, select given element
   * @param {?Object} element
   * @private
   */
  unilib.mvc.bc.ClickEventObserver.prototype.select_ = function(element) {
    //do not select menu elements
    if (element && element.getID() != unilib.mvc.menu.MenuType.MENU) {
      this.controller_.selectionManager.select(element);
    }
  };
  
  /**
   * helper, deselect all elements except given one,
   * if element is null all elements are deselected
   * @param {?Object} element
   * @private
   */
  unilib.mvc.bc.ClickEventObserver.prototype.deselect_ = function(element) {
    this.controller_.selectionManager.deselectAll(element);
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
    if (this.controller_.addNodeMenuModel.getPosition() != null) {
      var cmd = new unilib.mvc.bc.command.HideCtxMenuCommand(
        this.controller_.addNodeMenuModel);
      this.controller_.exec(cmd);
    }
    if (this.controller_.nodeMenuModel.getPosition() != null) {
      var cmd = new unilib.mvc.bc.command.HideCtxMenuCommand(
        this.controller_.nodeMenuModel);
      this.controller_.exec(cmd);
    }
    if (this.controller_.pinMenuModel.getPosition() != null) {
      var cmd = new unilib.mvc.bc.command.HideCtxMenuCommand(
        this.controller_.pinMenuModel);
      this.controller_.exec(cmd);
    }
    if (this.controller_.edgeMenuModel.getPosition() != null) {
      var cmd = new unilib.mvc.bc.command.HideCtxMenuCommand(
        this.controller_.edgeMenuModel);
      this.controller_.exec(cmd);
    }
  };
  
  /**
   * open main menu
   * @param {unilib.geometry.Point3D} position
   * @param {unilib.mvc.graph.GraphElement} target
   * @private
   */
  unilib.mvc.bc.ClickEventObserver.prototype.openMenu_ = function(position, 
    target) {
    var id = (target != null) ? target.getID() : null;
    position.z = 10; //menu always in foreground
    if (id == unilib.mvc.bc.GraphElementType.INPUT_NODE ||
        id == unilib.mvc.bc.GraphElementType.OUTPUT_NODE ||
        id == unilib.mvc.bc.GraphElementType.AND_NODE ||
        id == unilib.mvc.bc.GraphElementType.OR_NODE ||
        id == unilib.mvc.bc.GraphElementType.NOT_NODE ||
        id == unilib.mvc.bc.GraphElementType.NOR_NODE ||
        id == unilib.mvc.bc.GraphElementType.NAND_NODE ||
        id == unilib.mvc.bc.GraphElementType.XOR_NODE ||
        id == unilib.mvc.bc.GraphElementType.XNOR_NODE) {
      var cmd = new unilib.mvc.bc.command.ShowCtxMenuCommand(
          this.controller_.nodeMenuModel);
        cmd.setup(position);
        this.controller_.exec(cmd);
    }
    else if (id == unilib.mvc.bc.GraphElementType.INPUT_PIN ||
             id == unilib.mvc.bc.GraphElementType.OUTPUT_PIN) {
        var cmd = new unilib.mvc.bc.command.ShowCtxMenuCommand(
          this.controller_.pinMenuModel);
        cmd.setup(position);
        this.controller_.exec(cmd);
    }
    else if (id == unilib.mvc.bc.GraphElementType.EDGE) {
      var cmd = new unilib.mvc.bc.command.ShowCtxMenuCommand(
          this.controller_.edgeMenuModel);
        cmd.setup(position);
        this.controller_.exec(cmd);
    }
    else {
      if (this.controller_.mainMenuModel.getPosition() == null) {
        var cmd = new unilib.mvc.bc.command.ShowCtxMenuCommand(
          this.controller_.mainMenuModel);
        cmd.setup(position);
        this.controller_.exec(cmd);
      }
    }
  };
  
  
  /**
   * perform menu action if the click is on the menu
   * @param {unilib.mvc.controller.ViewEvent} evt
   * @returns {unilib.mvc.bc.command.MenuCommand}
   * @private
   */
  unilib.mvc.bc.ClickEventObserver.prototype.getMenuAction_ = 
    function(evt) {
    if (!evt.getTarget() || 
      evt.getTarget().getID() != unilib.mvc.menu.MenuType.MENU) {
      return;
    }
    //associate position to item clicked
    var drawableManager = this.controller_.drawableManager;
    var menuDrawable = drawableManager.getDrawableFromElement(evt.getTarget());
    //traslate relative to container drawable;
    position = new unilib.geometry.Point3D();
    position.z = null;
    position.x = evt.position.x - menuDrawable.getPosition().x;
    position.y = evt.position.y - menuDrawable.getPosition().y;
    //get index of the item clicked in the menu
    var i = menuDrawable.createDrawableIterator();
    var targetIndex = 0; // index of the selected item in the menu
    while (! i.end()) {
      if (i.item().getID() == unilib.graphics.DrawableShapeType.SHAPE_TEXT) {
        if (i.item().isAt(position)) {
          break;
        }
        else {
          targetIndex++;
        }
      }
      i.next();
    }
    //get item at targetIndex in the menu model
    var j = evt.getTarget().createItemIterator();
    try {
      for (var k = 0; k < targetIndex; k++) {
        j.next();
      }
      var targetItem = j.item();
    }
    catch (e) {
      //Iterator overflow
      throw new unilib.error.UnilibError('Menu model does not' + 
        ' match representation');
    }
    //perform item action
    var cmd = targetItem.getRelatedCommand().getInstance();
    cmd.setup(new unilib.geometry.Point3D(evt.position.x, evt.position.y, 0));
    return cmd;
  };
  
  /**
   * @see {unilib.interfaces.observer.Observer#update}
   */
  unilib.mvc.bc.ClickEventObserver.prototype.update = function(evt) {
    if (! this.canHandle_(evt)) return;
    switch (evt.keymap.button) {
      case unilib.mvc.controller.EventButtonType.BUTTON_LEFT:
        console.log(this.controller_.drawableManager.getDrawableFromElement(evt.getTarget()));//@TODO DBG
        cmd = this.getMenuAction_(evt);
        this.closeMenu_();
        if (cmd) this.controller_.exec(cmd);
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
        this.closeMenu_(null);
        var menuPosition = new unilib.geometry.Point3D(evt.position.x, 
            evt.position.y, 1);
        if (evt.getTarget() == null) {
          //deselect all
          this.deselect_(null);
          //show main menu in target position
          this.openMenu_(menuPosition);
        }
        else {
          //select element
          this.select_(evt.getTarget());
          //show menu for the target in target position
          this.openMenu_(menuPosition, evt.getTarget());
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
    
    /**
     * saved target after drag start
     * @type {unilib.mvc.graph.GraphElement}
     * @private
     */
    this.target_ = null;
    
    /**
     * state informations for the commands
     * @type {Object}
     * @private
     */
    this.commandState_ = {};
    
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
   * @param {unilib.mvc.graph.GraphElement} target
   * @param {unilib.geometry.Point3D} targetPosition
   * @param {boolean} undo
   * @param {unilib.mvc.graph.BaseGraphElementData} startingData
   * @returns {unilib.mvc.controller.BaseCommand}
   */
  unilib.mvc.bc.DragDropEventObserver.prototype.getCommand_ = function(target, 
    targetPosition, undo, startingData) {
    var cmd;
    if (target.getID() == unilib.mvc.bc.GraphElementType.INPUT_PIN ||
        target.getID() == unilib.mvc.bc.GraphElementType.OUTPUT_PIN) {
      cmd = new unilib.mvc.bc.command.MovePinElementCommand(target, 
        targetPosition, undo, startingData, this.commandState_);
    }
    else if (target.getID() == unilib.mvc.bc.GraphElementType.EDGE) {
      /*
       * the target position must be modified because the edge is
       * stored in a non conventional way, this has been an error!
       */
      targetPosition.x += this.mouseOffsetX_;
      targetPosition.y += this.mouseOffsetY_;
      /*
       * track segment in the edge that has been clicked
       * using a state object, this is something like a memento pattern 
       */
      cmd = new unilib.mvc.bc.command.MoveEdgeElementCommand(target, 
        targetPosition, undo, startingData, this.commandHandler_, 
        this.commandState_);
    }
    else {
      //some node type
      cmd = new unilib.mvc.bc.command.MoveNodeElementCommand(target, 
        targetPosition, undo, startingData, this.commandState_);
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
      //clear edge dragging state upon new drag
      this.commandState_ = {};
      //save mouse offset relative to target origin
      this.mouseOffsetX_ = evt.position.x - 
        (this.startingTargetData_.position.x + 
         this.startingTargetData_.points[0].x);
      this.mouseOffsetY_ = evt.position.y - 
        (this.startingTargetData_.position.y + 
         this.startingTargetData_.points[0].y);
         this.target_ = evt.getTarget();
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
      var cmd = this.getCommand_(this.target_, targetPosition, undo, startingData);
      if (evt.getEventType() == unilib.mvc.controller.DragDropEvent.DRAGEND) {
        //reset target on dragend
        this.target_ = null;
      }
      this.commandHandler_.exec(cmd);
    }
    else if (evt.getEventType() == unilib.mvc.controller.DragDropEvent.DROP) {
      //@TODO-----------------------------------------------------------------------------------------------------------------------
      //console.log(evt.getTarget());
      //console.log(this.commandHandler_.drawableManager.getDrawableFromElement(evt.getTarget()));
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
      if (evt.getTarget().getID() != unilib.mvc.menu.MenuType.MENU) {
        return true;
      }
    }
    return false;
  };
  
  
  /**
   * command factory module for keyboard events.
   * @class
   * @extends {unilib.interfaces.observer.Observer}
   * @param {unilib.mvc.command.CommandHandler} commandHandler
   */
  unilib.mvc.bc.KeyEventObserver = function(commandHandler) {
    
    /**
     * command handler object to handle undo redo and execution of commands
     * @type {unilib.mvc.command.CommandHandler}
     * @private
     */
    this.commandHandler_ = commandHandler;
    
    /**
     * arrow translation step, number of pixel of
     * translation when an object is moved with an arrow
     * @type {number}
     * @private
     */
    this.arrowTranslationStep_ = 10;
    
  };
  unilib.inherit(unilib.mvc.bc.KeyEventObserver,
    unilib.interfaces.observer.Observer.prototype);
  
  /**
   * get command for the specific target
   * @param {unilib.geometry.Point} translation
   * @param {unilib.mvc.graph.GraphElement} target
   * @private
   */
  unilib.mvc.bc.KeyEventObserver.prototype.moveElement_ = function(translation, 
    target) {
    var cmd;
    //calculate new position
    var data = target.getData();
    var position = data.position;
    position.x += translation.x;
    position.y += translation.y;
    //build command
    if (target.getID() == unilib.mvc.bc.GraphElementType.INPUT_PIN ||
        target.getID() == unilib.mvc.bc.GraphElementType.OUTPUT_PIN) {
      cmd = new unilib.mvc.bc.command.MovePinElementCommand(target, 
        position, true, null, {});
      this.commandHandler_.exec(cmd);
    }
    else if (target.getID() == unilib.mvc.bc.GraphElementType.EDGE) {
      /*
       * A single edge segment can not be moved because the segment clicked 
       * can not easily be recovered, it would be better to change the 
       * architecture of the drawing system in order to make this type 
       * of changes easier.
       * Instead call the move command for each edge segment.
       * Note that the first and the last segments are not moved, this is because
       * they are attached to a pin that takes care of them if it they should be
       * moved.
       */
      var edgeData = target.getData(); //note that the data are cloned
      var nEdges = edgeData.points.length - 1;
      for (var i = 1; i < nEdges - 1; i++) {
        var newEdgePos = new unilib.geometry.Point();
        newEdgePos.x = position.x + edgeData.points[i].x;
        newEdgePos.y = position.y + edgeData.points[i].y;
        cmd = new unilib.mvc.bc.command.MoveEdgeElementCommand(target, 
        newEdgePos, true, null, this.commandHandler_, {"segment": i});
        this.commandHandler_.exec(cmd);
      }
    }
    else {
      //some node type
      cmd = new unilib.mvc.bc.command.MoveNodeElementCommand(target, 
        position, true, null, {});
      this.commandHandler_.exec(cmd);
      /*
       * check for overlapping at new position, if there is overlapping undo
       */
      var drawable = 
        this.commandHandler_.drawableManager.getDrawableFromElement(target);
      var colliding = 
        this.commandHandler_.drawableManager.getOverlappingDrawables(drawable);
      if (colliding.length > 0) {
        this.commandHandler_.undo();
      }
    }
  };
  
  /**
   * handle writing on node lables, may be keydown or keypress
   * @param {unilib.mvc.view.ViewEvent} evt
   * @private
   */
  unilib.mvc.bc.KeyEventObserver.prototype.handleWriting_ = function(evt) {
    //edit element label
    var selection = this.commandHandler_.selectionManager.getSelection();
    var target = null;
    //search selection for a valid target: eg. edges are not labelled
    for (var i = 0; i < selection.length; i++) {
      if (selection[i].getID() != unilib.mvc.bc.GraphElementType.EDGE) {
        target = selection[i];
        break;
      }
    }
    if (target) {
      //edit target label
      if (evt.keymap.isKeyPrintable || 
          evt.keymap.key == 
          unilib.mvc.controller.NonPrintableKeyCode.BACKSPACE) {
        var cmd = new unilib.mvc.bc.command.ChangeTextCommand(target, 
          evt.keymap.key);
        this.commandHandler_.exec(cmd);
      }
    }
  };
  
  /**
   * @see {unilib.interfaces.observer.Observer#update}
   */
  unilib.mvc.bc.KeyEventObserver.prototype.update = function(evt) {
    if (this.canHandle_(evt) == false) return;
    if (evt.getEventType() == 'keydown') {
      var selection = this.commandHandler_.selectionManager.getSelection();
      for (var i = 0; i < selection.length; i++) {
        switch(evt.keymap.key) {
          case unilib.mvc.controller.NonPrintableKeyCode.UP:
            this.moveElement_(
              new unilib.geometry.Point(0, -this.arrowTranslationStep_), 
              selection[i]);
          break;
          case unilib.mvc.controller.NonPrintableKeyCode.DOWN:
            this.moveElement_(
              new unilib.geometry.Point(0, this.arrowTranslationStep_), 
              selection[i]);
          break;
          case unilib.mvc.controller.NonPrintableKeyCode.LEFT:
            this.moveElement_(
              new unilib.geometry.Point(-this.arrowTranslationStep_, 0), 
              selection[i]);
          break;
          case unilib.mvc.controller.NonPrintableKeyCode.RIGHT:
            this.moveElement_(
              new unilib.geometry.Point(this.arrowTranslationStep_, 0), 
              selection[i]);
          break;
          case unilib.mvc.controller.NonPrintableKeyCode.BACKSPACE:
            this.handleWriting_(evt);
          break;
        }
      }
      //console.log('down', evt.keymap.isKeyPrintable, evt.keymap.key);
    }
    else if (evt.getEventType() == 'keyup') {
      //console.log('up', evt.keymap.isKeyPrintable, evt.keymap.key);
    }
    else if (evt.getEventType() == 'keypress') {
      this.handleWriting_(evt);
    }
  };
  
  /**
   * tells if this observer can handle an event
   * @private
   * @param {unilib.mvc.controller.ViewEvent} evt
   * @returns {boolean}
   */
  unilib.mvc.bc.KeyEventObserver.prototype.canHandle_ = function(evt) {
    if (evt.getEventType() == 'keydown' ||
      evt.getEventType() == 'keypress' ||
      evt.getEventType() == 'keyup') {
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