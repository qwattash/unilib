/**
 * @fileOverview Facade for logical network graph controller
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.notifyStart('unilib/mvc/boolean_circuit_graph/boolean_circuit_controller.js');

/**
 * @namespace unilib.mvc.bc.controller
 */
unilib.provideNamespace('unilib.mvc.bc.controller', function() {
  
  /**
   * Graph controller, holds global informations for the graph
   * representation and acts as a facade class for setting up the graph
   * @class
   * @extends {unilib.mvc.controller.CommandHandler}
   * @param {DOMElement} container main container for the view
   * @param {string} url remote url for load/save operations
   * @param {number} token remote token identifier for load/save operations
   * @param {boolean} [doRemoteLoad=false] load saved model or create a new one
   */
  unilib.mvc.bc.controller.BooleanCircuitController = function(container, url, 
    token, doRemoteLoad) {
    unilib.mvc.controller.CommandHandler.call(this);
    
    /**
     * maps styles to element ID and internal type of style
     * e.g. a node with id NODE can have two styles, one for the
     * BODY part and one for the TEXT (label) part. This is defined by
     * the drawableStrategy that builds the drawable for the node
     * @type {unilib.mvc.controller.StyleProvider}
     * @public
     */
    this.styleProvider = new unilib.mvc.controller.StyleProvider();
    
    /**
     * the drawable strategy builds and updates the drawables in the DrawableManager for
     * each modified element in the model, the strategy handles model elements in different
     * modules, in the case of the graph a module for each graph element is used, plus another
     * one for the context menu model.
     * @type {unilib.mvc.view.DrawableManagerStrategy}
     * @public
     */
    this.drawableStrategy = new unilib.mvc.view.DrawableManagerStrategy();
    //modules are added to the drawableStrategy
    this.drawableStrategy.addModule(
      new unilib.mvc.bc.NodeDrawableManagerStrategy(this.styleProvider));
    this.drawableStrategy.addModule(
      new unilib.mvc.bc.PinDrawableManagerStrategy(this.styleProvider));
    this.drawableStrategy.addModule(
      new unilib.mvc.bc.EdgeDrawableManagerStrategy(this.styleProvider));
    this.drawableStrategy.addModule(
      new unilib.mvc.bc.MenuDrawableManagerStrategy(this.styleProvider));
    
    /**
     * the renderer that displays the drawables
     * @type {unilib.graphics.renderer.HTML4Renderer}
     * @public
     */
    this.renderer = new unilib.graphics.HTML4Renderer(container);
    
    /**
     * drawable manager is in charge of converting the model into a drawable
     * representation and display it using the given renderer, the drawable 
     * strategy is used to build or update drawables for each model element
     * @type {unilib.mvc.view.DrawableManager}
     * @public
     */
    this.drawableManager = new unilib.mvc.view.DrawableManager(this.renderer, 
      this.drawableStrategy);
    
    /**
     * graph loader, used to save and load the graph model
     * @type {unilib.mvc.graph.Loader}
     * @public
     */
    this.loader = new unilib.mvc.graph.Loader(url, token);
    
    /**
     * graph model for the boolean circuit, it is an observable model, 
     * the drawablManager is an observer of the model. Note that there can be 
     * more than one drawableManagers that display the same model in 
     * different ways; e.g. the legacy graph drawing and a list of all elements
     * @type {unilib.mvc.graph.GraphModel}
     * @public
     */
    this.graphModel = new unilib.mvc.graph.GraphModel();
    if (doRemoteLoad) {
      this.loader.load(this.graphModel);
    }
    
    //attach graphModel observers
    this.graphModel.attachObserver(this.drawableManager);

    /**
     * submenu of the main context menu for adding nodes
     * @type {unilib.mvc.bc.menu.AddNodeContextMenu}
     * @public
     */
    this.addNodeMenuModel = new unilib.mvc.bc.menu.AddNodeContextMenu(this);
    
    /**
     * node context menu
     * @type {unilib.mvc.bc.menu.NodeContextMenu}
     * @public
     */
    this.nodeMenuModel = new unilib.mvc.bc.menu.NodeContextMenu(this);
    
    /**
     * pin linking context menu
     * @type {unilib.mvc.bc.menu.PinContextMenu}
     * @public
     */
    this.pinMenuModel = new unilib.mvc.bc.menu.PinContextMenu(this);
    
    /**
     * edge context menu
     * @type {unilib.mvc.bc.menu.EdgeContextMenu}
     * @public
     */
    this.edgeMenuModel = new unilib.mvc.bc.menu.EdgeContextMenu(this);
    
    /**
     * context menu models
     * @type {unilib.mvc.bc.MainContextMenu}
     * @public
     */
    this.mainMenuModel = new unilib.mvc.bc.menu.MainContextMenu(this, 
      this.addNodeMenuModel);
    
    //attach menuModel observers
    this.mainMenuModel.attachObserver(this.drawableManager);
    this.addNodeMenuModel.attachObserver(this.drawableManager);
    this.nodeMenuModel.attachObserver(this.drawableManager);
    this.pinMenuModel.attachObserver(this.drawableManager);
    this.edgeMenuModel.attachObserver(this.drawableManager);
    
    /**
     * the event manager is used to parse envents and convert them in an 
     * internal format, it parses the target for the event as well as the
     * coordinates in renderer coordinates. The event manager dispatches
     * the events to its observers, each observer is in charge of handling
     * a particular type or types of events, there can be multiple handlers
     * for the same event and will all be executed.
     * @type {unilib.mvc.controller.HTML4EventManager}
     * @public
     */
    this.eventManager = new unilib.mvc.controller.HTML4EventManager(container, 
      this.drawableManager);
      
    /**
     * event handler for drag and drop events, the event observer requires
     * at least a commandHandler to be used to run the commands, the command
     * handler usually holds other informations that are required by the
     * commands, in this case the commandHandler (this class) gives access
     * to every other relevant object
     * @type {unilib.mvc.bc.DragDropEventObserver}
     * @public
     */
    this.dragdropObserver = new unilib.mvc.bc.DragDropEventObserver(this);
    
    /**
     * event handler for click events, this handles selection and context
     * menu show/hide
     * @type {unilib.mvc.bc.ClickEventObserver}
     * @public
     */
    this.clickObserver = new unilib.mvc.bc.ClickEventObserver(this);
    
    /**
     * event handler for keyboard events, this handles key shortcuts
     * and text insertion
     * @type {unilib.mvc.bc.KeyEventObserver}
     * @public
     */
    this.keyObserver = new unilib.mvc.bc.KeyEventObserver(this);
    
    //attach event observers to the event manager
    this.eventManager.attachObserver(this.dragdropObserver);
    this.eventManager.attachObserver(this.clickObserver);
    this.eventManager.attachObserver(this.keyObserver);
    
    /**
     * selection manager, handles user selections of elements in
     * the graph
     * @type {unilib.mvc.bc.SelectionManager}
     * @public
     */
    this.selectionManager = new unilib.mvc.bc.SelectionManager(this.drawableManager);
    
  };
  unilib.inherit(unilib.mvc.bc.controller.BooleanCircuitController, 
    unilib.mvc.controller.CommandHandler.prototype);
  
}, ['unilib/graphics/renderer.js',
  'unilib/mvc/controller/controller.js', 
  'unilib/mvc/graph/model.js',
  'unilib/mvc/boolean_circuit_graph/event_handlers.js',
  'unilib/mvc/view/drawable_manager.js',
  'unilib/mvc/controller/event_manager.js',
  'unilib/mvc/boolean_circuit_graph/drawable_strategy.js',
  'unilib/mvc/boolean_circuit_graph/context_menu.js',
  'unilib/mvc/boolean_circuit_graph/selection_manager.js',
  'unilib/mvc/graph/loader.js']);
unilib.notifyLoaded();
