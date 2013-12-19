/**
 * @fileOverview drawableManagerStrategyModules for menu representations
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.menu
 */
unilib.provideNamespace('unilib.mvc.menu', function() {
  
  /**
   * menu types
   * @enum {string}
   */
  unilib.mvc.menu.MenuType = {
      ITEM: 'menu_item',
      VERTICAL: 'menu_vertical',
      HORIZONTAL: 'menu_horizontal'
  };
  
  /**
   * ContextMenu DrawableManagerStrategyModule
   * @class
   * @extends {unilib.mvc.view.DrawableManagerStrategyModule}
   */
  unilib.mvc.menu.VerticalMenuDrawableManagerStrategy = 
    function() {
    unilib.mvc.view.DrawableManagerStrategyModule.call(this);
  };
  unilib.inherit(unilib.mvc.menu.VerticalMenuDrawableManagerStrategy, 
      unilib.mvc.view.DrawableManagerStrategyModule.prototype);
  
} []);
unilib.notifyLoaded();