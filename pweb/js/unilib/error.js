/**
 * @fileOwerview base errors
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 * @version 1.0
 */

unilib.provideNamespace('unilib.error');

/**
 * base unilib error class
 * @constructor
 * @extends Error
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
 * exception for not implemented methods and functions
 * @constructor
 * @extends unilib.error.UnilibError
 */
unilib.error.NotYetImplementedError = function() {
	this.message = 'Not yet Implemented';
};

unilib.error.NotYetImplementedError.prototype = new unilib.error.UnilibError();