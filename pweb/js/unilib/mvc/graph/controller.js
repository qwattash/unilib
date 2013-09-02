/**
 * @fileOverview model for graph-like representations
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.controller
 */
unilib.provideNamespace('unilib.mvc.controller', function() {
	
	/**
	 * strategy for handling Graph in the view
	 * @class
	 * @extends {unilib.mvc.view.DrawableManagerStrategy}
	 */
	unilib.mvc.controller.GraphDrawableManagerStrategy = function() {
		
	};
	unilib.inherit(unilib.mvc.controller.GraphDrawableManagerStrategy,
			unilib.mvc.view.DrawableManagerStrategy.prototype);
	
	// private helpers
	
	unilib.mvc.controller.GraphDrawableManagerStrategy.prototype.
		createNodeDrawable_ = function(elem) {
		
	};
	
	unilib.mvc.controller.GraphDrawableManagerStrategy.prototype.
	createPinDrawable_ = function(elem) {
	
	};
	
	unilib.mvc.controller.GraphDrawableManagerStrategy.prototype.
	createEdgeDrawable_ = function(elem) {
	
	};
	
	// DrawableManagerStrategy interface
	
	/**
	 * @see {unilib.mvc.view.DrawableManagerStrategy#createDrawable}
	 */
	unilib.mvc.controller.GraphDrawableManagerStrategy.prototype.createDrawable =
		function(elem) {
			switch (elem.getType()) {
				case unilib.mvc.graph.GraphElementType.NODE:
					return this.createNodeDrawable_(elem);
					break;
				case unilib.mvc.graph.GraphElementType.PIN:
					return this.createPinDrawable_(elem);
					break;
				case unilib.mvc.graph.GraphElementType.EDGE:
					return this.createEdgeDrawable_(elem);
					break;
				default:
					throw new unilib.mvc.graphic.ViewError('Can not create a drawable ' +
							'for ' + elem.getType() + ' element');
			}
	};
	
	/**
	 * it is supposed that the drawable is a correct representation of the
	 * element generated with the same DrawableManager
	 * @see {unilib.mvc.view.DrawableManagerStrategy#updateDrawable}
	 */
	unilib.mvc.controller.GraphDrawableManagerStrategy.prototype.updateDrawable =
		function(drawable, elem) {
			//todo
	};
	
	//-------------------------------- Graph Controller -------------------------
	
	/**
	 * controller module
	 * @class
	 * @extends {unilib.interfaces.observer.Observer}
	 */
	unilib.mvc.controller.GraphController = function() {};
	
	
}, ['unilib/error.js', 'unilib/mvc/view/view.js', 
    'unilib/mvc/graph/model.js', 'unilib/graphic/drawable.js']);
unilib.notifyLoaded();