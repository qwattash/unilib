/**
 * @fileOverview strategy view that resolves HTML4 events to HTML5-like
 *  Drag and drop events
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.notifyStart('unilib/mvc/graph/loader.js');

/**
 * @namespace unilib.ajax
 */
unilib.provideNamespace('unilib.mvc.graph', function() {


  /**
   * commands for the server
   */
  unilib.mvc.graph.LoaderServerCommand = {
    LOAD : 'load',
    SAVE : 'save'
  };

 /**
  * Ajax loader handles save and load of the graph model
  * @class
  * @param {string} url
  * @param {number} token token to send to the server
  * that identifies the model to save
  */
  unilib.mvc.graph.Loader = function(url, token) {
    
    /**
     * graph serializer
     * @type {unilib.mvc.graph.GraphSerializer}
     * @private
     */
    this.serializer_ = new unilib.mvc.graph.GraphSerializer();
    
    /**
     * AJAX request object
     * @type {unilib.ajax.Request}
     * @protected
     */
    this.request_ = new unilib.ajax.Request(url, unilib.ajax.Method.POST, 
      this.serializer_);
    
    /**
     * token to be used
     * @type {number}
     * @protected
     */
    this.token_ = token;
    
    this.request_.addEventListener(unilib.ajax.ResponseStatus.ERROR,
      unilib.createCallback(this, this.onError));
    this.request_.addEventListener(unilib.ajax.ResponseStatus.COMPLETE,
      unilib.createCallback(this, this.onSuccess));
  };
  
  /**
   * load model
   * @param {unilib.mvc.graph.GraphModel} model model instance to
   * be populated
   * @public
   */
  unilib.mvc.graph.Loader.prototype.load = function(model) {
    this.serializer_.setDeserializationTarget(model);
    this.request_.send({
      "token": this.token_,
      "command" : unilib.mvc.graph.LoaderServerCommand.LOAD
    });
  };
  
  /**
   * save model
   * @param {unilib.mvc.graph.GraphModel} model
   * @public
   */
  unilib.mvc.graph.Loader.prototype.save = function(model) {
    this.request_.send({
      "token": this.token_,
      "graph_model" : model, 
      "command" : unilib.mvc.graph.LoaderServerCommand.SAVE
    });
  };
  
  /**
   * callback for error
   * @param {unilib.ajax.ResponseStatus} status
   * @param {unilib.ajax.ResponseCode} code
   * @param {Object} data 
   */
  unilib.mvc.graph.Loader.prototype.onError = function(status, code, data) {
    //should do something
    //console.log("err");
  };
  
  /**
   * callback for success
   * @param {unilib.ajax.ResponseStatus} status
   * @param {unilib.ajax.ResponseCode} code
   * @param {Object} data 
   */
  unilib.mvc.graph.Loader.prototype.onSuccess = function(status, code, data) {
    if (data) {
      //data is the model
      data.notify();
    }
  };
  
  
  //----------------------- Graph serializer -----------------------------------
  
  /**
   * serializer model tags for xml processing
   * @type {string}
   */
  unilib.mvc.graph.XMLNodeName = {
    TAG_MODEL : "GraphModel",
    TAG_NODE : "Node",
    TAG_PIN : "Pin",
    TAG_EDGE : "Edge",
    TAG_EDGE_DUMMY : "SharedEdge",
    TAG_DATA : "Data"
  };
  
  /**
   * json serializer for the graph model object
   * @class
   * @extends {unilib.ajax.Serializer}
   */
  unilib.mvc.graph.GraphSerializer = function(target) {
    unilib.ajax.Serializer.call(this);
    
    /**
     * target to use for deserialization, this is used
     * instead of a new GraphModel
     * @type {unilib.mvc.graph.GraphModel}
     * @private
     */
    this.target_ = null;
    
  };
  unilib.inherit(unilib.mvc.graph.GraphSerializer,
    unilib.ajax.Serializer.prototype);
  
  /**
   * @see {unilib.ajax.Serializer#serialize}
   */
  unilib.mvc.graph.GraphSerializer.prototype.serialize = function(obj) {
    if (obj instanceof unilib.mvc.graph.GraphModel) {
      var data = this.serialize_(obj);
      return data;
    }
    return obj;
  };
  
  /**
   * set deserialization target to use instead of a new object
   * @param {unilib.mvc.graph.GraphModel} target
   */
  unilib.mvc.graph.GraphSerializer.prototype.setDeserializationTarget = 
    function(target) {
    this.target_ = target;
  };
  
  /**
   * serialize graph model
   * @param {unilib.mvc.graph.GraphModel} model
   * @returns {string}
   */
  unilib.mvc.graph.GraphSerializer.prototype.serialize_ = function(model) {
    
    var root = this.getXMLDocument_("<" + 
      unilib.mvc.graph.XMLNodeName.TAG_MODEL + "></" + 
      unilib.mvc.graph.XMLNodeName.TAG_MODEL + ">", "application/xml");
    
    //array for the edges that are stored separately
    var edges = [];
    
    //fill root array with objects
    var iterNode = model.createIterator();
    for (iterNode.begin(); ! iterNode.end(); iterNode.next()) {
      var node = iterNode.item();
      var xmlNode = root.createElement(unilib.mvc.graph.XMLNodeName.TAG_NODE);
      xmlNode.setAttribute("id", node.getID());
      //record node data
      var xmlNodeData = root.createElement(
        unilib.mvc.graph.XMLNodeName.TAG_DATA);
      xmlNodeData.textContent = JSON.stringify(node.getData());
      xmlNode.appendChild(xmlNodeData);
      //record node
      root.documentElement.appendChild(xmlNode);
      //iter pins in the node
      var iterPin = node.createIterator();
      for (iterPin.begin(); ! iterPin.end(); iterPin.next()) {
        var pin = iterPin.item();
        var xmlPin = root.createElement(unilib.mvc.graph.XMLNodeName.TAG_PIN);
        xmlPin.setAttribute("id", pin.getID());
        xmlPin.setAttribute("direction", pin.getDirection());
        //record pin data
        var xmlPinData = root.createElement(
          unilib.mvc.graph.XMLNodeName.TAG_DATA);
        xmlPinData.textContent = JSON.stringify(pin.getData());
        xmlPin.appendChild(xmlPinData);
        //record pin
        xmlNode.appendChild(xmlPin);
        //iter edges attached to pin
        var iterEdge = pin.createIterator();
        for (iterEdge.begin(); ! iterEdge.end(); iterEdge.next()) {
          var edge = iterEdge.item();
          var xmlEdge = root.createElement(unilib.mvc.graph.XMLNodeName.TAG_EDGE_DUMMY);
          var index = edges.indexOf(edge); //edge reference index
          if (index == -1) {
            index = edges.push(edge) - 1;
          }
          xmlEdge.setAttribute("refer", index);
          //record edge
          xmlPin.appendChild(xmlEdge);
        }
      }  
    }
    //store edges separately in the root
    for (var i = 0; i < edges.length; i++) {
      var xmlEdge = root.createElement(unilib.mvc.graph.XMLNodeName.TAG_EDGE);
      xmlEdge.setAttribute("id", edge.getID());
      var xmlEdgeData = root.createElement(
        unilib.mvc.graph.XMLNodeName.TAG_DATA);
      xmlEdgeData.textContent = JSON.stringify(edges[i].getData());
      xmlEdge.appendChild(xmlEdgeData);
      xmlEdge.setAttribute("refer", i);
      //record data
      xmlEdge.appendChild(xmlEdgeData);
      root.documentElement.appendChild(xmlEdge);
    }
    return this.xmlToString_(root);
  };
  
  /**
   * convert XML tree to string
   * @param {XMLDocument} xmlDoc
   * @returns {string}
   */
  unilib.mvc.graph.GraphSerializer.prototype.xmlToString_ = function(xmlDoc) {
    
    var serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  };
  
  /**
   * create XML parser
   * @returns {XMLParser}
   */
  unilib.mvc.graph.GraphSerializer.prototype.getXMLDocument_ = function(xmlData) {
    if (window.ActiveXObject) {
      //IE
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = "false";
      xmlDoc.loadXML(xmlData);
      return xmlDoc;
    } else if (document.implementation && document.implementation.createDocument) {
      //Others
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlData,"application/xml");
      return xmlDoc;
    }
  };
  
  /**
   * fetch xml edge data given refer key
   * @param {string} refer
   * @param {Array.<DOMElement>} elements
   * @returns {DOMElement}
   * @private
   */
  unilib.mvc.graph.GraphSerializer.prototype.fetchEdge_ = 
    function(refer, elements) {
      for (var i = 0; i < elements.length; i++) {
        if (elements[i].getAttribute("refer") == refer) {
          return elements[i];
        }
      }
      return null;
    };
  
  /**
   * parse data field in the XML and return a valid object
   * @param {DOMElement} xmlData
   * @returns {unilib.mvc.graph.BaseGraphElementData}
   * @private
   */
  unilib.mvc.graph.GraphSerializer.prototype.parseData_ = function(xmlData) {
    var data = new unilib.mvc.graph.BaseGraphElementData();
    var dataObj = JSON.parse(xmlData.textContent);
    data.position = dataObj.position;
    data.points = dataObj.points;
    data.text = dataObj.text;
    return data;
  };
  
  /**
   * @see {unilib.ajax.Serializer#unserialize}
   */
  unilib.mvc.graph.GraphSerializer.prototype.unserialize = function(data) {
    var xmlDoc = this.getXMLDocument_(data);
    var model = (this.target_ != null) ? this.target_ : 
      new unilib.mvc.graph.GraphModel();
    //fetch edge informations
    var xmlEdges = xmlDoc.getElementsByTagName(
      unilib.mvc.graph.XMLNodeName.TAG_EDGE);
    
    //init array of edge instances
    var edges = [];
    for (var i = 0; i < xmlEdges.length; i++) {
      edges.push(null);
    }
    
    //fetch nodes
    var xmlNodes = xmlDoc.getElementsByTagName(
      unilib.mvc.graph.XMLNodeName.TAG_NODE);
    for (var i = 0; i < xmlNodes.length; i++) {
      //create node instance
      var node = model.makeNode();
      //set node data and attributes
      var xmlNodeData = xmlNodes[i].getElementsByTagName(
        unilib.mvc.graph.XMLNodeName.TAG_DATA)[0];
      node.setData(this.parseData_(xmlNodeData));
      node.setID(parseInt(xmlNodes[i].getAttribute("id")));
      //get node's pins
      var xmlPins = xmlNodes[i].getElementsByTagName(
        unilib.mvc.graph.XMLNodeName.TAG_PIN);
      //for each pin, create an instance and setup it
      for (var j = 0; j < xmlPins.length; j++) {
        var pin = node.makePin();
        //set pin ID
        pin.setID(parseInt(xmlPins[j].getAttribute("id")));
        //set pin direction
        pin.setDirection(parseInt(xmlPins[j].getAttribute("direction")));
        //set pin position data
        var xmlPinData = xmlPins[j].getElementsByTagName(
          unilib.mvc.graph.XMLNodeName.TAG_DATA)[0];
        pin.setData(this.parseData_(xmlPinData));
        //now inspect edges associated with the pin
        var xmlDummyEdges = xmlPins[j].getElementsByTagName(
          unilib.mvc.graph.XMLNodeName.TAG_EDGE_DUMMY);
        //loop over dummy edges and fetch corresponding real edge data
        //create the edge instance if not existing in the edges array
        //or link the existing instance
        for (var k = 0; k < xmlDummyEdges.length; k++) {
          var refer = xmlDummyEdges[k].getAttribute("refer");
          if (edges[refer] == null) {
            edges[refer] = new unilib.mvc.graph.Edge();
            //fetch actual data for the edge
            var xmlRealEdge = this.fetchEdge_(
              xmlDummyEdges[k].getAttribute("refer"), xmlEdges);
            //console.log(xmlEdges, xmlDummyEdges, xmlRealEdge, refer, i, j, k);
            //set edge id
            edges[refer].setID(parseInt(xmlRealEdge.getAttribute("id")));
            //set edge data
            var xmlEdgeData = xmlRealEdge.getElementsByTagName(
              unilib.mvc.graph.XMLNodeName.TAG_DATA)[0];
            edges[refer].setData(this.parseData_(xmlEdgeData));
          }
          //link current pin
          pin.link(edges[refer]);
        }
      }
    }
    return model;
  };
  
}, ['unilib/ajax/ajax.js']);
unilib.notifyLoaded();