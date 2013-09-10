/**
 * @fileOverview generic controller classes
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.controller
 */
unilib.provideNamespace('unilib.mvc.controller', function() {
	
//-------------------------------- StyleProvider ------------------------------
	
	/**
	 * reserved style types to be used in unilib.mvc.controller.StyleProvider
	 * @enum {string}
	 */
	unilib.mvc.controller.StyleProviderReservedType = {
			STYLE_DEFAULT: '__default__'
	};
	
	/**
	 * define an interface for style generators, a StyleProvider associates
	 * a model ID (may or may not be unique) to a set of styles, the style
	 * requested is selected according to a StyleType. For example ID=1 can have
	 * two styles, one for its text representation and one for its main body
	 * representation. WARNING: When choosing StyleTypes for a certain 
	 * implementation please make sure to avoid conflicts with reserved types
	 * defined by unilib.mvc.controller.StyleProviderReservedType.
	 * Please note that in case of no match on the ID, the provider will default
	 * to the default style provided at construction time or to the default
	 * unilib.graphics.StyleInformations values.
	 * @class
	 * @abstract
	 */
	unilib.mvc.controller.StyleProvider = function(defaultStyle) {
		
		/**
		 * for maximum extensibility styles are stored in a map of maps, index
		 * in the first map are the IDs and indexes in the second map are the
		 * StyleTypes
		 * @type {Object.<(string | number), 
		 * 	Object.<(string | number),unilib.graphics.StyleInformations>>}
		 * @private
		 */
		this.styleMap_ = {};
		
		/**
		 * default style to be used in case of no match on the ID
		 * @type {unilib.graphics.StyleInformations}
		 * @private
		 */
		this.defaultStyle_ = (defaultStyle != undefined) ? 
				defaultStyle : new unilib.graphics.StyleInformations();
	};
	
	/**
	 * register a style associated with an id
	 * @param {(number | string)} id id of the element
	 * @param {(number | string)} styleType type of the style
	 * @param {unilib.graphics.StyleInformations} style style to be used
	 */
	unilib.mvc.controller.StyleProvider.prototype.registerStyle = 
		function(id, styleType, style) {
		if(! this.styleMap_[id]) this.styleMap_[id] = {};
		this.styleMap_[id][styleType] = style;
	};
	
	/**
	 * unregister a style associated with an id
	 * @param {(number | string)} id id of the element
	 * @param {unilib.graphics.StyleInformations} style style to be used
	 */
	unilib.mvc.controller.StyleProvider.prototype.unregisterStyle = 
		function(id, styleType) {
		if (this.styleMap_[id] && this.styleMap_[id][styleType]) {
			this.styleMap_[id][styleType] = null;
		}
	};
	
	/**
	 * retrieve the style associated with the given ID and StyleType
	 * @param {(number | string)} id
	 * @param {(number | string)} styleType
	 */
	unilib.mvc.controller.StyleProvider.prototype.getStyle = 
		function(id, styleType) {
		/*
		 * note that the style returned is a copy, this is done to avoid
		 * unwanted modifications on the registered styles
		 */
		if (this.styleMap_[id]) {
			if (this.styleMap_[id][styleType]) {
				return unilib.copyObject(this.styleMap_[id][styleType]);
			}
			else if (this.styleMap_[id][unilib.mvc.controller.
			  StyleProviderReservedType.STYLE_DEFAULT]) {
				return unilib.copyObject(this.styleMap_[id][unilib.mvc.controller.
				   StyleProviderReservedType.STYLE_DEFAULT]);
			}
		}
		return unilib.copyObject(this.defaultStyle_);
	};

//-------------------------------- Command ------------------------------------
	
	/**
	 * command abstract class
	 * @class
	 * @abstract
	 */
	unilib.mvc.controller.BaseCommand = function() {};
	
	/**
	 * execute the command on the element given within the context
	 * @abstract
	 */
	unilib.mvc.controller.BaseCommand.prototype.exec = function() {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * undo the executed command
	 * @abstract
	 */
	unilib.mvc.controller.BaseCommand.prototype.undo = function() {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * tells if the command is reversible
	 * @abstract
	 * @returns {boolean}
	 */
	unilib.mvc.controller.BaseCommand.prototype.isReversible = function() {
		throw new unilib.error.AbstractMethodError();
	};
	
//-------------------------------- Command Controller -------------------------
	/**
	 * controller module built around Command Pattern
	 * @class
	 * @extends {unilib.interfaces.observer.Observer}
	 * @param {unilib.interfaces.factory.ModularFactory}
	 * @param {number} [maxUndo=20] max undo buffer size
	 */
	unilib.mvc.controller.CommandController = 
		function(commandFactory, maxUndo) {
		
		/**
		 * command factory
		 * @type {unilib.mvc.controller.CommandFactory}
		 * @private
		 */
		this.commandFactory_ = commandFactory;
		
		/**
		 * command buffer
		 * @type {unilib.mvc.controller.BaseCommand}
		 * @private
		 */
		this.commandBuffer_ = [];
		
		/**
		 * redo buffer
		 * @type {unilib.mvc.controller.BaseCommand}
		 * @private
		 */
		this.redoBuffer_ = [];
		
		/**
		 * undo buffer max size
		 * @type {number}
		 * @private
		 */
		this.maxUndo_ = (parseInt(maxUndo).isNaN()) ? 20 : parseInt(maxUndo); 
	};
	unilib.inherit(unilib.mvc.controller.CommandController, 
			unilib.interfaces.observer.Observer.prototype);
	
	/**
	 * undo last command
	 */
	unilib.mvc.controller.CommandController.prototype.undo = function() {
		if (this.commandBuffer_.length > 0) {
			var command = this.commandBuffer_.pop();
			command.undo();
			this.redoBuffer_.push(command);
			/* do not check size since max undo that one can do is max length of
			 * the undo buffer, then if a command is executed the redo buffer is
			 * flushed
			 */
		}
	};
	
	/**
	 * redo last cancelled command
	 */
	unilib.mvc.controller.CommandController.prototype.redo = function() {
		if (this.redoBuffer_.length > 0) {
			var command = this.redoBuffer_.pop();
			command.exec();
			this.commandBuffer_.push(command);
		}
	};
	
	/**
	 * create command for an event and execute it
	 */
	unilib.mvc.controller.CommandController.prototype.update = function(event) {
		var command = this.commandFactory_.build(event);
		command.exec();
		//flush redo buffer
		if (this.redoBuffer_.length != 0) this.redoBuffer_ = [];
		if (command.isReversible()) {
			this.commandBuffer.push(command);
			if (this.commandBuffer_.length > this.maxUndo_) {
				this.commandBuffer_.shift();
			}
		}
	};
	
}, ['unilib/error.js', 'unilib/graphics/renderer.js', 
    'unilib/interface/observer.js']);
unilib.notifyLoaded();