/**
 * @fileOverview generic model classes
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.model
 */
unilib.provideNamespace('unilib.mvc.model', function() {
	
	/**
	 * Model event types
	 * @enum {number}
	 */
	unilib.mvc.model.ModelEventType = {
			UNKNOWN: -1,
			UPDATE: 0,
			REMOVE: 1,
			ADD: 2
	};
	
	/**
	 * event dispatched by model
	 * @class
	 * @extends {unilib.interfaces.event.IEvent}
	 */
	unilib.mvc.model.ModelEvent = function(type, target) {
		
		/**
		 * target model element
		 * @type {object}
		 * @private
		 */
		this.target_ = target;
		
		/**
		 * event type
		 * @type {unilib.mvc.model.ModelEventType}
		 * @private
		 */
		this.type_ = type;
	};
	unilib.inherit(unilib.mvc.model.ModelEvent,
			unilib.interfaces.event.IEvent.prototype);
	
	/**
	 * @see {unilib.interfaces.event.IEvent#getTarget}
	 */
	unilib.mvc.model.ModelEvent.prototype.getTarget = function() {
		return this.target_;
	};
	
	/**
	 * @see {unilib.interfaces.event.IEvent#getEventType}
	 * @returns {unilib.mvc.model.ModelEventType}
	 */
	unilib.mvc.model.ModelEvent.prototype.getEventType = function() {
		return this.type_;
	};
	
	/**
	 * not supported
	 * @see {unilib.interfaces.event.IEvent#stopPropagation}
	 */
	unilib.mvc.model.ModelEvent.prototype.stopPropagation = function() {
		throw new unilib.error.NotYetImplementedError();
	};
	
}, ['unilib/interface/event.js', 'unilib/error.js']);

unilib.notifyLoaded();