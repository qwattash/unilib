/**
 * @fileOverview Graph-specific commands
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.notifyStart('unilib/mvc/boolean_circuit_graph/command.js');

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
   * @param {Object} state state of the previous moveEdge command, this is
   * needed to propagate the segment index informations
   */
  unilib.mvc.bc.command.MoveElementCommand = 
    function(element, position, undo, startingData, state) {
    
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
    
    /**
     * state that is persisted among different Move
     * commands that are considered related, the common usage
     * is to track starting data for the edges.
     * @todo
     * Further refinement can be done to support startingData
     * undo only with this state and remove the startingData property
     * @type {Object}
     * @private
     */
    this.state_ = state;
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
   * @param {Object} state state of the previous moveEdge command, this is
   * needed to propagate the segment index informations
   */
  unilib.mvc.bc.command.MoveNodeElementCommand = 
    function(element, position, undo, startingData, state) {
    unilib.mvc.bc.command.MoveElementCommand.call(this, element, position, 
      undo, startingData, state);
      
    /**
     * list of auxiliary pin commands used to move pins
     * @type {Array.<unilib.mvc.bc.command.MovePinElementCommand>}
     * @private
     */
    this.pinCommands_ = [];
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
      //create auxiliary pin command
      var targetPos = i.item().getData().position;
      targetPos.x += translation.x;
      targetPos.y += translation.y;
      targetPos.z += translation.z;
      var pinStartingData = null;
      if (this.undo_) {
        //build initial condition for the pin
        pinStartingData = i.item().getData();
        //the initial condition must be recovered from the translation happened
        //between the node starting data and the actual node data
        pinStartingData.position.x += - (targetData.position.x - this.startingData_.position.x);
        pinStartingData.position.y += - (targetData.position.y - this.startingData_.position.y);
        pinStartingData.position.z += - (targetData.position.z - this.startingData_.position.z);
      }
      var pinCmd = new unilib.mvc.bc.command.MovePinElementCommand(
        i.item(), targetPos, this.undo_, pinStartingData, this.state_);
      if (this.undo_) {
        this.pinCommands_.push(pinCmd);
      }
      pinCmd.exec();
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
      for (var i = 0; i < this.pinCommands_.length; i++) {
        this.pinCommands_[i].undo();
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
   * @param {Object} state state of the previous moveEdge command, this is
   * needed to propagate the segment index informations
   */
  unilib.mvc.bc.command.MovePinElementCommand = 
    function(element, position, undo, startingData, state) {
      unilib.mvc.bc.command.MoveElementCommand.call(this, element, 
        position, undo, startingData, state);
      
      //if movement is illegal, the exec becomes a NOP, the undo 
      //stays the same if it is a legal position
      this.position_ = this.checkPosition_(position);
      
      /*
       * @todo
       * store edges before the move operation in the state
       * a clone is needed to prevent reordering that may be caused
       * by a removal and an undo??
       * for now store just the data and rely on fixed order
       * @type {Array.<Array.<unilib.mvc.graph.BaseGraphElementData>>}
       */
      if (! this.state_['start_edges']) {
        var startingEdgesData = [];
        var edgeIter = this.target_.createIterator();
        for (edgeIter.begin(); ! edgeIter.end(); edgeIter.next()) {
          //build initial condition for the edge
          startingEdgesData.push(edgeIter.item().getData());
        }
        this.state_['start_edges'] = startingEdgesData;
      }
  };
  unilib.inherit(unilib.mvc.bc.command.MovePinElementCommand, 
    unilib.mvc.bc.command.MoveElementCommand.prototype);
    
  /**
   * @see {unilib.mvc.controller.MoveElementCommand#exec}
   */  
  unilib.mvc.bc.command.MovePinElementCommand.prototype.exec = function() {
    var edgeIter = this.target_.createIterator();
    var targetData = this.target_.getData();
    for (edgeIter.begin(); ! edgeIter.end(); edgeIter.next()) {
      //translate edge attached to this pin
      var edge = edgeIter.item();
      var edgeData = edge.getData();
      //translation offset to be added to the segment
      var translationStart = new unilib.geometry.Point(
        this.position_.x - targetData.position.x,
        this.position_.y - targetData.position.y);
      var translationEnd = new unilib.geometry.Point(
        this.position_.x - targetData.position.x,
        this.position_.y - targetData.position.y);
      var segment = -1;
      var nextSegment = -1;
      var isStart = null; //remember which part is attached
      if (edge.getStartPin() == this.target_) {
        //the pin is the start, take first segment
        segment = 0;
        isStart = true;
      }
      else if (edge.getEndPin() == this.target_) {
        //the pin is the end, take last segment
        segment = edgeData.points.length - 2;
        isStart = false;
      }
      //get segment start and end points
      var segStart = edgeData.points[segment];
      var segEnd = edgeData.points[segment + 1];
      //check orientation
      var horizontal = (segStart.y - segEnd.y == 0);
      var vertical = (segStart.x - segEnd.x == 0);
      
      //exception, single segment, only 2 points, one segment
      //create a third point and proceed as normal
      if (edgeData.points.length == 2) {
        //auxiliary point
        var auxPoint = new unilib.geometry.Point();
        if (isStart) {
          auxPoint.x = segEnd.x;
          auxPoint.y = segEnd.y;
          edgeData.points.push(auxPoint);
        }
        else {
          auxPoint.x = segStart.x;
          auxPoint.y = segStart.y;
          edgeData.points.splice(0, 0, auxPoint);
        }
      }
      
      //note that next segment is always perpendicular to the current
      if (horizontal && vertical) {
        //the points have aligned dammit!
        //check if end and the following segment are horizontal or vertical
        //this also relies on the fact that if a segment was aligned or
        //perpendicular but zero-length it has been merged
        
        /* if we (the pin) are at seg#0 start (point[0]), seg#0 end is at point[1] so
         * the next segment point that must be compared to seg#0 end is seg#1 end = point[2]
         * if we are at seg#last end (point[len-1]), seg#last start is at point[len-2] so
         * the next segment point that must be compared to seg#last start is seg#last-1 start = point[len-3]
         * if we are at seg#last start (point[len-1]), seg#last end is at point[len-2] so
         * the next segment point that must be compared to seg#last end is seg#last-1 start = point[len-3]
         * if we are at seg#0 end (point[0]), seg#0 start is at point[1] so
         * the next segment point that must be compared to seg#0 start is seg#1 start = point[2]
         */
        var nextSegmentInterestPoint = (isStart) ? 
          edgeData.points[2] : edgeData.points[edgeData.points.length - 3];
        if (nextSegmentInterestPoint.x - segEnd.x == 0) {
          //following segment is vertical, this is horizontal
          vertical = false;
        }
        else {
          //following segment is horizontal, this is vertical
          horizontal = false;
        }
      }
      
      //apply alignment constraint to translation end or start
      //from this point on the polyline is always at least 2 segments
      if (isStart) {
        //apply constraint to the end
        if (horizontal) {
          //lock x
          translationEnd.x = 0;
        }
        else if (vertical) {
          //lock y
          translationEnd.y = 0;
        }
      }
      else {
        //apply constraint to the start
        //note that next segment is always perpendicular to the current
        if (horizontal) {
          //lock x
          translationStart.x = 0;
        }
        else if (vertical) {
          //lock y
          translationStart.y = 0;
        }
      }
      //apply translation
      segStart.x += translationStart.x;
      segStart.y += translationStart.y;
      segEnd.x += translationEnd.x;
      segEnd.y += translationEnd.y;
      edge.setData(edgeData);
    }
    //call supeclass exec to update the pin
    unilib.mvc.bc.command.MoveElementCommand.prototype.exec.call(this);
  };
  
  /**
   * @see {unilib.mvc.bc.command.MoveElementCommand#undo}
   */
  unilib.mvc.bc.command.MovePinElementCommand.prototype.undo = function() {
    if (this.undo_) {
      var edgeIter = this.target_.createIterator();
      for (edgeIter.begin(); ! edgeIter.end(); edgeIter.next()) {
        edgeIter.item().setData(this.state_['start_edges'].pop());
      }
      unilib.mvc.bc.command.MoveElementCommand.prototype.undo.call(this);
    }
  };
  
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
        position, undo, startingData, state);
      
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
    //-------------------
    //now try to merge aligned segments
    var i = 0;
    while (i <= targetData.points.length - 3) {
      //is segment i aligned to the next (in the same orientation,
      //so 2 is added instead of 1
      if (targetData.points[i].x - targetData.points[i + 1].x == 0) { 
        if(targetData.points[i].x - targetData.points[i + 2].x == 0) {
          //vertical alignment, remove point i+1
          targetData.points.splice(i + 1, 1);
          //update segment index if needed
          if (i + 1 <= newSegment) {
            //an index before or equal to the selected one has been removed
            newSegment -= 1;
          }
         continue;
         }
      }
      else {
        //horizontal
        if (targetData.points[i].y - targetData.points[i + 2].y == 0) {
          //vertical alignment, remove point i+1
          targetData.points.splice(i + 1, 1);
          //update segment index if needed
          if (i + 1 <= newSegment) {
            //an index before or equal to the selected one has been removed
            newSegment -= 1;
          }
          continue;
        }
      }
      i++;
    }
    //finalise modifications
    this.state_['segment'] = newSegment;
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
	
	//--------------------------------------------------------------------------
	/**
   * create generic element
   * @class
   * @extends {unilib.mvc.bc.command.MenuCommand}
   * @param {unilib.mvc.graph.GraphModel} controller
   */
  unilib.mvc.bc.command.SaveGraphCommand = function(controller) {
    unilib.mvc.bc.command.MenuCommand.call(this);
    
    /**
     * menu model
     * @type {unilib.mvc.bc.BooleanCircuitController}
     * @private
     */
    this.controller_ = controller;
    
  };
  unilib.inherit(unilib.mvc.bc.command.SaveGraphCommand, 
    unilib.mvc.bc.command.MenuCommand.prototype);
    
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#setup}
   */
  unilib.mvc.bc.command.SaveGraphCommand.prototype.setup = 
   function(position) {
   return;
  };
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#getInstance}
   */
  unilib.mvc.bc.command.SaveGraphCommand.prototype.getInstance = 
   function() {
     return new unilib.mvc.bc.command.SaveGraphCommand(this.controller_);
  };
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#exec}
   */
  unilib.mvc.bc.command.SaveGraphCommand.prototype.exec = function() {
    var loader = this.controller_.loader;
    loader.save(this.controller_.graphModel);
  };
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#undo}
   */
  unilib.mvc.bc.command.SaveGraphCommand.prototype.undo = function() {
    //can not undo a save
    return;
  };
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#isReversible}
   */
  unilib.mvc.bc.command.SaveGraphCommand.prototype.isReversible = function() {
    //can not undo a save
    return false;
  };
  
  //---------------------------------------------------------------------------
	
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
    var nodespec = unilib.mvc.bc.GraphElementPins[this.type_];
    this.instance_ = model.makeNode();
    var data = this.instance_.getData();
    data.position = this.position_;
    data.position.z = 0; //force nodes on layer 0
    data.points.push(new unilib.geometry.Point(0,0));
    data.points.push(new unilib.geometry.Point(65, 53));
    data.text = nodespec.label;
    this.instance_.setData(data);
    this.instance_.setID(this.type_);
    //now create pins
    spacing = (data.points[1].y - data.points[0].y) / nodespec.input - 5;
    for (var i = 0; i < nodespec.input; i++) {
      //pins are added to the left and have a fixed size of 10x10
      var pin = this.instance_.makePin(unilib.mvc.graph.PinDirection.IN);
      pin.setID(unilib.mvc.bc.GraphElementType.INPUT_PIN);
      var pinData = pin.getData();
      pinData.points.push(new unilib.geometry.Point(0,0));
      pinData.points.push(new unilib.geometry.Point(10,10));
      pinData.position.x = this.position_.x - 5;
      pinData.position.y = this.position_.y + i * spacing;
      pinData.position.z = 2;
      pin.setData(pinData);
    }
    spacing = (data.points[1].y - data.points[0].y) / nodespec.output - 5;
    for (var i = 0; i < nodespec.output; i++) {
      //pins are added to the left and have a fixed size of 10x10
      var pin = this.instance_.makePin(unilib.mvc.graph.PinDirection.OUT);
      pin.setID(unilib.mvc.bc.GraphElementType.OUTPUT_PIN);
      var pinData = pin.getData();
      pinData.points.push(new unilib.geometry.Point(0,0));
      pinData.points.push(new unilib.geometry.Point(10,10));
      pinData.position.x = this.position_.x + data.points[1].x - 5;
      pinData.position.y = this.position_.y + i * spacing;
      pinData.position.z = 2;
      pin.setData(pinData);
    }
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
	
	//---------------------------------------------------------------------------
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
        //skip non nodes
        if (! (this.instance_[i] instanceof unilib.mvc.graph.Node)) {
          continue;
        }
        //remove all attached edges
        node = this.instance_[i];
        for (var j = node.createIterator(); ! j.end(); j.next()) {
          var pin = j.item();
          for (var k = pin.createIterator(); ! k.end(); k.next()) {
            var edge = k.item();
            var start = edge.getStartPin();
            var end = edge.getEndPin();
            start.unlink(edge);
            end.unlink(edge);
          }
        }
        model.removeNode(this.instance_[i]);
      }
      model.notify();
    }
  };
  
  /**
   * @TODO implement undo properly
   * WARNING at the moment the edges and pins attached to the node
   * are not preserved after undo
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
  
  //---------------------------------------------------------------------------
  /**
   * remove edge element
   * @class
   * @extends {unilib.mvc.bc.command.ElementCommand}
   * @param {unilib.mvc.graph.GraphModel} controller
   */
  unilib.mvc.bc.command.UnlinkCommand = 
    function(controller) {
    unilib.mvc.bc.command.ElementCommand.call(this, controller);
    
  };
  unilib.inherit(unilib.mvc.bc.command.UnlinkCommand, 
    unilib.mvc.bc.command.ElementCommand.prototype);
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#exec}
   */
  unilib.mvc.bc.command.UnlinkCommand.prototype.exec = function() {
    var selected = this.controller_.selectionManager.getSelection();
    if (selected) {
      var model = this.controller_.graphModel;
      //for each edge store edge and start/end pairs
      //then unlink
      this.instance_ = [];
      for (var i = 0; i < selected.length; i++) {
        if (selected[i].getID() == unilib.mvc.bc.GraphElementType.EDGE) {
          var startPin = selected[i].getStartPin();
          var endPin = selected[i].getEndPin();
          startPin.unlink(selected[i]);
          endPin.unlink(selected[i]);
          this.instance_.push([selected[i], startPin, endPin]);
        }
      }
      model.notify();
    }
  };
  
  /**
   * @see {unilib.mvc.controlle.ReversibleCommand#undo}
   */
  unilib.mvc.bc.command.UnlinkCommand.prototype.undo = function() {
    var model = this.controller_.graphModel;
    for (var i= 0; i < this.instance_.length; i++) {
      var start = this.instance_[i][1];
      var end = this.instance_[i][2];
      start.link(this.instance_[i][0]);
      end.link(this.instance_[i][0]); 
    }
    model.notify();
  };
  
  /**
   * @see {unilib.mvc.bc.command.MenuCommand#getInstance
   */
  unilib.mvc.bc.command.UnlinkCommand.prototype.getInstance = 
   function() {
     var cmd = new unilib.mvc.bc.command.UnlinkCommand(
      this.controller_);
     cmd.setup(this.position_);
     return cmd;
  };
	
	//---------------------------------------------------------------------------
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
      if (selection[i].getID() == unilib.mvc.bc.GraphElementType.INPUT_PIN ||
          selection[i].getID() == unilib.mvc.bc.GraphElementType.OUTPUT_PIN) {
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
    //check if the model inverted the edge ends to fit directions
    if (edge.getStartPin() != startTarget) {
      //reverse points
      points.reverse();
    }
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
	
	
	/**
   * change element text
   * @class
   * @extends {unilib.mvc.controller.IrreversibleCommand}
   * @param {unilib.mvc.graph.GraphElement} target
   * @param {string} deltaText text variation
   */
  unilib.mvc.bc.command.ChangeTextCommand = function(target, deltaText) {
    unilib.mvc.controller.IrreversibleCommand.call(this);
    /**
     * target elemnt
     * @type {unilib.mvc.graph.GraphElement}
     * @private
     */
    this.target_ = target;
    
    /**
     * text to change into
     * @type {string}
     * @private
     */
    this.text_ = deltaText;
  };
  unilib.inherit(unilib.mvc.bc.command.ChangeTextCommand, 
    unilib.mvc.controller.IrreversibleCommand.prototype);
  
  unilib.mvc.bc.command.ChangeTextCommand.prototype.exec = function() {
    var data = this.target_.getData();
    if (this.text_ == unilib.mvc.controller.NonPrintableKeyCode.BACKSPACE) {
      data.text = data.text.substr(0, data.text.length - 1);
    }
    else {
      data.text += this.text_;
    }
    this.target_.setData(data);
    this.target_.getModel().notify();
  };
  
}, ['unilib/error.js', 'unilib/mvc/graph/model.js', 
    'unilib/mvc/controller/controller.js']);
unilib.notifyLoaded();