/**
 * @fileOverview Strategy modules to be used in a CompositeDrawableManager for
 *   creating and updating drawables in the view
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.bc
 */
unilib.provideNamespace('unilib.mvc.bc', function() {
  
  /**
   * type of graph elements, these are used as IDs of graph
   * elements
   * @enum {number}
   * @readonly
   */
  unilib.mvc.bc.GraphElementType = {
      INPUT_NODE: 0,
      OUTPUT_NODE: 1,
      PIN: 2,
      EDGE: 3,
      AND_NODE: 4,
      OR_NODE: 5,
      NOT_NODE: 6,
      NOR_NODE: 7,
      NAND_NODE: 8,
      XOR_NODE: 9,
      XNOR_NODE:10
  };
  
  
  /**
   * NodeSpec specifications for node creation
   * @class
   */
  unilib.mvc.bc.NodeSpec = function(input, output, label) {
    
    /**
     * number of inputs
     * @type {number}
     * @public
     */
    this.input = input;
    
    /**
     * number of outputs
     * @type {number}
     * @public
     */
    this.output = output;
    
    /**
     * label
     * @type {string}
     * @public
     */
    this.label = label;
  
  };
  
  /**
   * map number of input and output for each node
   * as well a label for them
   * @enum {unilib.mvc.bc.NodeSpec}
   */
  unilib.mvc.bc.GraphElementPins = {};
  unilib.mvc.bc.GraphElementPins[unilib.mvc.bc.GraphElementType.INPUT_NODE] = 
    new unilib.mvc.bc.NodeSpec(0, 1, 'Input');
  unilib.mvc.bc.GraphElementPins[unilib.mvc.bc.GraphElementType.OUTPUT_NODE] = 
    new unilib.mvc.bc.NodeSpec(1, 0,'Output');
  unilib.mvc.bc.GraphElementPins[unilib.mvc.bc.GraphElementType.AND_NODE] = 
    new unilib.mvc.bc.NodeSpec(2, 1,'AND');
  unilib.mvc.bc.GraphElementPins[unilib.mvc.bc.GraphElementType.OR_NODE] = 
    new unilib.mvc.bc.NodeSpec(2, 1,'OR');
  unilib.mvc.bc.GraphElementPins[unilib.mvc.bc.GraphElementType.NOT_NODE] = 
    new unilib.mvc.bc.NodeSpec(1, 1,'NOT');
  unilib.mvc.bc.GraphElementPins[unilib.mvc.bc.GraphElementType.XOR_NODE] = 
    new unilib.mvc.bc.NodeSpec(2, 1,'XOR');
  unilib.mvc.bc.GraphElementPins[unilib.mvc.bc.GraphElementType.XNOR_NODE] = 
    new unilib.mvc.bc.NodeSpec(2, 1,'XNOR');
  unilib.mvc.bc.GraphElementPins[unilib.mvc.bc.GraphElementType.NAND_NODE] = 
    new unilib.mvc.bc.NodeSpec(2, 1,'NAND');
  unilib.mvc.bc.GraphElementPins[unilib.mvc.bc.GraphElementType.NOR_NODE] = 
    new unilib.mvc.bc.NodeSpec(2, 1,'NOR');
  
  /**
   * style types to be used in unilib.mvc.controller.StyleProvider
   * @enum {string}
   */
  unilib.mvc.bc.StyleType = {
      TEXT: 'graph_text', //normal label text style
      BODY: 'graph_body', //normal body style
      TEXT_FOCUS: 'graph_text_focus', //text of a selected element
      BODY_FOCUS: 'graph_body_focus' //body of a selected element
  };
  
  /**
   * type of drawables used for the graph
   * @enum {string}
   */
  unilib.mvc.bc.DrawableShapeType = {
      LABEL_START: 'graph_labelStart',
      LABEL_END: 'graph_labelEnd',
      POLYLINE: 'graph_polyline',
      RECT: 'graph_rect'
  };
  
  
  // ----- strategy modules for DrawableManagerStrategy --------------
  /*
   * This note explains the structure of drawables created for each graph 
   * element, tag names in XML are class names of the objects involved.
   * Structure of a NODE:
   * <CompositeDrawableShape id=unilib.graphics.DrawableShapeType.COMPOSITE>
   *   <Rectangle id=unilib.graphics.DrawableShapeType.RECT/>
   *  <TextRect id=unilib.graphics.DrawableShapeType.TEXT/>
   * </CompositeDrawableShape>
   * Structure of a PIN:
   *   same as node.
   * Structure of an EDGE:
   * <CompositeDrawableShape id=unilib.graphics.DrawableShapeType.COMPOSITE>
   *   <CompositeDrawableShape id=unilib.mvc.bc.DrawableShapeType.POLYLINE>
   *     <!-- number of lines vary -->
   *    <Line id=unilib.graphics.DrawableShapeType.LINE/>
   *   </CompositeDrawableShape>
   *   <!-- from 0 to 2 labels -->
   *  <TextRect id=unilib.mvc.bc.DrawableShapeType.LABEL_LEFT/>
   *  <TextRect id=unilib.mvc.bc.DrawableShapeType.LABEL_RIGHT/>
   * </CompositeDrawableShape>
   */
  
  /**
   * module responsible for NODEs
   * @class
   * @extends {unilib.mvc.view.DrawableManagerStrategyModule}
   * @param {unilib.mvc.controller.StyleProvider} styleProvider provider of
   *   the styles
   * @param {number} [labelDistance=5] label distance from the body of the element
   * @param {number} [maxLabelLength=200] max length of a label
   */
  unilib.mvc.bc.NodeDrawableManagerStrategy = 
    function(styleProvider, labelDistance, maxLabelLength) {
    
    /**
     * provide the StyleInformations for each part of the node
     * @type {unilib.mvc.controller.StyleProvider}
     * @private
     */
    this.styleProvider_ = styleProvider;
    
    /**
     * label distance from the body of the element
     * @type {number}
     * @private
     */
    this.labelDistance_ = labelDistance || 5;
    
    /**
     * maximum label length
     * @type {number}
     * @private
     */
    this.maxLabelLength_ = maxLabelLength || 200;
  };
  unilib.inherit(unilib.mvc.bc.NodeDrawableManagerStrategy,
      unilib.mvc.view.DrawableManagerStrategyModule.prototype);
  
  // private helpers
  
  /**
   * set position, width and height to a rectangle stored in GraphElement as
   * point array [topLeft, bottomRight]
   * @protected
   * @param {unilib.mvc.graph.GraphElement} elem
   * @param {unilib.graphics.Rectangle} rect
   * @param {unilib.graphics.StyleInformations} style
   */
  unilib.mvc.bc.NodeDrawableManagerStrategy.prototype.setupRect_ = 
    function(elem, rect, style) {
    var data = elem.getData();
    rect.setStyleInformations(style);
    var topLeft = new unilib.geometry.Point(data.points[0].x, 
        data.points[0].y);
    rect.setTopLeft(topLeft);
    var bottomRight = new unilib.geometry.Point(data.points[1].x, 
        data.points[1].y);
    rect.setBottomRight(bottomRight);
    rect.setPosition(data.position);
  };
  
  /**
   * set position width and height of a label container to be used as label
   * for a GraphElement
   * @protected
   * @param {unilib.mvc.graph.BaseGraphElementData} data
   * @param {unilib.graphics.TextRect} label
   * @param {unilib.graphics.StyleInformations} style
   */
  unilib.mvc.bc.NodeDrawableManagerStrategy.prototype.setupLabel_ =
    function(elem, label, style) {
    var data = elem.getData();
    label.setStyleInformations(style);
    var textLength = style.textSize * data.text.length;
    var position = new unilib.geometry.Point3D(
        data.points[0].x + data.position.x,
        data.points[1].y + data.position.y, 
        data.position.z);
    var rectEdgeLength = Math.abs(data.points[0].x - data.points[1].x);
    var textOverflow = rectEdgeLength - textLength;
    if (textOverflow < 0) {
      //there is overflow
      topLeft = new unilib.geometry.Point(
          Math.round(textOverflow / 2), 
          this.labelDistance_);
      bottomRight = new unilib.geometry.Point(
          data.points[1].x - data.points[0].x - Math.round(textOverflow / 2), 
          style.textSize + this.labelDistance_);
    }
    else {
      topLeft = new unilib.geometry.Point(
          0, 
          this.labelDistance_);
      bottomRight = new unilib.geometry.Point(
          data.points[1].x - data.points[0].x, 
          style.textSize + this.labelDistance_);
    }
    label.setTopLeft(topLeft);
    label.setBottomRight(bottomRight);
    label.setPosition(position);
    label.setText(data.text);
  };
  
  // DrawableManagerStrategyModule interface
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#build}
   */
  unilib.mvc.bc.NodeDrawableManagerStrategy.prototype.build = 
    function(elem) {
    if (! this.canHandle(elem)) {
      throw new unilib.mvc.view.ViewError('Node drawable manager ' + 
          'can not handle given element');
    }
    var data = elem.getData();
    var drawable = new unilib.graphics.CompositeDrawableShape();
    var nodeBody = new unilib.graphics.Rectangle();
    var nodeStyle = this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.bc.StyleType.BODY);
    this.setupRect_(elem, nodeBody, nodeStyle);
    drawable.addDrawable(nodeBody);
    if (data.text != '') {
      label = new unilib.graphics.TextRect();
      var labelStyle = this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.bc.StyleType.TEXT);
      this.setupLabel_(elem, label, labelStyle);
      drawable.addDrawable(label);
    }
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#update}
   */
  unilib.mvc.bc.NodeDrawableManagerStrategy.prototype.update =
    function(drawable, elem) {
    if (! this.canHandle(elem)) {
      throw new unilib.mvc.view.ViewError('Node drawable manager ' + 
          'can not handle given element');
    } 
    //traverse drawable structure
    var i = drawable.createDrawableIterator();
    //first elements is the node
    var node = i.item();
    i.next();
    //second element is the label if any
    var label = (! i.end()) ? i.item() : null;
    //update node body based on model informations
    var data = elem.getData();
    var nodeStyle = (drawable.hasFocus()) ? 
      this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.bc.StyleType.BODY_FOCUS) :
      this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.bc.StyleType.BODY);
    this.setupRect_(elem, node, nodeStyle);
    //update label informations if any
    if (data.text) {
      var labelStyle = (drawable.hasFocus()) ? 
      this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.bc.StyleType.TEXT_FOCUS) :
      this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.bc.StyleType.TEXT);
      if (! label) {
        label = new unilib.graphics.TextRect();
        drawable.addDrawable(label);
      }
      //setup or update label
      this.setupLabel_(elem, label, labelStyle);
    }
    else if (label){
      //there is no text but label exists
      drawable.removeDrawable(label);
    }
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#canHandle}
   */
  unilib.mvc.bc.NodeDrawableManagerStrategy.prototype.canHandle =
    function(elem) {
      var id = elem.getID();
      if (id == unilib.mvc.bc.GraphElementType.INPUT_NODE ||
        id == unilib.mvc.bc.GraphElementType.OUTPUT_NODE ||
        id == unilib.mvc.bc.GraphElementType.AND_NODE ||
        id == unilib.mvc.bc.GraphElementType.OR_NODE ||
        id == unilib.mvc.bc.GraphElementType.NOT_NODE ||
        id == unilib.mvc.bc.GraphElementType.NOR_NODE ||
        id == unilib.mvc.bc.GraphElementType.NAND_NODE ||
        id == unilib.mvc.bc.GraphElementType.XOR_NODE ||
        id == unilib.mvc.bc.GraphElementType.XNOR_NODE) {
        return true;
      }
      return false;
  };
  
  /**
   * module responsible for PINs, since pins are considered as rectangles,
   * reuse node implementation
   * @class
   * @extends {unilib.mvc.bc.NodeDrawableManagerStrategyModule}
   * @param {unilib.mvc.controller.StyleProvider} styleProvider provider of
   *   the styles
   */
  unilib.mvc.bc.PinDrawableManagerStrategy = function(styleProvider) {
    unilib.mvc.bc.NodeDrawableManagerStrategy.call(this, styleProvider);
  };
  unilib.inherit(unilib.mvc.bc.PinDrawableManagerStrategy,
      unilib.mvc.bc.NodeDrawableManagerStrategy.prototype);
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#build}
   */
  unilib.mvc.bc.PinDrawableManagerStrategy.prototype.build = 
    function(elem) {
    drawable = unilib.mvc.bc.NodeDrawableManagerStrategy.prototype.build.call(
       this, elem);
    drawable.setCollisionMode(unilib.collision.CollisionMode.GHOST);
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#update}
   */
  unilib.mvc.bc.PinDrawableManagerStrategy.prototype.update =
    function(drawable, elem) {
    drawable = unilib.mvc.bc.NodeDrawableManagerStrategy.prototype.update.call(
       this, drawable, elem);
    drawable.setCollisionMode(unilib.collision.CollisionMode.GHOST);
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#canHandle}
   */
  unilib.mvc.bc.PinDrawableManagerStrategy.prototype.canHandle =
    function(elem) {
      if (elem.getID() == unilib.mvc.bc.GraphElementType.PIN) {
        return true;
      }
      return false;
  };
  
  /**
   * module responsible for EDGEs
   * @class
   * @extends {unilib.mvc.view.DrawableManagerStrategyModule}
   * @param {unilib.mvc.controller.StyleProvider} styleProvider provider of
   *   the styles
   * @param {number} [labelDistance=5] label distance from the body of the element
   * @param {number} [maxLabelLength=200] max length of a label
   */
  unilib.mvc.bc.EdgeDrawableManagerStrategy = 
    function(styleProvider, labelDistance, maxLabelLength) {
    
    /**
     * provide the StyleInformations for each part of the node
     * @type {unilib.mvc.controller.StyleProvider}
     * @private
     */
    this.styleProvider_ = styleProvider;
    
    /**
     * label distance from the body of the element
     * @type {number}
     * @private
     */
    this.labelDistance_ = labelDistance || 5;
    
    /**
     * maximum label length
     * @type {number}
     * @private
     */
    this.maxLabelLength_ = maxLabelLength || 200;
  };
  unilib.inherit(unilib.mvc.bc.EdgeDrawableManagerStrategy,
      unilib.mvc.view.DrawableManagerStrategyModule.prototype);
  
  // private helpers
  
  /**
   * setup a polyline
   * @private
   * @param {unilib.mvc.graph.BaseGraphElementData} data
   * @param {unilib.graphics.Rectangle} label
   * @param {unilib.graphics.StyleInformations} style
   */
  unilib.mvc.bc.EdgeDrawableManagerStrategy.prototype.setupPolyline_ = 
    function(elem, polyline, style) {
    var data = elem.getData();
    /**
     * the cycle is built so that it can handle both creation and update of
     * the polyline drawable
     */
    var lines = polyline.createDrawableIterator();
    var i = 1;
    while (i < data.points.length) {
      if (i < data.points.length) {
        /*
         * there are points in the buffer that have not corresponding line
         * or there is a corresponding line
         */
        var line = null;
        if (lines.end()) {
          line = new unilib.graphics.Line();
          polyline.addDrawable(line);
        }
        else {
          line = lines.item();
        }
        var start = data.points[i - 1];
        var end = data.points[i];
        line.setPosition(new unilib.geometry.Point3D(0, 0, 0));
        line.setStart(start);
        line.setEnd(end);
        line.setStyleInformations(style);
      }
      lines.next();
      i++;
    }
    //now remove unused lines
    for (; ! lines.end(); lines.next()) {
        //there are unwanted lines in the polyline, remove the remaining
        polyline.removeDrawable(lines.item());
    }
    polyline.setPosition(data.position);
  };
  
  /**
   * set position width and height of textRects to be used as label
   * for a GraphElement. Experimental, a good implementation require
   * a collision detection engine.
   * @private
   * @param {unilib.mvc.graph.GraphElement} elem
   * @param {string} text
   * @param {unilib.graphics.Line} relatedLine line used as reference
   * @param {unilib.graphics.TextRect} label label to be updated
   *   for positioning
   * @param {unilib.graphics.StyleInformations} style
   */
  unilib.mvc.bc.EdgeDrawableManagerStrategy.prototype.setupLabel_ =
    function(elem, text, relatedLine, label, style) {
    //default text to ""
    if (text == null) {
      text = '';
    }
    //create labels
    //setup label text and position
    var lineStyle = relatedLine.getStyleInformations();
    var labelTopLeft, labelBottomRight;
    /*
     * estimate text length (in pixels)
     * textLength is calculated not to be longer than MAX_LABEL_LENGTH
     */
    var textLength = Math.min(style.textSize * text.length, 
        this.maxLabelLength_);
    label.setStyleInformations(style);
    //translate all positioning relative to relatedLine::start
    var labelPosition = new unilib.geometry.Point3D(
        relatedLine.getPosition().x + relatedLine.getStart().x, 
        relatedLine.getPosition().y + relatedLine.getStart().y, 
        relatedLine.getPosition().z);
    label.setPosition(labelPosition);
    //lines are expected to be horizontal or vertical, not oblique
    if (relatedLine.getStart().x == relatedLine.getEnd().x) {
      //if line is vertical, label on the right
      var lineCenter = Math.round(
          (relatedLine.getEnd().y + relatedLine.getStart().y) / 2);
      labelTopLeft = new unilib.geometry.Point(
          lineStyle.lineWidth + this.labelDistance_,
          lineCenter);
      labelBottomRight = new unilib.geometry.Point(
          lineStyle.lineWidth + this.labelDistance_ + textLength, 
          lineCenter + style.textSize);
    }
    else {
      //if line is horizontal label below the line
      var lineCenter = Math.round(
          (relatedLine.getEnd().x + relatedLine.getStart().x) / 2);
      labelTopLeft = new unilib.geometry.Point(
          lineCenter, 
          lineStyle.lineWidth + this.labelDistance_
          );
      labelBottomRight = new unilib.geometry.Point(
          lineCenter + textLength, 
          lineStyle.lineWidth + style.textSize + this.labelDistance_);
    }
    label.setTopLeft(labelTopLeft);
    label.setBottomRight(labelBottomRight);
    label.setText(text);
    return label;
  };
  
  /**
   * extract element with given id from a composite drawable
   * @private
   * @param {unilib.graphics.CompositeDrawableShape} composite main container
   * @param {(number | string)} labelID label ID to search for
   * @returns {?unilib.interfaces.graphics.IDrawable}
   */
  unilib.mvc.bc.EdgeDrawableManagerStrategy.prototype.extractElement_ = 
    function(composite, id) {
    var iter = composite.createDrawableIterator();
    for (iter.begin(); ! iter.end(); iter.next()) {
      if (iter.item().getID() == id) {
        return iter.item();
      }
    }
    return null;
  };
  
  /**
   * get container for a label, if not existent create one or remove it
   *  if needed
   * @private
   * @param {unilib.graphics.CompositeDrawableShape} drawable main container
   * @param {string} text text that have to be set in the label (to remove
   *   empty labels)
   * @param {(number | string)} labelID label ID to search for/add
   * @returns {?unilib.graphics.TextRect}
   */
  unilib.mvc.bc.EdgeDrawableManagerStrategy.prototype.getLabelContainer_ = 
    function(drawable, text, labelID) {
    var label = this.extractElement_(drawable, labelID);
    if (text != '' && ! label) {
      //if there is some text and there is not a label, create one
      label = new unilib.graphics.TextRect();
      label.setID(labelID);
      drawable.addDrawable(label);
    }
    else if (label){
      //if there is a label and the text is empty, remove the label
      drawable.removeDrawable(label);
    }
    
    if (label) {
      label.setCollisionMode(unilib.collision.CollisionMode.GHOST);
    }
    return label;
  };
  
  //unilib.mvc.view.DrawableManagerStrategyModule interface
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#build}
   */
  unilib.mvc.bc.EdgeDrawableManagerStrategy.prototype.build = 
    function(elem) {
    if (! this.canHandle(elem)) {
      throw new unilib.mvc.view.ViewError('Edge drawable manager ' + 
          'can not handle given element');
    }
    //create polyline container and main drawable container
    var data = elem.getData();
    var drawable = new unilib.graphics.CompositeDrawableShape();
    var polyline = new unilib.graphics.CompositeDrawableShape();
    polyline.setID(unilib.mvc.bc.DrawableShapeType.POLYLINE);
    drawable.setCollisionMode(unilib.collision.CollisionMode.GHOST);
    var polylineStyle = this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.bc.StyleType.BODY);
    var lineStart = new unilib.graphics.Line();
    var lineEnd = new unilib.graphics.Line();
    polyline.addDrawable(lineStart);
    for (var i = 2; i < data.points.length - 1; i++) {
      polyline.addDrawable(new unilib.graphics.Line());
    }
    polyline.addDrawable(lineEnd);
    this.setupPolyline_(elem, polyline, polylineStyle);
    drawable.addDrawable(polyline);
    //setup labels and label containers
    if (data.text && data.text != '') {
      var text = data.text.match(/<start:(.*)><end:(.*)>/);
      textStart = (text && text[1] !== undefined) ? text[1] : null;
      textEnd = (text && text[2] !== undefined) ? text[2] : null;
      var labelStart = this.getLabelContainer_(drawable, textStart,
          unilib.mvc.bc.DrawableShapeType.LABEL_START);
      var labelEnd = this.getLabelContainer_(drawable, textEnd,
          unilib.mvc.bc.DrawableShapeType.LABEL_END);
      var labelStyle = this.styleProvider_.getStyle(elem.getID(), 
          unilib.mvc.bc.StyleType.TEXT);
      if (labelStart) {
        this.setupLabel_(elem, textStart, lineStart, labelStart, labelStyle);
        labelStart.setPosition(polyline.getPosition());
      }
      if (labelEnd) {
        this.setupLabel_(elem, textEnd, lineEnd, labelEnd, labelStyle);
        labelEnd.setPosition(polyline.getPosition());
      }
    }
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#update}
   */
  unilib.mvc.bc.EdgeDrawableManagerStrategy.prototype.update =
    function(drawable, elem) {
    if (! this.canHandle(elem)) {
      throw new unilib.mvc.view.ViewError('Edge drawable manager ' + 
          'can not handle given element');
    }
    drawable.setCollisionMode(unilib.collision.CollisionMode.GHOST);
    var data = elem.getData();
    var polyline = this.extractElement_(drawable, 
        unilib.mvc.bc.DrawableShapeType.POLYLINE);
    var polylineStyle = (drawable.hasFocus()) ? 
      this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.bc.StyleType.BODY_FOCUS) : 
      this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.bc.StyleType.BODY);
    this.setupPolyline_(elem, polyline, polylineStyle);
    //update label informations
    //get label style
    var labelStyle = (drawable.hasFocus()) ? 
      this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.bc.StyleType.TEXT_FOCUS) : 
      this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.bc.StyleType.TEXT);
    //parse label text 
    var text = data.text.match(/<start:(.*)><end:(.*)>/);
    textStart = (text && text[1] != undefined) ? text[1] : null;
    textEnd = (text && text[2] != undefined) ? text[2] : null;
    //get related lines for label positioning
    var iter = polyline.createDrawableIterator();
    //get existing label container if any
    var labelStart = this.getLabelContainer_(drawable, textStart,
        unilib.mvc.bc.DrawableShapeType.LABEL_START);
    //set iterator to beginning line
    iter.begin();
    if (labelStart) 
      this.setupLabel_(elem, textStart, iter.item(), labelStart, labelStyle);
    //get existing label container if any
    var labelEnd = this.getLabelContainer_(drawable, textEnd,
        unilib.mvc.bc.DrawableShapeType.LABEL_END);
    //set iterator to last line
    iter.finish();
    if (labelEnd) 
      this.setupLabel_(elem, textEnd, iter.item(), labelEnd, labelStyle);
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#canHandle}
   */
  unilib.mvc.bc.EdgeDrawableManagerStrategy.prototype.canHandle =
    function(elem) {
      if (elem.getID() == unilib.mvc.bc.GraphElementType.EDGE) {
        return true;
      }
      return false;
  };
  
  /**
   * ContextMenu DrawableManagerStrategyModule
   * @class
   * @extends {unilib.mvc.view.DrawableManagerStrategyModule}
   */
  unilib.mvc.bc.MenuDrawableManagerStrategy = 
    function(styleProvider, textDistance, maxTextLength) {
    unilib.mvc.view.DrawableManagerStrategyModule.call(this);
    
    /**
     * provide the StyleInformations for each part of the node
     * @type {unilib.mvc.controller.StyleProvider}
     * @private
     */
    this.styleProvider_ = styleProvider;
    
    /**
     * label distance from the body of the element
     * @type {number}
     * @private
     */
    this.textDistance_ = textDistance || 2;
    
    /**
     * maximum label length
     * @type {number}
     * @private
     */
    this.maxTextLength_ = maxTextLength || 25;
    
  };
  unilib.inherit(unilib.mvc.bc.MenuDrawableManagerStrategy, 
      unilib.mvc.view.DrawableManagerStrategyModule.prototype);
  
  /**
   * setup menu container
   * @param {unilib.mvc.menu.Menu} element
   * @param {unilib.graphics.Rectangle} drawable background rectangle
   * @param {unilib.graphics.CompositeDrawableShape} container drawable
   * @param {unilib.graphics.StyleInformations} style
   * @param {unilib.graphics.StyleInformations} itemStyle style of an item
   */
  unilib.mvc.bc.MenuDrawableManagerStrategy.prototype.setupMenu_ = 
    function(element, drawable, container, style, itemStyle) {
      container.setPosition(element.getPosition());
      drawable.setStyleInformations(style);
      var position = new unilib.geometry.Point3D(0, 0, 0);
      drawable.setPosition(position);
      //if there is a border do not make the items be above it
      drawable.setTopLeft(new unilib.geometry.Point(-style.lineWidth, -style.lineWidth));
      //count number of items
      var numElements = 0;
      var menuWidth = 0;
      for (var i = container.createDrawableIterator(); ! i.end(); i.next()) {
        if (i.item() == drawable) continue;
        numElements++;
        var width = i.item().getBottomRight().x - i.item().getTopLeft().x;
        if (width > menuWidth) {
          //update max with
          menuWidth = width;
        }
      }
      var menuHeight = numElements * 
        (itemStyle.textSize + 2 * itemStyle.lineWidth + this.textDistance_);
      drawable.setBottomRight(
        new unilib.geometry.Point(menuWidth + style.lineWidth, 
          menuHeight + style.lineWidth));
      return drawable;
  };
  
  /**
   * setup menu container
   * @param {unilib.mvc.menu.MenuElement} element
   * @param {unilib.graphics.TextRect} drawable
   * @param {number} index index of the item in the menu
   * @param {unilib.graphics.StyleInformations} style
   */
  unilib.mvc.bc.MenuDrawableManagerStrategy.prototype.setupItem_ = 
    function(element, drawable, index, style) {
      var data = element.getData();
      drawable.setStyleInformations(style);
      drawable.setText(data.text);
      //position relative to container
      var itemHeight = style.textSize + 2 * style.lineWidth;
      var itemWidth = style.textSize * 0.85 * data.text.length;
      var position = new unilib.geometry.Point3D(0, 
        index * (itemHeight + this.textDistance_), 1);
      drawable.setTopLeft(new unilib.geometry.Point(0, 0));
      drawable.setBottomRight(
        new unilib.geometry.Point(itemWidth, itemHeight));
      drawable.setPosition(position);
      return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#build}
   */
  unilib.mvc.bc.MenuDrawableManagerStrategy.prototype.build = 
    function(elem) {
    if (! this.canHandle(elem)) {
      throw new unilib.mvc.view.ViewError('Menu drawable manager ' + 
          'can not handle given element');
    }
    var container = new unilib.graphics.CompositeDrawableShape();
    var bgRect = new unilib.graphics.Rectangle();
    container.addDrawable(bgRect);
    var menuStyle = this.styleProvider_.getStyle(elem.getID(), 
      unilib.mvc.bc.StyleType.BODY);
    //setup items
    var itemStyle = this.styleProvider_.getStyle(elem.getID(), 
      unilib.mvc.bc.StyleType.TEXT);
    var index = 0;
    for (var i = elem.createItemIterator(); !i.end(); i.next()) {
      var item = new unilib.graphics.TextRect();
      this.setupItem_(i.item(), item, index, itemStyle);
      container.addDrawable(item);
      index++;
    }
    //setupmenu is called here because the height is set using
    //the number of drawables added
    this.setupMenu_(elem, bgRect, container, menuStyle, itemStyle);
    return container;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#update}
   */
  unilib.mvc.bc.MenuDrawableManagerStrategy.prototype.update =
    function(drawable, elem) {
    if (! this.canHandle(elem)) {
      throw new unilib.mvc.view.ViewError('Menu drawable manager ' + 
          'can not handle given element');
    }
    var menuStyle = this.styleProvider_.getStyle(elem.getID(), 
      unilib.mvc.bc.StyleType.BODY);
    //extract bg rect and update items
    var itemStyle = this.styleProvider_.getStyle(elem.getID(), 
      unilib.mvc.bc.StyleType.TEXT);
    var index = 0;
    var bgRect = null;
    var i = drawable.createDrawableIterator();
    var j = elem.createItemIterator();
    while (! j.end()) {
      if (! i.end()) {
        if(i.item().getID() == unilib.graphics.DrawableShapeType.SHAPE_RECT) {
          //this is the background rect
          bgRect = i.item();
          i.next();
          continue;
        }
        else {
          //i.item() is the drawable relative to j.item(), update accordingly
          this.setupItem_(j.item(), i.item(), index, itemStyle);
        }
      }
      else {
        //there are more items than drawable representations,
        //new drawables must be added
        var newItem = new unilib.graphics.TextRect();
        drawable.addDrawable(newItem);
        this.setupItem_(j.item(), newItem, index, itemStyle);
      }
      //increment for next step
      j.next();
      i.next();
      index++;
    }
    //if there are additional drawables, remove them
    while (! i.end()) {
      drawable.removeDrawable(i.item());
      i.next();
    }
    this.setupMenu_(elem, bgRect, drawable, menuStyle, itemStyle);
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#canHandle}
   */
  unilib.mvc.bc.MenuDrawableManagerStrategy.prototype.canHandle =
    function(elem) {
      if (elem.getID() == unilib.mvc.menu.MenuType.MENU) {
        return true;
      }
      return false;
  };
  
}, ['unilib/error.js', 'unilib/mvc/view/drawable_manager.js',
    'unilib/graphics/drawable.js', 'unilib/mvc/controller/controller.js',
    'unilib/graphics/collision.js']);
unilib.notifyLoaded();