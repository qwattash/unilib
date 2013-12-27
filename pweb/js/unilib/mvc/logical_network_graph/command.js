/**
 * @fileOverview Graph-specific commands
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.provideNamespace('unilib.mvc.ln.command', function() {
	
	/**
	 * element select
	 * @class
	 * @extends {unilib.mvc.controller.IrreversibleCommand}
	 * @param {unilib.mvc.graph.GraphElement} element
	 */
	unilib.mvc.ln.command.SelectElementCommand = function(element, view) {
	  
	  /**
	   * target element
	   * @type {unilib.mcv.graph.GraphElement}
	   * @private
	   */
	  this.target_ = element;
	  
	  /**
	   * graph model
	   * @type {unilib.mvc.view.StrategyView}
	   */
	  this.view_ = view;
	};
	unilib.inherit(unilib.mvc.ln.command.SelectElementCommand, 
	  unilib.mvc.controller.IrreversibleCommand.prototype);
	  
	unilib.mvc.ln.command.SelectElementCommand.prototype.exec = function() {
	  
	};
	
	/**
	 * element deselect
	 */
	
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
  unilib.mvc.ln.command.MoveElementCommand = 
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
  unilib.inherit(unilib.mvc.ln.command.MoveElementCommand, 
    unilib.mvc.controller.BaseCommand.prototype);
  
  /**
   * @see {unilib.mvc.controller.BaseCommand#exec}
   */  
  unilib.mvc.ln.command.MoveElementCommand.prototype.exec = function() {
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
  unilib.mvc.ln.command.MoveElementCommand.prototype.undo = function() {
    if (this.undo_) {
      this.target_.setData(this.startingData_);
      this.target_.getModel().notify();
    }
  };

  /**
   * @see {unilib.mvc.controller.BaseCommand#isReversible}
   */
  unilib.mvc.ln.command.MoveElementCommand.prototype.isReversible = 
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
  unilib.mvc.ln.command.MoveNodeElementCommand = 
    function(element, position, undo, startingData) {
    unilib.mvc.ln.command.MoveElementCommand.call(this, element, position, 
      undo, startingData);
  };
  unilib.inherit(unilib.mvc.ln.command.MoveNodeElementCommand, 
    unilib.mvc.ln.command.MoveElementCommand.prototype);
    
  /**
   * @see {unilib.mvc.controller.BaseCommand#exec}
   */  
  unilib.mvc.ln.command.MoveNodeElementCommand.prototype.exec = function() {
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
  unilib.mvc.ln.command.MoveNodeElementCommand.prototype.undo = function() {
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
   * @extends {unilib.mvc.ln.command.MoveElementCommand}
   * @param {unilib.mvc.graph.GraphElement} element
   * @param {unilib.geometry,Point3D} position target position
   * @param {boolean} [reversible=false] if the command can be undone
   * @param {unilib.mvc.graph.BaseGraphElementData} [startingData=null] 
   *  if command is reversible then starting data for undo operation can 
   *  be specified. Default to data of the element at the time of exec()
   */
  unilib.mvc.ln.command.MovePinElementCommand = 
    function(element, position, undo, startingData) {
      unilib.mvc.ln.command.MoveElementCommand.call(this, element, 
        position, undo, startingData);
      
      //if movement is illegal, the exec becomes a NOP, the undo 
      //stays the same if it is a legal position
      this.position_ = this.checkPosition_(position);
      if (undo) {
        this.startingData_.position = this.checkPosition_(
            startingData.position);
      }
  };
  unilib.inherit(unilib.mvc.ln.command.MovePinElementCommand, 
    unilib.mvc.ln.command.MoveElementCommand.prototype);
  
  /**
   * check whether a given position is valid for the target pin
   * @param {unilib.geometry.Point}
   * @returns {unilib.geometry.Point}
   * @protected
   */
  unilib.mvc.ln.command.MovePinElementCommand.prototype.checkPosition_ = 
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
    //forbid motion inside the node
    if (nextCentre.x >= nodeTL.x && nextCentre.x <= nodeBR.x) {
      if (nextCentre.y > nodeTL.y && nextCentre.y < nodeBR.y) {
        position.y = targetData.position.y;
      }
    }
    if (nextCentre.y >= nodeTL.y && nextCentre.y <= nodeBR.y) {
      if (nextCentre.x > nodeTL.x && nextCentre.x < nodeBR.x) {
        position.x = targetData.position.x;
      }
    }
    return position;
  };
    
	/**
	 * open context menu
	 */
	
	/**
	 * close context menu
	 */
	
	/**
	 * create element
	 */
	
	/**
	 * remove element
	 */
	
	/**
	 * link elements
	 */
	
}, ['unilib/error.js', 'unilib/mvc/graph/model.js', 
    'unilib/mvc/controller/controller.js']);
unilib.notifyLoaded();