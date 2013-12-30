/**
 * @fileOverview define context menu items and the context menu model
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.bc.menu
 */
unilib.provideNamespace('unilib.mvc.bc.menu', function() {
  
  /**
   * context menu used for editing the graph
   * @class
   * @extends {unilib.mvc.menu.Menu}
   */
  unilib.mvc.bc.menu.MainContextMenu = function() {
    unilib.mvc.menu.Menu.call(this);
    //set menu items
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'Add Node';
    this.addItem(new unilib.mvc.menu.MenuElement(
      unilib.mvc.bc.command.BaseCommand,
      elementData
    ));
    elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'Save';
    this.addItem(new unilib.mvc.menu.MenuElement(
      unilib.mvc.bc.command.BaseCommand,
      elementData
    ));
    
  };
  unilib.inherit(unilib.mvc.bc.menu.MainContextMenu,
    unilib.mvc.menu.Menu.prototype);  
  
  
}, ['unilib/mvc/menu/model.js', 
  'unilib/mvc/boolean_circuit_graph/command.js']);
unilib.notifyLoaded();
