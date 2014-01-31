/**
 * @fileOverview Graph-specific commands
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.bc.command
 */
unilib.provideNamespace('unilib.mvc.bc.command', function() {
  
	/**
   * move generic element both reversible and irreversible variants 
   * are supported, base class used by more specific commands that
   * perform various additional checks
   * @class
   * @extends {unilib.mvc.controller.BaseCommand}
   * @param {unilib.mvc.graph.GraphElement} element
   * @param {unilib.geometry,Point3D} position target position
   * @param {boolean} [reversible=false] if the command can be undone
   * @param {unilib.mvc.graph.BaseGraphElementData} [startingData=null] 
   *  if command is reversible then starting data for undo operation can 
   *  be specified. Default to data of the element at the time of exec()
   */
  unilib.mvc.bc.command.MoveElementCommand = 
    function(element, position, undo, startingData) {
    
    /**
     * target element
     * @type {unilib.mcv.graph.GraphElement}
     * @protected
     */
    this.target_ = element;
    
    /**
     * undo-ability flag
     * @type {boolean}
     * @protected
     */
    this.undo_ = (undo === undefined) ? false : undo;
    
    /**
     * starting data for undo
     * @type {?unilib.mvc.graph.BaseGraphElementData}
     * @protected
     */
    this.startingData_ = null;
    if (startingData == null && this.undo_) {
        this.startingData_ = this.target_.getData();
    }
    else if (startingData && this.undo_){
      this.startingData_ = startingData;
    }
    
    /**
     * target position
     * @type {unilib.geometry.Point3D}
     * @protected
     */
    this.position_ = position;
  };
  unilib.inherit(unilib.mvc.bc.command.MoveElementCommand, 
    unilib.mvc.controller.BaseCommand.prototype);
  
  /**
   * @see {unilib.mvc.controller.BaseCommand#exec}
   */  
  unilib.mvc.bc.command.MoveElementCommand.prototype.exec = function() {
    var targetData = this.target_.getData();
    targetData.position.x = this.position_.x;
    targetData.position.y = this.position_.y;
    targetData.position.z = this.position_.z;
    this.target_.setData(targetData);
    this.target_.getModel().notify();
  };
  
  /**
   * @see {unilib.mvc.controller.BaseCommand#undo}
   */
  unilib.mvc.bc.command.MoveElementCommand.prototype.undo = function() {
    if (this.undo_) {
      this.target_.setData(this.startingData_);
      this.target_.getModel().notify();
    }
  };

  /**
   * @see {unilib.mvc.controller.BaseCommand#isReversible}
   */
  unilib.mvc.bc.command.MoveElementCommand.prototype.isReversible = 
    function() {
    return this.undo_;
  };
  
  /**
   * move node element; both reversible and irreversible variants are supported
   * @class
   * @extends {unilib.mvc.controller.BaseCommand}
   * @param {unilib.mvc.graph.GraphElement} element
   * @param {unilib.geometry,Point3D} position target position
   * @param {boolean} [reversible=false] if the command can be undone
   * @param {unilib.mvc.graph.BaseGraphElementData} [startingData=null] 
   *  if command is reversible then starting data for undo operation can 
   *  be specified. Default to data of the element at the time of exec()
   */
  unilib.mvc.bc.command.MoveNodeElementCommand = 
    function(element, position, undo, startingData) {
    unilib.mvc.bc.command.MoveElementCommand.call(this, element, position, 
      undo, startingData);
  };
  unilib.inherit(unilib.mvc.bc.command.MoveNodeElementCommand, 
    unilib.mvc.bc.command.MoveElementCommand.prototype);
    
  /**
   * @see {unilib.mvc.controller.BaseCommand#exec}
   */  
  unilib.mvc.bc.command.MoveNodeElementCommand.prototype.exec = function() {
    //translate node
    var targetData = this.target_.getData();
    var translation = new unilib.geometry.Point3D();
    translation.x = this.position_.x - targetData.position.x;
    translation.y = this.position_.y - targetData.position.y;
    translation.z = this.position_.z - targetData.position.z;
    targetData.position.x = this.position_.x;
    targetData.position.y = this.position_.y;
    targetData.position.z = this.position_.z;
    this.target_.setData(targetData);
    //translate pins attached to the node
    for (var i = this.target_.createIterator(); !i.end(); i.next()) {
      targetData = i.item().getData();
      targetData.position.x += translation.x;
      targetData.position.y += translation.y;
      targetData.position.z += translation.z;
      i.item().setData(targetData);
    }
    //update model
    this.target_.getModel().notify();
  };
  
  /**
   * @see {unilib.mvc.controller.BaseCommand#undo}
   */
  unilib.mvc.bc.command.MoveNodeElementCommand.prototype.undo = function() {
    if (this.undo_) {
      var targetData = this.target_.getData();
      var translation = new unilib.geometry.Point3D();
      translation.x = this.startingData_.position.x - targetData.position.x;
      translation.y = this.startingData_.position.y - targetData.position.y;
      translation.z = this.startingData_.position.z - targetData.position.z;
      this.target_.setData(this.startingData_);
      //translate pins attached to the node
      for (var i = this.target_.createIterator(); !i.end(); i.next()) {
        targetData = i.item().getData();
        targetData.position.x += translation.x;
        targetData.position.y += translation.y;
        targetData.position.z += translation.z;
        i.item().setData(targetData);
      }
      //update model
      this.target_.getModel().notify();
    }
  };
	
	/**
   * move pin element; same logic as the node but with added logic to
   * check that the pin never leaves the node boundaries
   * @class
   * @extends {unilib.mvc.bc.command.MoveElementCommand}
   * @param {unilib.mvc.graph.GraphElement} element
   * @param {unilib.geometry,Point3D} position target position
   * @param {boolean} [reversible=false] if the command can be undone
   * @param {unilib.mvc.graph.BaseGraphElementData} [startingData=null] 
   *  if command is reversible then starting data for undo operation can 
   *  be specified. Default to data of the element at the time of exec()
   */
  unilib.mvc.bc.command.MovePinElementCommand = 
    function(element, position, undo, startingData) {
      unilib.mvc.bc.command.MoveElementCommand.call(this, element, 
        position, undo, startingData);
      
      //if movement is illegal, the exec becomes a NOP, the undo 
      //stays the same if it is a legal position
      this.position_ = this.checkPosition_(position);
      if (undo) {
        this.startingData_.position = this.checkPosition_(
            startingData.position);
      }
  };
  unilib.inherit(unilib.mvc.bc.command.MovePinElementCommand, 
    unilib.mvc.bc.command.MoveElementCommand.prototype);
  
  /**
   * check whether a given position is valid for the target pin
   * @param {unilib.geometry.Point}
   * @returns {unilib.geometry.Point}
   * @protected
   */
  unilib.mvc.bc.command.MovePinElementCommand.prototype.checkPosition_ = 
    function(position) {
    var node = this.target_.getOwner();
    var targetData = this.target_.getData();
    var nodeData = node.getData();
    //the centre of the target translated by position should be on the
    //edges of the node
    //calculate centre of the pin
    //centerX = position.x + (bottomRight.x - topLeft.x) / 2
    var halfX = Math.abs(targetData.points[1].x + targetData.points[0].x) / 2;
    //centerY = position.y + (bottomRight.y - topLeft.y) / 2
    var halfY = Math.abs(targetData.points[1].y + targetData.points[0].y) / 2;
    var nextCentre = new unilib.geometry.Point(position.x + halfX, 
      position.y + halfY);
    
    //node top left and bottom right
    var nodeTL = new unilib.geometry.Point(
      nodeData.position.x + nodeData.points[0].x,
      nodeData.position.y + nodeData.points[0].y);
    var nodeBR = new unilib.geometry.Point(
      nodeData.position.x + nodeData.points[1].x,
      nodeData.position.y + nodeData.points[1].y);
    
    //forbid motion outside the node
    if (nextCentre.x < nodeTL.x || nextCentre.x > nodeBR.x) {
      //lock x axis
      position.x = targetData.position.x;
    }
    if (nextCentre.y < nodeTL.y || nextCentre.y > nodeBR.y) {
      //lock y axis
      position.y = targetData.position.y;
    }
    var oldCentre = new unilib.geometry.Point(targetData.position.x + halfX, 
      targetData.position.y + halfY);
    //forbid motion inside the node
    if (oldCentre.x == nodeTL.x || oldCentre.x == nodeBR.x) {
      if (nextCentre.y > nodeTL.y && nextCentre.y < nodeBR.y) {
        position.x = targetData.position.x;
      }
    }
    if (oldCentre.y == nodeTL.y || oldCentre.y == nodeBR.y) {
      if (nextCentre.x > nodeTL.x && nextCentre.x < nodeBR.x) {
        position.y = targetData.position.y;
      }
    }
    return position;
  };
  
  /**
   * move edge element; same logic as the node but with added logic to
   * modify the edge logic
   * @class
   * @extends {unilib.mvc.bc.command.MoveElementCommand}
   * @param {unilib.mvc.graph.GraphElement} element
   * @param {unilib.geometry,Point3D} position target position
   * @param {boolean} [reversible=false] if the command can be undone
   * @param {unilib.mvc.graph.BaseGraphElementData} [startingData=null] 
   *  if command is reversible then starting data for undo operation can 
   *  be specified. Default to data of the element at the time of exec()
   * @param {unilib.mvc.bc.BooleanCircuitCOntroller} controller used to 
   * extract the segment clicked
   * @param {Object} state state of the previous moveEdge command, this is
   * needed to propagate the segment index informations
   */
  unilib.mvc.bc.command.MoveEdgeElementCommand = 
    function(element, position, undo, startingData, controller, state) {
      unilib.mvc.bc.command.MoveElementCommand.call(this, element, 
        position, undo, startingData);
      
      this.position_ = position;
      
      /**
       * segment index to be moved
       * @type {number}
       * @private
       */
      this.segment_ = -1;
      if (state && state['segment'] >= 0) {
        this.segment_ = state['segment'];
      }
      else {
        var container = controller.drawableManager.getDrawableFromElement(
          element);
        var polyline = null;
        //get polyline in container
        for (var i = container.createDrawableIterator(); ! i.end(); i.next()) {
          if (i.item().getID() == unilib.mvc.bc.DrawableShapeType.POLYLINE) {
            polyline = i.item();
            break;
          }  
        }
        if (polyline) {
          //get clicked segment from the polyline
          var relPosition = new unilib.geometry.Point3D(0, 0, null);
          relPosition.x = position.x - polyline.getPosition().x - 
            container.getPosition().x;
          relPosition.y = position.y - polyline.getPosition().y -
            container.getPosition().y;
          var count = 0;
          for (var i = polyline.createDrawableIterator(); ! i.end(); i.next()) {
            if (i.item().isAt(relPosition)) {
              this.segment_ = count;
              break;
            }
            count++;
          }
        }
        state['segment'] = this.segment_;
      }
      
      /**
       * remember the state to update it during exec and undo
       * @type {Object}
       * @private
       */
      this.state_ = state;
  };
  unilib.inherit(unilib.mvc.bc.command.MoveEdgeElementCommand, 
    unilib.mvc.bc.command.MoveElementCommand.prototype);
  
  /**
   * @see {unilib.mvc.controller.BaseCommand#exec}
   */  
  unilib.mvc.bc.command.MoveEdgeElementCommand.prototype.exec = function() {
    //translate node
    var targetData = this.target_.getData();
    //check the segment to move
    if (this.segment_ < 0 || this.segment_ > targetData.points.length - 2) {
      //invalid segment number, ignore
      return;
    }
    //get segment ends
    //note that segment numbers varies in [0, points.length - 2]
    segStart = targetData.points[this.segment_];
    segEnd = targetData.points[this.segment_ + 1];
    //get segment orientation
    vertical = (segStart.x - segEnd.x) == 0;
    horizontal = (segStart.y - segEnd.y) == 0;
    /*
     * the segment is updated:
     * if the segment is moved along its direction nothing changes
     * if it moves perpendicular, adjacent segments are modified (in length)
     * if length of an adjacent segment reaches 0 it is removed
     */
    //if the current segment index changes, remember it in the state
    var newSegment = this.segment_;
    //go on with the updating
    if (vertical && horizontal) {
      //wtf? do nothing
      return;
    }
    else {
      //modify previous segment
      var nStartPoint = null;
      if (this.segment_ - 1 < 0) {
        //no previous segment, create a new start point since the start point 
        //can not be moved
        nStartPoint = new unilib.geometry.Point(segStart.x, segStart.y);
        //since we are creating a new first segment, the one clicked 
        //becomes the second, the increment is stored
        newSegment += 1;
      }
      //move target segment start point
      if (horizontal) {
        //move seg start by the y translation
        segStart.y = this.position_.y;
      }
      else if (vertical) {
        //move seg start by the x translation
        segStart.x = this.position_.x;
      }
      //insert new point if needed
      if (nStartPoint) {
        //put new start point in the point array
        targetData.points.splice(0, 0, nStartPoint);
      }
      //modify following segment
      var nEndPoint = null;
      if (this.segment_ + 1 >= targetData.points.length - 1) {
        //no following segment, create a new end point since the end point 
        //can not be moved
        nEndPoint = new unilib.geometry.Point(segEnd.x, segEnd.y);
        //no changes to the segment index since we are appending this one
      }
      //move target segment end point
      if (horizontal) {
        //move seg start by the y translation
        segEnd.y = this.position_.y;
      }
      else if (vertical) {
        //move seg start by the y translation
        segEnd.x = this.position_.x;
      }
      //insert new point if needed
      if (nEndPoint) {
        //put new start point in the point array
        targetData.points.push(nEndPoint);
      }
    }
    this.state_['segment'] = newSegment;
    //-------------------
    this.target_.setData(targetData);
    //update model
    this.target_.getModel().notify();
  };
	
	/**
   * @see {unilib.mvc.controller.BaseCommand#undo}
   */  
  unilib.mvc.bc.command.MoveEdgeElementCommand.prototype.undo = function() {
    console.log("UNDO");
    
  };
	
	/**
	 * base class for menu commands, enables further parameters to be set
	 * after instantiation
	 * @class
	 * @abstract
	 * @extends {unilib.mvc.controller.ReversibleCommand}
	 */
	unilib.mvc.bc.command.MenuCommand = function() {
    unilib.mvc.controller.ReversibleCommand.call(this);
    
    /**
     * target position
     * @type {unilib.geometry.Point3D}
     * @private
     */
    this.position_ = null;
  };
  unilib.inherit(unilib.mvc.bc.command.MenuCommand, 
    unilib.mvc.controller.ReversibleCommand.prototype);
	
	/**
	 * setup further parameters
	 * @param {unilib.geometry.Point3D} position
	 * @param {...object} args
	 */
	unilib.mvc.bc.command.MenuCommand.prototype.setup = 
	 function(position) {
	   this.position_ = position;
	};
	
	/**
   * get a new instance of the command that can be executed
   * @abstract
   * @returns {unilib.mvc.controller.BaseCommand}
   */
  unilib.mvc.bc.command.MenuCommand.prototype.getInstance = 
   function() {
     throw new unilib.error.AbstractMethodError();
  }; 
  
	//----------------- Menu commands -------------------------------------------
	
	/**
	 * create generic element
   * @class
   * @extends {unilib.mvc.bc.command.MenuCommand}
   * @param {unilib.mvc.graph.GraphModel} controller
   */
  unilib.mvc.bc.command.ElementCommand = function(controller) {
    unilib.mvc.bc.command.MenuCommand.call(this);
    
    /**
     * menu model
     * @type {unilib.mvc.bc.BooleanCircuitController}
     * @private
     */
    this.controller_ = controller;
    
    /**
     * element instance created, used for undo
     * @type {unilib.mvc.graph.GraphElement}
     * @protected
     */
    this.instance_ = null;
    
    
  };
  unilib.inherit(unilib.mvc.bc.command.ElementCommand, 
    unilib.mvc.bc.command.MenuCommand.prototype);
	
	/**
   * create node element
   * @class
   * @extends {unilib.mvc.bc.command.ElementCommand}
   * @param {unilib.mvc.graph.GraphModel} controller
   * @param {unilib.mvc.bc.GraphElementType} nodeType
   */
  unilib.mvc.bc.command.CreateNodeElementCommand = 
    function(controller, nodeType) {
    unilib.mvc.bc.command.ElementCommand.call(this, controller);
    
    /**
     * node type
     * @type {unilib.mvc.bc.GraphElementType}
     * @protected
     */
    this.type_ = nodeType;
  };
  unilib.inherit(unilib.mvc.bc.command.CreateNodeElementCommand, 
    unilib.mvc.bc.command.ElementCommand.prototype);
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#exec}
   */
  unilib.mvc.bc.command.CreateNodeElementCommand.prototype.exec = function() {
    var model = this.controller_.graphModel;
    this.instance_ = model.makeNode();
    var data = this.instance_.getData();
    data.position = this.position_;
    data.position.z = 0; //force nodes on layer 0
    data.points.push(new unilib.geometry.Point(0,0));
    data.points.push(new unilib.geometry.Point(50, 50));
    data.text = "Node";
    this.instance_.setData(data);
    this.instance_.setID(this.type_);
    model.notify();
  };
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#undo}
   */
  unilib.mvc.bc.command.CreateNodeElementCommand.prototype.undo = function() {
    if (this.instance_) {
      var model = this.controller_.graphModel;
      model.removeNode(this.instance_);
      model.notify();
    }
  };
  
  /**
   * @see {unilib.mvc.bc.command.MenuCommand#getInstance
   */
  unilib.mvc.bc.command.CreateNodeElementCommand.prototype.getInstance = 
   function() {
     var cmd = new unilib.mvc.bc.command.CreateNodeElementCommand(
      this.controller_, this.type_);
     cmd.setup(this.position_);
     return cmd;
  }; 
	
	/**
   * remove node element
   * @class
   * @extends {unilib.mvc.bc.command.ElementCommand}
   * @param {unilib.mvc.graph.GraphModel} controller
   */
  unilib.mvc.bc.command.RemoveNodeElementCommand = 
    function(controller) {
    unilib.mvc.bc.command.ElementCommand.call(this, controller);
    
  };
  unilib.inherit(unilib.mvc.bc.command.RemoveNodeElementCommand, 
    unilib.mvc.bc.command.ElementCommand.prototype);
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#exec}
   */
  unilib.mvc.bc.command.RemoveNodeElementCommand.prototype.exec = function() {
    this.instance_ = this.controller_.selectionManager.getSelection();
    if (this.instance_) {
      var model = this.controller_.graphModel;
      for (var i = 0; i < this.instance_.length; i++) {
        model.removeNode(this.instance_[i]);  
      }
      model.notify();
    }
  };
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#undo}
   */
  unilib.mvc.bc.command.RemoveNodeElementCommand.prototype.undo = function() {
    var model = this.controller_.graphModel;
    for (node in this.instance_) {
      model.addNode(node); 
    }
    model.notify();
  };
  
  /**
   * @see {unilib.mvc.bc.command.MenuCommand#getInstance
   */
  unilib.mvc.bc.command.RemoveNodeElementCommand.prototype.getInstance = 
   function() {
     var cmd = new unilib.mvc.bc.command.RemoveNodeElementCommand(
      this.controller_);
     cmd.setup(this.position_);
     return cmd;
  };
	
	/**
	 * link elements, the command takes care of the routing of the edge
	 * (this should not be written to the model but to the view, this is
	 *   an architectural error!)
   * @class
   * @extends {unilib.mvc.bc.command.ElementCommand}
   * @param {unilib.mvc.graph.GraphModel} controller
   */
  unilib.mvc.bc.command.LinkCommand = 
    function(controller) {
    unilib.mvc.bc.command.ElementCommand.call(this, controller);
    
  };
  unilib.inherit(unilib.mvc.bc.command.LinkCommand, 
    unilib.mvc.bc.command.ElementCommand.prototype);
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#exec}
   */
  unilib.mvc.bc.command.LinkCommand.prototype.exec = function() {
    //get selected pins
    var selection = this.controller_.selectionManager.getSelection();
    //get first two pins from selection
    var targets = [];
    for (var i = 0; i < selection.length; i++) {
      if (selection[i].getID() == unilib.mvc.bc.GraphElementType.PIN) {
        if (targets.length < 2) {
          targets.push(selection[i]);
        }
        else {
          break;
        }
      }
    }
    if (targets.length < 2) {
      //Not enough pin selected!
      return;
    }
    //create a link
    //array of positions
    var points = [];
    
    //  -----------------------------------------------------------------------
    /*
     * basic path construction that ignores overlapping
     */
    //var startTarget = this.controller_.drawableManager.getElementFromDrawable(
    //  targets[0]);
    //var endTarget = this.controller_.drawableManager.getElementFromDrawable(
    //  targets[1]);
    var startTarget = targets[0];
    var endTarget = targets[1];
    var startData = startTarget.getData();
    var endData = endTarget.getData();
    //extract start and end positions
    var start = unilib.copyObject(startData.position);
    start.x += (startData.points[1].x - startData.points[0].x) / 2;
    start.y += (startData.points[1].y - startData.points[0].y) / 2;
    var end = unilib.copyObject(endData.position);
    end.x += (endData.points[1].x - endData.points[0].x) / 2;
    end.y += (endData.points[1].y - endData.points[0].y) / 2;
    //build points array
    //add start
    points.push(start);
    //in this case 1 intermediate points is used
    var dx = end.x - start.x;
    var dy = end.y - start.y;
    //first align in x
    if (dx != 0) {
      points.push(new unilib.geometry.Point(start.x + dx, start.y));
    }
    //then in y
    if (dy != 0) {
      points.push(new unilib.geometry.Point(start.x + dx, start.y + dy));
    }
    //add end
    //points.push(end);
    //  -----------------------------------------------------------------------
    
    //put points into the link
    var edge = startTarget.makeConnection(endTarget);
    edge.setID(unilib.mvc.bc.GraphElementType.EDGE);
    var edgeData = edge.getData();
    edgeData.points = points;
    edgeData.position = new unilib.geometry.Point3D(0, 0, 1);
    edge.setData(edgeData);
    //notify
    this.controller_.graphModel.notify();
  };
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#undo}
   */
  unilib.mvc.bc.command.LinkCommand.prototype.undo = function() {
    var model = this.controller_.graphModel;
    
  };
  
  /**
   * @see {unilib.mvc.bc.command.MenuCommand#getInstance
   */
  unilib.mvc.bc.command.LinkCommand.prototype.getInstance = 
   function() {
     var cmd = new unilib.mvc.bc.command.LinkCommand(this.controller_);
     cmd.setup(this.position_);
     return cmd;
  };
  
	
	/**
   * open context menu
   * @class
   * @extends {unilib.mvc.bc.command.MenuCommand}
   * @param {unilib.mvc.menu.Menu} ctxModel
   * @param {unilib.geometry.Point3D} position
   */
  unilib.mvc.bc.command.ShowCtxMenuCommand = function(ctxModel) {
    unilib.mvc.controller.IrreversibleCommand.call(this);
    /**
     * menu model
     * @type {unilib.mvc.menu.Menu}
     * @private
     */
    this.menu_ = ctxModel;
    
    /**
     * target position
     * @type {unilib.geometry.Point3D}
     * @private
     */
    this.position_ = null;
  };
  unilib.inherit(unilib.mvc.bc.command.ShowCtxMenuCommand, 
    unilib.mvc.bc.command.MenuCommand.prototype);
  
  unilib.mvc.bc.command.ShowCtxMenuCommand.prototype.exec = function() {
    this.menu_.setPosition(this.position_);
  };
  
  /**
   * @see {unilib.mvc.bc.command.MenuCommand#getInstance
   */
  unilib.mvc.bc.command.ShowCtxMenuCommand.prototype.getInstance = 
   function() {
     var cmd = new unilib.mvc.bc.command.ShowCtxMenuCommand(this.menu_);
     cmd.setup(this.position_);
     return cmd;
  }; 
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#undo}
   */
  unilib.mvc.bc.command.ShowCtxMenuCommand.prototype.undo = function() {
    return;
  };
  
  /**
   * @see {unilib.mvc.controlle.BaseCommand#isReversible}
   */
  unilib.mvc.bc.command.ShowCtxMenuCommand.prototype.isReversible = function() {
    return false;
  };
  
  /**
   * close context menu
   * @class
   * @extends {unilib.mvc.controller.IrreversibleCommand}
   * @param {unilib.mvc.menu.Menu} ctxModel
   */
  unilib.mvc.bc.command.HideCtxMenuCommand = function(ctxModel) {
    unilib.mvc.controller.IrreversibleCommand.call(this);
    /**
     * menu model
     * @type {unilib.mvc.menu.Menu}
     * @private
     */
    this.menu_ = ctxModel;
  };
  unilib.inherit(unilib.mvc.bc.command.HideCtxMenuCommand, 
    unilib.mvc.controller.IrreversibleCommand.prototype);
  
  unilib.mvc.bc.command.HideCtxMenuCommand.prototype.exec = function() {
    this.menu_.setPosition(null);
  };
	
}, ['unilib/error.js', 'unilib/mvc/graph/model.js', 
    'unilib/mvc/controller/controller.js']);
unilib.notifyLoaded();