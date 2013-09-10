/**
 * @fileOverview event factory for ViewEvents that include support for 
 * 	events not suppodted by HTML4/DOM2
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.provideNamespace('unilib.mvc.graph', function() {
	
	/**
	 * custom event types
	 * @enum {string}
	 */
	unilib.mvc.graph.CustomViewEventType = {
			DRAG_START: 'dragstart',
			DRAG_END: 'dragend',
			DRAG_MOVE: 'dragmove'
	};
	
	/**
	 * factory that supports Drag&Drop events
	 * @class
	 * @extends {unilib.mvc.view.ViewEventFactory}
	 */
	unilib.mvc.graph.DragDropViewEventFactory = function() {
		
		/**
		 * dragged element, identify currently dragged element
		 * @type {?Object}
		 * @private
		 */
		this.current_ = null;
		
		/**
		 * timestamp used to determine if a click is a drad&drop
		 * request or a simple click on an element
		 * @type {Date}
		 * @private
		 */
		this.timestamp_ = null
	};
	unilib.inherit(unilib.mvc.graph.DragDropViewEventFactory,
			unilib.mvc.view.ViewEventFactory.prototype);
	
	/**
	 * create ViewEvent with same event type
	 * @param {unilib.graphics.GraphicEvent} event
	 * @param {unilib.interfaces.graphics.IDrawable} targetDrawable
	 * @param {Object} targetModelElement
	 * @returns {unilib.mvc.view.ViewEvent}
	 */
	unilib.mvc.graph.DragDropViewEventFactory.prototype.createDefaultEvent_ = 
		function(event, targetDrawable, targetModelElement) {
		return new unilib.mvc.view.ViewEvent(event.type(), targetModelElement);
	};
	
	/**
	 * @see {unilib.mvc.view.ViewEventFactory#createViewEvent}
	 */
	unilib.mvc.graph.DragDropViewEventFactory.prototype.createViewEvent = 
		function(event, targetModelElement) {
		var viewEvent;
		if (event.getEventType() == 'mousedown' && ! this.current_) {
			this.timestamp_ = new Date();
			viewEvent = new unilib.mvc.view.ViewEvent(
					unilib.mvc.graph.CustomViewEventType.DRAG_START,
					targetModelElement);
		}
		else if (event.getEventType() == 'mouseup' && 
				this.current_ == targetModelElement) {
			var delta = (new Date()).getTime() - this.timestamp_.getTime();
			if (delta < this.deltaClick_) {
				
			}
			viewEvent = new unilib.mvc.view.ViewEvent(
					unilib.mvc.graph.CustomViewEventType.DRAG_END,
					targetModelElement);
		}
		else if (event.getEventType() == 'mousemove' && 
				this.current_ == targetModelElement) {
			viewEvent = new unilib.mvc.view.ViewEvent(
					unilib.mvc.graph.CustomViewEventType.DRAG_MOVE,
					targetModelElement);
		}
		else {
			viewEvent = this.createDefaultEvent_(event, targetModelElement);
		}
		return viewEvent;
	};
	
}, ['unilib/error.js', 'unilib/mvc/view/strategy_view.js']);
unilib.notifyLoaded();