/**
 * @fileOverview model for graph-like representations
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.view
 */
unilib.provideNamespace('unilib.mvc.view', function() {
  
  
  /**
   * error for the view
   * @class
   * @extends {unilib.error.UnilibError}
   * @param {string} error message
   */
  unilib.mvc.view.ViewError = function(message) {
    message = 'ViewError > ' + message;
    unilib.error.UnilibError.apply(this, [message]);
  };
  unilib.inherit(unilib.mvc.view.ViewError,
      unilib.error.UnilibError.prototype);
  
  // ------------------------ modular DrawableManagerStrategy -----------------
  
  /**
   * handle creation and update of drawables using a composite model,
   * each create/update request is dispatched to all modules until one
   * answer positively to the request and handle it.
   * It is required that requests from each model element are handled by
   * only one module, this is not checked when adding modules to the manager.
   * unilib.mvc.view.DrawableManagerStrategy have the following 
   *   advantages:
   *   i) increased extensibility and ease of extensibility
   *   ii) increased amount of reusable code
   *   iii) potentially nullified use of switch/case logic that is a severe 
   *     weakness for variation points (such as this) 
   *     (Protected Variations GRASP)
   * @class
   * @extends {unilib.interfaces.factory.ModularFactory}
   */
  unilib.mvc.view.DrawableManagerStrategy = function() {
    unilib.interfaces.factory.ModularFactory.call(this);
  };
  unilib.inherit(unilib.mvc.view.DrawableManagerStrategy,
      unilib.interfaces.factory.ModularFactory.prototype);
  
  /**
   * update given drawable and related element from model
   * @param {unilib.interfaces.graphics.IDrawable} drawable 
   *   drawable to be updated
   * @param {Object} elem related element used for input values
   * @returns {unilib.interfaces.graphics.IDrawable}
   */
  unilib.mvc.view.DrawableManagerStrategy.prototype.update =
    function(drawable, elem) {
    for (var i = 0; i < this.modules_.length; i++) {
      if (this.modules_[i].canHandle(elem)) {
        return this.modules_[i].update(drawable, elem);
      }
    }
  };
  
  // ----------------------------------
  /**
   * @class
   * @abstract
   * @extends {unilib.interfaces.factory.IFactoryModule}
   */
  unilib.mvc.view.DrawableManagerStrategyModule = function() {};
  unilib.inherit(unilib.mvc.view.DrawableManagerStrategyModule,
      unilib.interfaces.factory.IFactoryModule.prototype);
  
  /**
   * update given drawable and related element from model
   * @abstract
   * @param {unilib.interfaces.graphics.IDrawable} drawable 
   *   drawable to be updated
   * @param {Object} elem related element used for input values
   * @returns {unilib.interfaces.graphics.IDrawable}
   */
  unilib.mvc.view.DrawableManagerStrategyModule.prototype.update = 
    function() {
    throw new unilib.error.AbstractMethodError();
  };
  
  // ---------------------------------- DrawableManager ---------------------
  
  /**
   * helper class for storing drawable/model element associations
   * @class
   * @param {Object} element model element 
   * @param {unilib.interfaces.graphics.IDrawable} drawable associated drawable
   */
  unilib.mvc.view.DrawableRecord = function(element, drawable) {
    
    /**
     * model element associated with the drawable
     * @type {Object}
     */
    this.element = element;
    
    /**
     * drawable for the model element specified
     * @type {unilib.interfaces.graphics.IDrawable}
     */
    this.drawable = drawable;
  };
  
  /**
   * view that uses a renderer
   * @class
   * @extends {unilib.interfaces.observe.Observer}
   * @param {unilib.interfaces.graphics.IRenderer}
   * @param {unilib.mvc.view.DrawableManagerStrategy} drawableManagerStrategy 
   * strategy for creation and updating of Drawables for the view
   */
  unilib.mvc.view.DrawableManager = function(renderer, drawableManagerStrategy) {
    unilib.interfaces.observer.Observer.call(this);
    
    /**
     * renderer for specific drawing target
     * @protected
     * @type {unilib.interfaces.graphics.IRenderer}
     */
    this.renderer_ = renderer;
    
    /**
     * drawable strategy that changes creation and updating
     * of drawables starting from a model object
     * @type {unilib.mvc.view.DrawableManagerStrategy}
     * @protected
     */
    this.drawableManagerStrategy_ = drawableManagerStrategy;
    
    /**
     * array of drawables currently rendered
     * @protected
     * @type {Array.<unilib.mvc.view.DrawableRecord>}
     */
    this.drawables_ = [];
    
  };
  unilib.inherit(unilib.mvc.view.DrawableManager, 
    unilib.interfaces.observer.Observer.prototype);
  
  // internal logic
  
  /**
   * search for element associated with given drawable in the list of
   * currently shown drawables and return the element
   * @param {unilib.interfaces.graphics.IDrawable} drawable
   * @return {?Object} 
   */
  unilib.mvc.view.DrawableManager.prototype.getElementFromDrawable = 
    function(drawable) {
    var index = -1;
    for (var i = 0; i < this.drawables_.length; i++) {
      if (this.drawables_[i].drawable == drawable) {
        return this.drawables_[i].element;
      }
    }
    return null;
  };
  
  /**
   * search for drawable associated with given element in the list of
   * currently shown drawables and return the drawable
   * @param {Object} element
   * @return {?unilib.interfaces.graphics.IDrawable} 
   */
  unilib.mvc.view.DrawableManager.prototype.getDrawableFromElement = 
  function(element) {
  var index = -1;
    for (var i = 0; i < this.drawables_.length; i++) {
      if (this.drawables_[i].element == element) {
        return this.drawables_[i].drawable;
      }
    }
    return null;
  };
  
  /**
   * get all drawable records at specified coordinates, return an
   * array of indexes of such records
   * @private
   * @param {unilib.geometry.Point3D}
   * @returns {Array.<unilib.mvc.view.DrawableRecord>}
   */
  unilib.mvc.view.DrawableManager.prototype.getRecordsAtPoint_ = 
    function(point) {
    var match = [];
    for (var i = 0; i < this.drawables_.length; i++) {
      if (this.drawables_[i].drawable.isAt(point)) {
        match.push(this.drawables_[i]);
      }
    }
    return match;
  };
  
  /**
   * get index of a record with given drawable
   * @private
   * @param {unilib.interfaces.graphics.IDrawable} drawable
   * @returns {number} -1 in case of failure
   */
  unilib.mvc.view.DrawableManager.prototype.getIndex_ = function(drawable) {
    for (var i = 0; i < this.drawables_.length; i++) {
      if (this.drawables_[i].drawable == drawable) {
        return i;
      }
    }
    return -1;
  };
  
  
  /**
   * return an array of drawables that are at a position given
   * @param {unilib.geometry.Point3D}
   * @return {Array.<unilib.interfaces.graphics.IDrawable>}
   */
  unilib.mvc.view.DrawableManager.prototype.getDrawablesAt = 
  function(position) {
    var targets = this.getRecordsAtPoint_(position); 
    var drawables = [];
    if (targets.length != 0) {
      for (var i = 0; i < targets.length; i++) {
        drawables.push(targets[i].drawable);
      }
    }
    return drawables;
  };
  
  /**
   * return an array of drawables that are at a position given
   * @param {unilib.geometry.Point3D}
   * @return {Array.<Object>}
   */
  unilib.mvc.view.DrawableManager.prototype.getElementsAt = 
  function(position) {
    var targets = this.getRecordsAtPoint_(position);
    var elements = [];
    if (targets.length != 0) {
      for (var i = 0; i < targets.length; i++) {
        elements.push(targets[i].element);
      }
    }
    return elements;
  };
  
  /**
   * find all overlapping drawables to the one at the index passed 
   * (in drawables_ array) and return their indexes
   * @private
   * @param {unilib.interfaces.graphics.IDrawable} target drawable
   * @returns {Array.<unilib.interfaces.graphics.IDrawable>}
   */
  unilib.mvc.view.DrawableManager.prototype.getOverlappingDrawables = 
  function(target) {
    var overlapping = [];
    var targetBox = target.getBoundingBox();
    for (var i = 0; i < this.drawables_.length; i++) {
      if (this.drawables_[i].drawable == target) continue;
      if (this.drawables_[i].drawable.getBoundingBox().collide(targetBox)) {
        overlapping.push(this.drawables_[i].drawable);
      }
    }
    return overlapping;
  };
  
  // interfaces implementation
  
  /**
   * update the view after receiving a ModelEvent
   * @see {unilib.interfaces.observer.Observer#update}
   * @param {unilib.mvc.model.ModelEvent}
   * @throws {unilib.mvc.view.ViewError}
   */
  unilib.mvc.view.DrawableManager.prototype.update = function(event) {
    if (! event) {
      throw new unilib.mvc.view.ViewError('no event passed by model');
    }
    var drawable = this.getDrawableFromElement(event.getTarget());
    switch (event.getEventType()) {
      case unilib.mvc.model.ModelEventType.UPDATE:
        //update the drawable using the strategy object
        if (drawable) {
          /*
           * clear only drawable and not others that are at the same
           * coordinates, search for colliding drawables and store them 
           */
          //--------------------------------------------------------------------------------------
          var colliding = this.getOverlappingDrawables(drawable);
          drawable.clear(this.renderer_);
          //redraw objects that were eventually removed
          for (var i = 0; i < colliding.length; i++) {
            //note this can lead to chain effects <<--maybe the renderer should do something
            //to support renderers other than the HTML renderer
            colliding[i].clear(this.renderer_);
            colliding[i].draw(this.renderer_);
          }
          //---------------------------------------------------------------------------------------
          //update the drawable that is targeted by the event
          this.drawableManagerStrategy_.update(drawable, event.getTarget());
          //redraw updated drawable
          drawable.draw(this.renderer_);
        }
        else {
          throw new unilib.mvc.view.ViewError('no drawable found for ' +
              'UPDATE event\'s target, can not update anything');
        }
        break;
      case unilib.mvc.model.ModelEventType.REMOVE:
        //remove the drawable from the view
        if (drawable) {
          drawable.clear(this.renderer_);
          var index = this.getIndex(drawable);
          if (index >= 0) this.drawables_.splice(index, 1);
        }
        else {
          throw new unilib.mvc.view.ViewError('no drawable found for ' +
          'REMOVE event\'s target, can not remove anything');
        }
        break;
      case unilib.mvc.model.ModelEventType.ADD:
        //add a new drawable representing the model element to the view
        if (! drawable) {
          drawable = this.drawableManagerStrategy_.build(event.getTarget());
          this.drawables_.push(
            new unilib.mvc.view.DrawableRecord(event.getTarget(), drawable));
          drawable.draw(this.renderer_);
        }
        else {
          throw new unilib.mvc.view.ViewError('a drawable for ADD event\'s ' +
              'target is already present, can not add another drawable');
        }
        break;
      default:
        throw new unilib.mvc.view.ViewError('invalid event received ' +
            'from model');
    }
  };
  
  
}, ['unilib/interface/observer.js', 'unilib/error.js', 
    'unilib/graphics/renderer.js', 'unilib/interface/modular_factory.js']);
unilib.notifyLoaded();