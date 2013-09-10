/**
 * @fileOverview Command Factory Modules
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @todo
 * [REFACTORING] move specific command factory modules away from graph
 */

unilib.provideNamespace('unilib.mvc.graph', function() {
	
	/**
	 * command factory module for click events
	 * @class
	 * @extends {unilib.interfaces.factory.IFactoryModule}
	 * @param {unilib.mvc.graph.GraphMVC} mvc
	 * @param {unilib.mvc.menu.MenuProvider} menuProvider
	 */
	unilib.mvc.graph.ClickCommandFactory = function(mvc, menuProvider) {
		
		/**
		 * model view controller group, provide access to all three
		 * components of the architecture.
		 * @type
		 */
		this.mvc_ = mvc;
		
		/**
		 * provide menus for the implementation
		 * @type {unilib.mvc.menu.MenuProvider}
		 * @private
		 */
		this.menuProvider_ = menuProvider;
		
		/**
		 * tells if the context menu is active
		 * @type {unilib.mvc.menu.ContextMenu}
		 * @private
		 */
		this.contextMenuActive_ = null;
	};
	unilib.inherit(unilib.mvc.graph.ClickCommandFactory,
			unilib.interfaces.factory.IFactoryModule.prototype);
	
	/**
	 * @see {unilib.interfaces.factory.IFactoryModule#build}
	 * @param {unilib.view.ViewEvent} elem
	 * @returns {unilib.mvc.controller.BaseCommand}
	 */
	unilib.interfaces.factory.IFactoryModule.prototype.build = 
		function(elem) {
		if (elem.getEventType() == 'mouseup') {
			if (elem.keymap.button == unilib.graphics.EventButtonType.BUTTON_RIGHT) {
				var menu = this.menuProvider_.getContextMenu(elem.getTarget());
				//show context menu
				this.contextMenuActive_ = menu;
				return new unilib.mvc.command.DirectDrawCommand(menu, this.mvc_.view);
			}
		}
		else if (elem.getEventType() == 'mousedown') {}
	};
	
	/**
	 * determine if the module can handle a given element
	 * @see {unilib.interfaces.factory.IFactoryModule#canHandle}
	 * @param {unilib.view.ViewEvent} elem
	 * @returns {boolean}
	 */
	unilib.interfaces.factory.IFactoryModule.prototype.canHandle =
		function(elem) {
			if (elem.getEventType() == 'click' || 
					elem.getEventType() == 'mouseup' || 
					elem.getEventType() == 'mousedown') {
				return true;
			}
			return false;
	};
	
	/**
	 * command factory module for double click events
	 */
	
	/**
	 * command factory module for drag and drop events
	 */
	
	/**
	 * command factory module for keys events
	 */
	
}, ['unilib/error.js', 'unilib/interface/modular_factory.js']);
unilib.notifyLoaded();