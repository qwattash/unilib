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
		/** error message
		 * @type {string}
		 */
		this.message = message;
	};
	unilib.error.UnilibError.prototype = new Error();
	
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

	unilib.error.NotYetImplementedError.prototype = 
		new unilib.error.UnilibError();
	
	/**
	 * exception for abstract methods
	 * @class
	 * @extends {unilib.error.UnilibError}
	 */
	unilib.error.AbstractMethodError = function() {
		this.message = 'Invoked an abstract method';
	};
	unilib.error.AbstractMethodError.prototype = 
		new unilib.error.UnilibError();

});

unilib.notifyLoaded();