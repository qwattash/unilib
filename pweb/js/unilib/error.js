/**
 * @fileOwerview base errors
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 * @version 1.0
 */

unilib.provideNamespace('unilib.error', function() {
  /**
   * base unilib error class
   * @class
   * @extends {Error}
   * @param {string} message error message
   */
  unilib.error.UnilibError = function(message) {
    Error.call(this);
    /** error message
     * @type {string}
     */
    this.message = message;
  };
  unilib.inherit(unilib.error.UnilibError,
      Error.prototype);
  
  /**
   * override toString method to display correct informations
   */
  unilib.error.UnilibError.prototype.toString = function() {
    return 'UnilibError ' + this.message;
  };
  
  /**
   * exception for not implemented methods and functions
   * @class
   * @extends {unilib.error.UnilibError}
   */
  unilib.error.NotYetImplementedError = function() {
    this.message = 'Not yet Implemented';
  };

  unilib.inherit(unilib.error.NotYetImplementedError, 
    unilib.error.UnilibError.prototype);
  
  /**
   * exception for abstract methods
   * @class
   * @extends {unilib.error.UnilibError}
   */
  unilib.error.AbstractMethodError = function() {
    this.message = 'Invoked an abstract method';
  };
  unilib.inherit(unilib.error.AbstractMethodError, 
    unilib.error.UnilibError.prototype);

});

unilib.notifyLoaded();