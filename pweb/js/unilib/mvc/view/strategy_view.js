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
	
	/**
	 * event for the view to be sent to the controller
	 * @class
	 * @extends {unilib.graphics.GraphicEvent}
	 */
	unilib.mvc.view.ViewEvent = function(event, target) {
		unilib.graphics.GraphicEvent.call(this, event.getEventType(), null,
				event.position, event.keymap);
		
		/**
		 * target model object of the event, this substitutes the
		 * unilib.graphics.GraphicEvent#targetRenderer_ for target
		 * resolution
		 * @type {Object}
		 * @private
		 */
		this.target_ = target;
	};
	unilib.inherit(unilib.mvc.view.ViewEvent,
			unilib.graphics.GraphicEvent.prototype);
	
	/**
	 * @see {unilib.interfaces.event.IEvent}
	 */
	unilib.mvc.view.ViewEvent.prototype.getTarget = function() {
		return this.target_;
	};
	
	// ------------------- abstract DrawableManagerStrategy ---------------------
	/**
	 * base class for DrawablemanagerStrategy
	 * @class
	 * @abstract
	 */
	unilib.mvc.view.DrawableManagerStrategy = function() {};
	
	/**
	 * create a drawable to represent given element
	 * @param {Object} elem typically an element from the model
	 * @returns {unilib.interfaces.graphics.IDrawable}
	 */
	unilib.mvc.view.DrawableManagerStrategy.prototype.createDrawable = 
		function(elem) {
			throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * update a drawable to match specified element, typically an
	 * element from the model
	 * @param {unilib.interfaces.graphics.IDrawable} drawable 
	 * 	drawable to be updated
	 * @param {Object} elem element to be used as source
	 */
	unilib.mvc.view.DrawableManagerStrategy.prototype.updateDrawable =
		function(drawable, elem) {
			throw new unilib.error.AbstractMethodError();
	};
	
	// ---------------------------------- StrategyView --------------------------
	/**
	 * view that uses a renderer
	 * @class
	 * @extends {unilib.interfaces.observe.Observer}
	 * @param {unilib.interfaces.graphics.IRenderer}
	 */
	unilib.mvc.view.StrategyView = function(renderer, drawableManager) {
		unilib.interfaces.observer.Observer.call(this);
		unilib.interfaces.observer.Observable.call(this);
		
		/**
		 * renderer for specific drawing target
		 * @type {unilib.interfaces.graphics.IRenderer}
		 */
		this.renderer_ = renderer;
		
		/**
		 * drawable strategy that changes creation and updating
		 * of drawables starting from a model object
		 * @type {unilib.mvc.view.DrawableManagerStrategy}
		 * @private
		 */
		this.drawableManager_ = drawableManager;
		
		/**
		 * array of drawables currently rendered
		 * @type {Array.<Array.<unilib.interfaces.graphics.IDrawable, object>>}
		 */
		this.drawables_ = [];
		
		//attach event listeners to renderer
		this.renderer_.addEventListener(unilib.graphics.GraphicEventType.EVENT_ALL,
				unilib.createCallback(this, this.handleRendererEvent));
	};
	unilib.inherit(unilib.mvc.view.StrategyView, 
		unilib.interfaces.observer.Observer.prototype,
		unilib.interfaces.observer.Observable.prototype);
	
	// internal logic
	
	/**
	 * search for drawable associated with given element in the list of
	 * currently shown drawables and return the index in the list or -1
	 * @private
	 * @param {object} element of the model to look for
	 * @return {number} 
	 */
	unilib.mvc.view.StrategyView.prototype.getDrawableIndexForModelElement_ = 
		function(element) {
		var index = -1;
		for (var i = 0; i < this.drawables_.length; i++) {
			if (this.drawables_[i][1] == element) {
				index = i;
				break;
			}
		}
		return index;
	};
	
	/**
	 * get all drawable records at specified coordinates, return an
	 * array of indexes of such records
	 * @param {unilib.geometry.Point3D}
	 * @returns {Array.<number>}
	 */
	unilib.mvc.view.StrategyView.prototype.getDrawableIndexAtPoint_ = 
		function(point) {
		var match;
		for (var i = 0; i < this.drawables_.length; i++) {
			if (this.drawables_[i][0].isAt(point)) {
				match.push(i);
			}
		}
		return match;
	};
	
	/**
	 * handle an event from the renderer. Translate a GraphicEvent into a
	 * ViewEvent that can be sent to the controller
	 * @param {unilib.graphics.GraphicEvent} event
	 */
	unilib.mvc.view.StrategyView.prototype.handleRendererEvent = 
		function(event) {
		var point = new unilib.geometry.Point3D(
				event.position.x, event.position.y, null);
		var targets = this.getDrawableIndexAtPoint_(point);
		var targetDrawableRecord = null;
		if (targets.length != 0) {
			//select drawable on foreground
			if (this.drawables_[0]) {
				targetDrawableRecord = this.drawables_[0];
			}
			for (var i = 1; i < this.drawables_.length; i++) {
				if (targetDrawableRecord[0].getPosition().z < 
						this.drawables_[i][0].getPosition().z) {
					targetDrawableRecord = this.drawables_[i];
				}
			}
		}
		//build a ViewEvent to be sent to the controller
		var viewEvent = new unilib.mvc.view.ViewEvent(event, 
				targetDrawableRecord[1]);
		this.notify(viewEvent);
	};
	
	// interfaces implementation
	
	/**
	 * update the view after receiving a ModelEvent
	 * @see {unilib.interfaces.observer.Observer#update}
	 * @param {unilib.mvc.model.ModelEvent}
	 * @throws {unilib.mvc.view.ViewError}
	 */
	unilib.mvc.view.StrategyView.prototype.update = function(event) {
		if (! event) {
			throw new unilib.mvc.view.ViewError('no event passed by model');
		}
		var drawableIndex = this.getDrawableIndexForModelElement_(
				event.getTarget());
		var drawable = (drawableIndex != -1) ? 
				this.drawables_[drawableIndex][0] : null;
		switch (event.getEventType()) {
			case unilib.mvc.model.ModelEventType.UPDATE:
				//update the drawable using the strategy object
				if (drawable) {
					drawable.clear(this.renderer_);
					this.drawableManager_.updateDrawable(drawable, event.getTarget());
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
					this.drawables_.splice(drawableIndex, 1);
				}
				else {
					throw new unilib.mvc.view.ViewError('no drawable found for ' +
					'REMOVE event\'s target, can not remove anything');
				}
				break;
			case unilib.mvc.model.ModelEventType.ADD:
				//add a new drawable representing the model element to the view
				if (! drawable) {
					drawable = this.drawableManager_.createDrawable(event.getTarget());
					this.drawables_.push([drawable, event.getTarget()]);
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
    'unilib/graphics/renderer.js']);
unilib.notifyLoaded();