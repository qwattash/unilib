/**
 * @fileOverview Strategy modules to be used in a CompositeDrawableManager for
 *   creating and updating drawables in the view
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.ln
 */
unilib.provideNamespace('unilib.mvc.ln', function() {
  
  /**
   * type of graph elements, these are used as IDs of graph
   * elements
   * @enum {number}
   */
  unilib.mvc.ln.GraphElementType = {
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
   * style types to be used in unilib.mvc.controller.StyleProvider
   * @enum {string}
   */
  unilib.mvc.ln.StyleType = {
      TEXT: 'graph_text',
      BODY: 'graph_body'
  };
  
  /**
   * type of drawables used for the graph
   * @enum {string}
   */
  unilib.mvc.ln.DrawableShapeType = {
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
   *   <CompositeDrawableShape id=unilib.mvc.ln.DrawableShapeType.POLYLINE>
   *     <!-- number of lines vary -->
   *    <Line id=unilib.graphics.DrawableShapeType.LINE/>
   *   </CompositeDrawableShape>
   *   <!-- from 0 to 2 labels -->
   *  <TextRect id=unilib.mvc.ln.DrawableShapeType.LABEL_LEFT/>
   *  <TextRect id=unilib.mvc.ln.DrawableShapeType.LABEL_RIGHT/>
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
  unilib.mvc.ln.NodeDrawableManagerStrategy = 
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
  unilib.inherit(unilib.mvc.ln.NodeDrawableManagerStrategy,
      unilib.mvc.view.DrawableManagerStrategyModule.prototype);
  
  // private helpers
  
  /**
   * set position, width and height to a rectangle stored in GraphElement as
   * point array [topLeft, bottomRight]
   * @protected
   * @param {unilib.mvc.graph.BaseGraphElementData} data
   * @param {unilib.graphics.Rectangle} rect
   */
  unilib.mvc.ln.NodeDrawableManagerStrategy.prototype.setupRect_ = 
    function(elem, rect) {
    var data = elem.getData();
    var style = this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.ln.StyleType.BODY);
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
   */
  unilib.mvc.ln.NodeDrawableManagerStrategy.prototype.setupLabel_ =
    function(elem, label) {
    var data = elem.getData();
    var style = this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.ln.StyleType.TEXT);
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
  unilib.mvc.ln.NodeDrawableManagerStrategy.prototype.build = 
    function(elem) {
    if (! this.canHandle(elem)) {
      throw new unilib.mvc.view.ViewError('Node drawable manager ' + 
          'can not handle given element');
    }
    var data = elem.getData();
    var drawable = new unilib.graphics.CompositeDrawableShape();
    var nodeBody = new unilib.graphics.Rectangle();
    this.setupRect_(elem, nodeBody);
    drawable.addDrawable(nodeBody);
    if (data.text != '') {
      label = new unilib.graphics.TextRect();
      this.setupLabel_(elem, label);
      drawable.addDrawable(label);
    }
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#update}
   */
  unilib.mvc.ln.NodeDrawableManagerStrategy.prototype.update =
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
    this.setupRect_(elem, node);
    //update label informations if any
    if (data.text) {
      if (! label) {
        label = new unilib.graphics.TextRect();
        drawable.addDrawable(label);
      }
      //setup or update label
      this.setupLabel_(elem, label);
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
  unilib.mvc.ln.NodeDrawableManagerStrategy.prototype.canHandle =
    function(elem) {
      var id = elem.getID();
      if (id == unilib.mvc.ln.GraphElementType.INPUT_NODE ||
        id == unilib.mvc.ln.GraphElementType.OUTPUT_NODE ||
        id == unilib.mvc.ln.GraphElementType.AND_NODE ||
        id == unilib.mvc.ln.GraphElementType.OR_NODE ||
        id == unilib.mvc.ln.GraphElementType.NOT_NODE ||
        id == unilib.mvc.ln.GraphElementType.NOR_NODE ||
        id == unilib.mvc.ln.GraphElementType.NAND_NODE ||
        id == unilib.mvc.ln.GraphElementType.XOR_NODE ||
        id == unilib.mvc.ln.GraphElementType.XNOR_NODE) {
        return true;
      }
      return false;
  };
  
  /**
   * module responsible for PINs, since pins are considered as rectangles,
   * reuse node implementation
   * @class
   * @extends {unilib.mvc.ln.NodeDrawableManagerStrategyModule}
   * @param {unilib.mvc.controller.StyleProvider} styleProvider provider of
   *   the styles
   */
  unilib.mvc.ln.PinDrawableManagerStrategy = function(styleProvider) {
    unilib.mvc.ln.NodeDrawableManagerStrategy.call(this, styleProvider);
  };
  unilib.inherit(unilib.mvc.ln.PinDrawableManagerStrategy,
      unilib.mvc.ln.NodeDrawableManagerStrategy.prototype);
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#build}
   */
  unilib.mvc.ln.PinDrawableManagerStrategy.prototype.build = 
    function(elem) {
    drawable = unilib.mvc.ln.NodeDrawableManagerStrategy.prototype.build.call(
       this, elem);
    drawable.setCollisionMode(unilib.collision.CollisionMode.GHOST);
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#update}
   */
  unilib.mvc.ln.PinDrawableManagerStrategy.prototype.update =
    function(drawable, elem) {
    drawable = unilib.mvc.ln.NodeDrawableManagerStrategy.prototype.update.call(
       this, drawable, elem);
    drawable.setCollisionMode(unilib.collision.CollisionMode.GHOST);
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#canHandle}
   */
  unilib.mvc.ln.PinDrawableManagerStrategy.prototype.canHandle =
    function(elem) {
      if (elem.getID() == unilib.mvc.ln.GraphElementType.PIN) {
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
  unilib.mvc.ln.EdgeDrawableManagerStrategy = 
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
  unilib.inherit(unilib.mvc.ln.EdgeDrawableManagerStrategy,
      unilib.mvc.view.DrawableManagerStrategyModule.prototype);
  
  // private helpers
  
  /**
   * setup a polyline
   * @private
   * @param {unilib.mvc.graph.BaseGraphElementData} data
   * @param {unilib.graphics.Rectangle} label
   * @param {unilib.graphics.StyleInformations} labelStyle
   */
  unilib.mvc.ln.EdgeDrawableManagerStrategy.prototype.setupPolyline_ = 
    function(elem, polyline) {
    var style = this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.ln.StyleType.BODY);
    var data = elem.getData();
    /**
     * the cycle is built so that it can handle both creation and update of
     * the polyline drawable
     */
    var lines = polyline.createDrawableIterator();
    var i = 1;
    while (i < data.points.length || ! lines.end()) {
      if (i < data.points.length) {
        /*
         * there are points in the buffer that have not corresponding line
         * or there is a corresponding line
         */
        var line = (lines.end()) ? unilib.graphics.Line() : lines.item();
        var start = data.points[i - 1];
        var end = data.points[i];
        line.setPosition(new unilib.geometry.Point3D(0, 0, 0));
        line.setStart(start);
        line.setEnd(end);
        line.setStyleInformations(style);
      }
      else if (i >= data.points.length && ! lines.end()) {
        //there are unwanted lines in the polyline, remove the remaining
        polyline.removeDrawable(lines.item());
      }
      lines.next();
      i++;
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
   */
  unilib.mvc.ln.EdgeDrawableManagerStrategy.prototype.setupLabel_ =
    function(elem, text, relatedLine, label) {
    //create labels
    //setup label text and position
    var style = this.styleProvider_.getStyle(elem.getID(), 
        unilib.mvc.ln.StyleType.TEXT);
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
  unilib.mvc.ln.EdgeDrawableManagerStrategy.prototype.extractElement_ = 
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
  unilib.mvc.ln.EdgeDrawableManagerStrategy.prototype.getLabelContainer_ = 
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
    return label;
  };
  
  //unilib.mvc.view.DrawableManagerStrategyModule interface
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#build}
   */
  unilib.mvc.ln.EdgeDrawableManagerStrategy.prototype.build = 
    function(elem) {
    if (! this.canHandle(elem)) {
      throw new unilib.mvc.view.ViewError('Edge drawable manager ' + 
          'can not handle given element');
    }
    var data = elem.getData();
    var drawable = new unilib.graphics.CompositeDrawableShape();
    var polyline = new unilib.graphics.CompositeDrawableShape();
    polyline.setID(unilib.mvc.ln.DrawableShapeType.POLYLINE);
    var lineStart = new unilib.graphics.Line();
    var lineEnd = new unilib.graphics.Line();
    polyline.addDrawable(lineStart);
    for (var i = 2; i < data.points.length - 1; i++) {
      polyline.addDrawable(new unilib.graphics.Line());
    }
    polyline.addDrawable(lineEnd);
    this.setupPolyline_(elem, polyline);
    drawable.addDrawable(polyline);
    var text = data.text.match(/<start:(.*)><end:(.*)>/);
    textStart = (text && text[1] != undefined) ? text[1] : null;
    textEnd = (text && text[2] != undefined) ? text[2] : null;
    var labelStart = this.getLabelContainer_(drawable, textStart,
        unilib.mvc.ln.DrawableShapeType.LABEL_START);
    var labelEnd = this.getLabelContainer_(drawable, textEnd,
        unilib.mvc.ln.DrawableShapeType.LABEL_END);
    if (labelStart) {
      this.setupLabel_(elem, textStart, lineStart, labelStart);
      labelStart.setPosition(polyline.getPosition());
    }
    if (labelEnd) {
      this.setupLabel_(elem, textEnd, lineEnd, labelEnd);
      labelEnd.setPosition(polyline.getPosition());
    }
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#update}
   */
  unilib.mvc.ln.EdgeDrawableManagerStrategy.prototype.update =
    function(drawable, elem) {
    if (! this.canHandle(elem)) {
      throw new unilib.mvc.view.ViewError('Edge drawable manager ' + 
          'can not handle given element');
    }
    var data = elem.getData();
    var polyline = this.extractElement_(drawable, 
        unilib.mvc.ln.DrawableShapeType.POLYLINE);
    this.setupPolyline_(elem, polyline);
    var text = data.text.match(/<start:(.*)><end:(.*)>/);
    textStart = (text && text[1] != undefined) ? text[1] : null;
    textEnd = (text && text[2] != undefined) ? text[2] : null;
    var iter = polyline.createDrawableIterator();
    var labelStart = this.getLabelContainer_(drawable, textStart,
        unilib.mvc.ln.DrawableShapeType.LABEL_START);
    iter.begin();
    if (labelStart) this.setupLabel_(elem, textStart, iter.item(), labelStart);
    var labelEnd = this.getLabelContainer_(drawable, textEnd,
        unilib.mvc.ln.DrawableShapeType.LABEL_END);
    iter.finish();
    if (labelEnd) this.setupLabel_(elem, textEnd, iter.item(), labelEnd);
    return drawable;
  };
  
  /**
   * @see {unilib.mvc.view.DrawableManagerStrategyModule#canHandle}
   */
  unilib.mvc.ln.EdgeDrawableManagerStrategy.prototype.canHandle =
    function(elem) {
      if (elem.getID() == unilib.mvc.ln.GraphElementType.EDGE) {
        return true;
      }
      return false;
  };
  
}, ['unilib/error.js', 'unilib/mvc/view/drawable_manager.js',
    'unilib/graphics/drawable.js', 'unilib/mvc/controller/controller.js',
    'unilib/graphics/collision.js']);
unilib.notifyLoaded();