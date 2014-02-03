/**
 * @fileOverview clonable interface
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.notifyStart('unilib/interface/clonable.js');

/**
 * @namespace unilib.interfaces.clonable
 */
unilib.provideNamespace('unilib.interfaces.clonable', function() {
  
  /**
   * interface that defines a way to clone complex objects
   * @class
   * @abstract
   */
  unilib.interfaces.clonable.IClonable = function() {};
  
  /**
   * clone the object
   * @abstract
   * @returns {unilib.interfaces.clonable.IClonable}
   */
  unilib.interfaces.clonable.IClonable.prototype.clone = function() {
    throw new unilib.error.AbstractMethodError();
  };
  
  
}, ['unilib/error.js']);
unilib.notifyLoaded();