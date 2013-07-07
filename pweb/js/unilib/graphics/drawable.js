/**
 * @fileOverview graphical elements and helpers
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.graphics
 */
unilib.provideNamespace('unilib.graphics', function() {
	
	
	/**
	 * Interface that provides access to informations needed to draw
	 * 	and element in a view
	 * @abstract
	 * @class
	 */
	unilib.graphics.IDrawableDescriptor = function() {
		
	};
	
	/**
	 * getter for id
	 * @returns {number | string}
	 */
	unilib.graphics.IDrawableDescriptor.prototype.getID = function() {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * setter for id
	 * @param {string | number} id
	 */
	unilib.graphics.IDrawableDescriptor.prototype.setID = function(id) {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * getter for position
	 * @abstract
	 * @returns {unilib.geometry.Point}
	 */
	unilib.graphics.IDrawableDescriptor.prototype.getPosition = function() {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * setter for position
	 * @abstract
	 * @param {unilib.geometry.Point} point
	 */
	unilib.graphics.IDrawableDescriptor.prototype.setPosition = function(point) {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * getter for shape
	 * @abstract
	 * @returns {unilib.geometry.Shape}
	 */
	unilib.graphics.IDrawableDescriptor.prototype.getShape = function() {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * setter for shape
	 * @abstract
	 * @param {unilib.geometry.Shape} shape
	 */
	unilib.graphics.IDrawableDescriptor.prototype.setShape = function(shape) {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * getter for style ID
	 * @returns {string | number}
	 */
	unilib.graphics.IDrawableDescriptor.prototype.getStyleID = function() {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * setter for style ID
	 * @param {string | number} id
	 */
	unilib.graphics.IDrawableDescriptor.prototype.setStyleID = function(id) {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * getter for label
	 * @returns {string}
	 */
	unilib.graphics.IDrawableDescriptor.prototype.getLabel = function() {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * setter for label
	 * @param {string} label
	 */
	unilib.graphics.IDrawableDescriptor.prototype.setLabel = function(label) {
		throw new unilib.error.AbstractMethodError();
	};
	
}, ['unilib/geometry/primitives.js', 'unilib/error.js']);
unilib.notifyLoaded();
