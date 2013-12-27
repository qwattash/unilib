/**
 * @fileOverview model elements extensions that implements some
 *  particular policy for accepting or rejecting updates
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.ln
 * @deprecated
 */
unilib.provideNamespace('unilib.mvc.ln', function() {
  
  /**
   * logical network node
   * @extends {uniliv.mvc.graph.Node}
   */
  unilib.mvc.ln.LNNode = function(model) {
    unilib.mvc.graph.Node.call(model);
    
  };
  unilib.inherit(unilib.mvc.ln.LNNode,
      unilib.mvc.graph.Node.prototype);
  
  
}, ['unilib/mvc/graph/model.js']);
unilib.notifyLoaded();
