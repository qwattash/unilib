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
   * move element; both reversible and irreversible variants are supported
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
     * @private
     */
    this.target_ = element;
    
    /**
     * undo-ability flag
     * @type {boolean}
     * @private
     */
    this.undo_ = (undo === undefined) ? false : undo;
    
    /**
     * starting data for undo
     * @type {?unilib.mvc.graph.BaseGraphElementData}
     * @private
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
     * @private
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
  unilib.mvc.ln.command.MoveElementCommand.prototype.isReversible = function() {
    return this.undo_;
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