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
   * @param {unilib.mvc.bc.BooleanCircuitController} controller
   */
  unilib.mvc.bc.menu.MainContextMenu = function(controller, nodeSubmenu) {
    unilib.mvc.menu.Menu.call(this);
    
    //set menu items
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'Add Node';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.ShowCtxMenuCommand(nodeSubmenu),
      elementData
    ));
    elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'Save';
    this.addItem(new unilib.mvc.menu.MenuElement(
      null,
      elementData
    ));
    
  };
  unilib.inherit(unilib.mvc.bc.menu.MainContextMenu,
    unilib.mvc.menu.Menu.prototype);
    
 /**
   * context sub menu used for adding nodes to the graph
   * @class
   * @extends {unilib.mvc.menu.Menu}
   * @param {unilib.mvc.bc.BooleanCircuitController} controller
   */
  unilib.mvc.bc.menu.AddNodeContextMenu = function(controller) {
    unilib.mvc.menu.Menu.call(this);
    //set menu items
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'Input';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.CreateNodeElementCommand(
        controller, 
        unilib.mvc.bc.GraphElementType.INPUT_NODE),
      elementData
    ));
    
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'Output';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.CreateNodeElementCommand(
        controller, 
        unilib.mvc.bc.GraphElementType.OUTPUT_NODE),
      elementData
    ));
    
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'AND';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.CreateNodeElementCommand(
        controller, 
        unilib.mvc.bc.GraphElementType.AND_NODE),
      elementData
    ));
    
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'OR';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.CreateNodeElementCommand(
        controller, 
        unilib.mvc.bc.GraphElementType.OR_NODE),
      elementData
    ));
    
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'XOR';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.CreateNodeElementCommand(
        controller, 
        unilib.mvc.bc.GraphElementType.XOR_NODE),
      elementData
    ));
    
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'NOT';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.CreateNodeElementCommand(
        controller, 
        unilib.mvc.bc.GraphElementType.NOT_NODE),
      elementData
    ));
    
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'NOR';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.CreateNodeElementCommand(
        controller, 
        unilib.mvc.bc.GraphElementType.NOR_NODE),
      elementData
    ));
    
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'NAND';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.CreateNodeElementCommand(
        controller, 
        unilib.mvc.bc.GraphElementType.NAND_NODE),
      elementData
    ));
    
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'XNOR';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.CreateNodeElementCommand(
        controller, 
        unilib.mvc.bc.GraphElementType.XNOR_NODE),
      elementData
    ));
    
  };
  unilib.inherit(unilib.mvc.bc.menu.AddNodeContextMenu,
    unilib.mvc.menu.Menu.prototype);
  
  /**
   * context menu used for editing a node
   * @class
   * @extends {unilib.mvc.menu.Menu}
   * @param {unilib.mvc.bc.BooleanCircuitController} controller
   */
  unilib.mvc.bc.menu.NodeContextMenu = function(controller) {
    unilib.mvc.menu.Menu.call(this);
    //set menu items
    
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'Delete';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.RemoveNodeElementCommand(
        controller),
      elementData
    ));
    
  };
  unilib.inherit(unilib.mvc.bc.menu.NodeContextMenu,
    unilib.mvc.menu.Menu.prototype);
    
  /**
   * context menu used for editing a pin
   * @class
   * @extends {unilib.mvc.menu.Menu}
   * @param {unilib.mvc.bc.BooleanCircuitController} controller
   */
  unilib.mvc.bc.menu.PinContextMenu = function(controller) {
    unilib.mvc.menu.Menu.call(this);
    //set menu items
    
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'Link';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.LinkCommand(
        controller),
      elementData
    ));
    
  };
  unilib.inherit(unilib.mvc.bc.menu.PinContextMenu,
    unilib.mvc.menu.Menu.prototype);
    
  /**
   * context menu used for editing an edge
   * @class
   * @extends {unilib.mvc.menu.Menu}
   * @param {unilib.mvc.bc.BooleanCircuitController} controller
   */
  unilib.mvc.bc.menu.EdgeContextMenu = function(controller) {
    unilib.mvc.menu.Menu.call(this);
    //set menu items
    
    var elementData = new unilib.mvc.menu.BaseMenuData();
    elementData.text = 'Delete';
    this.addItem(new unilib.mvc.menu.MenuElement(
      new unilib.mvc.bc.command.UnlinkCommand(
        controller),
      elementData
    ));
    
  };
  unilib.inherit(unilib.mvc.bc.menu.EdgeContextMenu,
    unilib.mvc.menu.Menu.prototype);
  
}, ['unilib/mvc/menu/model.js', 
  'unilib/mvc/boolean_circuit_graph/command.js']);
unilib.notifyLoaded();
