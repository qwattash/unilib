/**
 * @fileOverview manages user selection
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.notifyStart('unilib/mvc/boolean_circuit_graph/selection_manager.js');

/**
 * @namespace unilib.mvc.bc
 */
unilib.provideNamespace('unilib.mvc.bc', function() {
  
  /**
   * context menu used for editing the graph
   * @class
   * @param {unilib.mvc.view.drawableManager} drawableManager
   */
  unilib.mvc.bc.SelectionManager = function(drawableManager) {
    
    /**
     * list of selected elements, used as shorthand to
     * avoid traversing the drawableManager to look for them
     * @type {Array.<Object>}
     * @private
     */
    this.selected_ = [];
    
    /**
     * drawable managet that is used to display the target element
     * @type {unilib.mvc.view.drawableManager}
     * @private
     */
    this.drawableManager_ = drawableManager;
  };
  
  /**
   * perform selection of given element
   * @param {Object} element
   * @private
   */
  unilib.mvc.bc.SelectionManager.prototype.doSelect_ = function(element) {
    var targetDrawable = this.drawableManager_.getDrawableFromElement(element);
    if (targetDrawable) {
      targetDrawable.setFocus(true);
      this.drawableManager_.refresh(element);
    }   
  };
  
  /**
   * perform deselection of given element
   * @param {Object} element
   * @private
   */
  unilib.mvc.bc.SelectionManager.prototype.doDeselect_ = function(element) {
    var targetDrawable = this.drawableManager_.getDrawableFromElement(element);
    if (targetDrawable) {
      targetDrawable.setFocus(false);
      this.drawableManager_.refresh(element);
    } 
  };
  
  /**
   * helper, select given element
   * @param {?Object} element
   */
  unilib.mvc.bc.SelectionManager.prototype.select = function(element) {
    if (element == null) return;
    for (var i = 0; i < this.selected_.length; i++) {
      if (this.selected_[i] == element) {
        //if already selected do nothing
        return;
      }
    }
    this.selected_.push(element);
    this.doSelect_(element);
  };
  
  /**
   * deselect all elements except given one,
   * if element is null all elements are deselected
   * @param {?Object} element
   */
  unilib.mvc.bc.SelectionManager.prototype.deselect = function(element) {
    var index = this.selected_.indexOf(element);
    if (element != null && index != -1) {
        this.doDeselect_(element);
        this.selected_.splice(index, 1);
    }
  };
  
  /**
   * deselect all elements except given one,
   * if element is null all elements are deselected
   * @param {?Object} element
   */
  unilib.mvc.bc.SelectionManager.prototype.deselectAll = function(element) {
    var i = 0;
    while (i < this.selected_.length) {
      if (element == null || this.selected_[i] != element) {
        this.doDeselect_(this.selected_[i]);
        this.selected_.splice(i, 1);
      }
      else {
        //skip the element that is not removed
        i++;
      }
    }
  };
  
  /**
   * return selected elements array
   * @returns {Array.<Object>}
   */
  unilib.mvc.bc.SelectionManager.prototype.getSelection = function() {
    return unilib.copyObject(this.selected_);
  };
  
}, []);
unilib.notifyLoaded();