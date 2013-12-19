/**
 * @fileOverview Facade for logical network graph controller
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.provideNamespace('unilib.mvc.graph', function() {
  
  /**
   * Graph controller, holds global informations for the graph
   * representation and acts as a controller for the operations on the graph
   * @class
   * @extends {unilib.mvc.controller.CommadController}
   */
  unilib.mvc.graph.LogicalNetworkGraph = 
    function(styleProvider, model, view) {
    unilib.mvc.controller.CommadController.call(this);
    
    this.commandHandler = new unilib.mvc.controller.CommandController();
    
    this.model = model;
    this.view = view;
  };
  unilib.inherit(unilib.mvc.graph.GraphController, 
    unilib.mvc.controller.CommadController.prototype);
  
}, ['unilib/mvc/controller.js']);
