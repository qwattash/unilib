/**
 * @fileOverview model for graph-like representations
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.notifyStart('unilib/interface/modular_factory.js');

/**
 * @namespace unilib.interfaces.factory
 */
unilib.provideNamespace('unilib.interfaces.factory', function() {
  
  /**
   * Factory module interfaces
   * @class
   * @abstract
   */
  unilib.interfaces.factory.IFactoryModule = function() {};
  
  /**
   * create an element related to given input
   * @abstract
   * @param {Object} elem typically the element used for input data
   * @returns {Object}
   */
  unilib.interfaces.factory.IFactoryModule.prototype.build = 
    function(elem) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * determine if the module can handle a given element
   * @abstract
   * @param {Object} elem element for which it is needed the check
   * @returns {boolean}
   */
  unilib.interfaces.factory.IFactoryModule.prototype.canHandle =
    function(elem) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * handle creation of elements using a composite model,
   * each create request is dispatched to all modules until one
   * answer positively to the request and handle it.
   * It is required that requests from each model element are handled by
   * only one module, this is not checked when adding modules to the manager.
   * unilib.interfaces.factory.ModularFactory have the following 
   *   advantages:
   *   i) increased extensibility and ease of extensibility
    *   ii) increased amount of reusable code
    *   iii) potentially nullified use of switch/case logic that is a severe 
    *     weakness for variation points (such as this) (Protected Variations GRASP)
   * @class
   * @extends {unilib.interfaces.factory.IFactoryModule}
   */
  unilib.interfaces.factory.ModularFactory = function() {
    
    /**
     * modules that implements creation and update of elements of the model
     * @type {Array.<unilib.interfaces.factory.IFactoryModule>}
     * @private
     */
    this.modules_ = [];
  };
  unilib.inherit(unilib.interfaces.factory.ModularFactory,
      unilib.interfaces.factory.IFactoryModule.prototype);
  
  /**
   * @see {unilib.interfaces.factory.IFactoryModule#build}
   */
  unilib.interfaces.factory.ModularFactory.prototype.build = 
    function(elem) {
      for (var i = 0; i < this.modules_.length; i++) {
        if (this.modules_[i].canHandle(elem)) {
          return this.modules_[i].build(elem);
        }
      }
      //if no module can handle the build throw an error
      throw new unilib.error.UnilibError('ModularFactory: Build failed for ' +
       'element ' + elem.toString());
  };
  
  /**
   * add a DrawableManagerModule to the composite
   * @param {unilib.interfaces.factory.IFactoryModule} module
   * @throws {unilib.error.UnilibError}
   */
  unilib.interfaces.factory.ModularFactory.prototype.addModule =
    function(module) {
    if (this.modules_.indexOf(module) == -1) {
      //avoid duplicate addition
      this.modules_.push(module);
    }
  };
  
  /**
   * remove the module in the composite that handles a given element 
   * (typically from the model)
   * @param {Object} elem element for which the handler for that 
   *   element is removed
   * @throws {unilib.error.UnilibError}
   */
  unilib.interfaces.factory.ModularFactory.prototype.removeModule =
    function(elem) {
      for (var i = 0; i < this.modules_.length; i++) {
        if (this.modules_[i].canHandle(elem)) {
          this.modules_.splice(i, 1);
          break;
        }
      }
  };
  
  /**
   * determine if a module can handle a given element
   * @param {Object} elem element for which it is needed the check
   * @returns {boolean}
   */
  unilib.interfaces.factory.ModularFactory.prototype.canHandle =
    function(elem) {
      var handlerFound = false;
      for (var i = 0; i < this.modules_.length; i++) {
        if (this.modules_[i].canHandle(elem)) {
          handlerFound = true;
          break;
        }
      }
      return handlerFound;
  };
  
}, ['unilib/error.js']);
unilib.notifyLoaded();