/**
 * @fileOverview graphical rendering strategy
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @todo
 * [REFACTORING] to avoid any type of accidental deletion of an element
 *  drawing functions should return an unique handle to the element displayed
 *  the handle could be used to access the element for any kind of updates
 *  and transformations but further extension would change the renderer's 
 *  interface
 */

/**
 * @namespace unilib.graphics
 */
unilib.provideNamespace('unilib.graphics', function() {
  
  /**
   * @enum {number}
   */
  unilib.graphics.LineStyle = {
      LINE_DASHED: 0,
      LINE_SOLID: 1
  };
  
  // ------------------------- Generic helper classes -------------------------
  
  /**
   * class that holds allowed style informations to be supported by renderers
   * @class
   */
  unilib.graphics.StyleInformations = function() {
    /**
     * background style may be null meaning no background.
     * @type {?string} RGBString
     * @public
     */
    this.backgroundColor = null;
    
    /**
     * background image, may be null meaning no image
     * @type {?string} URI
     * @public
     */
    this.backgroundImage = null;
    
    /**
     * background repeat property
     * @type {boolean}
     * @public
     */
    this.backgroundRepeat = false;
    
    /**
     * line style (i.e. dotted)
     * @type {unilib.graphics.LineStyle}
     * @public
     */
    this.lineStyle = null;
    
    /**
     * width (in pixels) of any line
     * @type {number}
     * @public
     */
    this.lineWidth = 0;
    
    /**
     * color of  the lines
     * @type {string} RGBString
     * @public
     */
    this.lineColor = null;
    
    /**
     * font to use
     * @type {string}
     * @public
     */
    this.textFont = null;
    
    /**
     * size (in pixels) of the text
     * @type {number}
     * @public
     */
    this.textSize = 0;
    
    /**
     * color of the text, same as DOM
     * @type {string} RGBString
     * @public
     */
    this.textColor = null;
    
    /**
     * alignment of text, same values ad DOM
     * @type {string}
     * @public
     */
    this.textAlign = null;
  };
  
  //-------------- HTML4 Renderer utilities and helpers -----------------------
  
  /**
   * custom error for HTML4Renderer
   * @class
   * @extends {unilib.error.UnilibError}
   * @param {string} message
   */
  unilib.graphics.HTML4RendererError = function(message) {
    unilib.error.UnilibError.call(this, 'HTML4RendererError>' + message);
  };
  unilib.inherit(unilib.graphics.HTML4RendererError,
      unilib.error.UnilibError.prototype);
  
  // --------------------------- RGB color vector -----------------------------
  
  /**
   * representation of RGB vector
   * @class
   */
  unilib.graphics.RGBVector = function(initString) {
    
    /**
     * channel R
     * @type {number}
     * @public
     */
    this.R = 0;
    
    /**
     * channel G
     * @type {number}
     * @public
     */
    this.G = 0;
    
    /**
     * channel B
     * @type {number}
     * @public
     */
    this.B = 0;
    
    this.parse(initString);
  };
  
  /**
   * convert vector to a CSS2 hex string containing only RGB channels
   * @returns {string} CSS RGB hex representation
   */
  unilib.graphics.RGBVector.prototype.toHexString = function() {
    var str = '#';
    str += (this.R != 0) ? this.R.toString(16).toUpperCase() : '00';
    str += (this.G != 0) ? this.G.toString(16).toUpperCase() : '00';
    str += (this.B != 0) ? this.B.toString(16).toUpperCase() : '00';
    return str;
  };
  
  /**
   * return an array representation of the vector
   * @returns {Array.<number>}
   */
  unilib.graphics.RGBVector.prototype.toArray = function() {
    return [this.R, this.G, this.B];
  };
  
  /**
   * parse a representation into the vector
   * @param {string} value in the form of rgb(RR, GG, BB) or #RRGGBB
   */
  unilib.graphics.RGBVector.prototype.parse = function(value) {
    if (value == '') {
      return;
    }
    re = /rgb\(([0-9]{1,3}), ?([0-9]{1,3}), ?([0-9]{1,3})\)/;
    var match = value.match(re);
    if (value.charAt(0) == '#') {
      this.R = parseInt(value.substr(1,2), 16);
      this.G = parseInt(value.substr(3,2), 16);
      this.B = parseInt(value.substr(5,2), 16);
    }
    else if (match){
      this.R = parseInt(match[1], 10);
      this.G = parseInt(match[2], 10);
      this.B = parseInt(match[3], 10);
    }
    else {
      throw new unilib.error.UnilibError('Unsupported format RGB string ' + 
          value);
    }
  };
  
  // --------------------------- renderer -------------------------------------
  /**
   * renderer that uses html4 elements to render the shapes
   * @class
   * @extends {unilib.interfaces.graphics.IRenderer}
   * @param {DOMElement} HTMLContainer
   * @param {HTML4StyleManager} styleManager
   */
  unilib.graphics.HTML4Renderer = function(HTMLContainer) {
    
    /**
     * DOMElement container of all the rendered stuff
     * @type {DOMElement}
     * @private
     */
    this.container_ = HTMLContainer;
    
    /**
     * origin translation
     * @type {unilib.geometry.Point}
     * @private
     */
    this.origin_ = new unilib.geometry.Point3D(0, 0, 0);
    
    /**
     * current style
     * @type {unilib.graphics.StyleInformations}
     * @private
     */
    this.style_ = new unilib.graphics.StyleInformations();
    
    //set non-static positioning in order to use absolute positioning
    //in the container
    this.container_.style.position = 'relative';
  };
  unilib.inherit(unilib.graphics.HTML4Renderer, 
      unilib.interfaces.graphics.IRenderer.prototype);
  
  //helpers and internal logic
  
  /**
   * setup a standard rectangle
   * @param {unilib.geometry.Point} topLeft top left corner
   * @param {unilib.geometry.Point} bottomRight bottom right corner
   * @returns {DOMElement}
   * @throws {unlib.graphics.HTML4RendererError}
   * @private
   */
  unilib.graphics.HTML4Renderer.prototype.createRect_ = 
    function(topLeft, bottomRight) {
    //check that corners are valid
    if (topLeft.x > bottomRight.x || topLeft.y > bottomRight.y) {
      throw new unilib.graphics.HTML4RendererError(
          'invalid corners for drawRect');
    }
    var rect = document.createElement('div');
    rect.style.position = 'absolute';
    rect.style.zIndex = new String(this.origin_.z);
    rect.style.left = (topLeft.x + this.origin_.x) + 'px';
    rect.style.top = (topLeft.y + this.origin_.y) + 'px';
    rect.style.width = (Math.abs(topLeft.x - bottomRight.x) - 
        2 * this.style_.lineWidth) + 'px';
    rect.style.height = (Math.abs(topLeft.y - bottomRight.y) -
        2 * this.style_.lineWidth) + 'px';
    rect.style.borderColor = this.style_.lineColor || '#000000';
    rect.style.borderWidth = (this.style_.lineWidth !== null) ? 
        this.style_.lineWidth + 'px' : '1px';
    rect.style.borderStyle = 
      (this.style_.lineStyle == unilib.graphics.LineStyle.LINE_DASHED) ? 
      'dashed' : 'solid';
    rect.style.backgroundColor = this.style_.backgroundColor || '#FFFFFF';
    rect.style.backgroundImage = this.style_.backgroundImage || '';
    rect.style.backgroundRepeat = (this.style_.backgroundRepeat) ? '' : 
      'no-repeat';
    rect.style.color = this.style_.textColor || '#000000';
    rect.style.fontSize = (this.style_.textSize) ? 
        this.style_.textSize + 'px' : '';
    rect.style.fontFamily = this.style_.textFont || '';
    rect.style.textAlign = this.style_.textAlign || 'left';
    rect.style.overflow = 'hidden';
    return rect;
  };
  
  /**
   * check if two bounding boxes overlap
   * IMPORTANT: Here it is assumed that topLeft corner is at
   *   the left of the bottomRight corner and that the topLeft
   *   corner has lower Y than the bottomRight corner
   * A rectangular element is considered to be overlapping the box 
   * given if: 
   * i) the box intersects the element or
   * ii) the element is contained by the box or
   * iii) the element contains the box
   * @param {unilib.geometry.Point} topLeft top left area corner
   * @param {unilib.geometry.Point} bottomRight bottom right area corner
   * @param {unilib.geometry.Point} topLeft top left box corner
   * @param {unilib.geometry.Point} bottomRight bottom right box corner 
   * @returns {boolean}
   * @private
   */
  unilib.graphics.HTML4Renderer.prototype.boundingBoxOverlap_ = 
    function(topLeft, bottomRight, boxTopLeft, boxBottomRight) {
    var box1 = new unilib.collision.BoundingBox(topLeft, bottomRight);
    var box2 = new unilib.collision.BoundingBox(boxTopLeft, boxBottomRight);
    return (box1.collide(box2) != null);
  };
  
  //drawing
  /**
   * @see {unilib.interfaces.graphics.IRenderer#setRelativeOrigin}
   */
  unilib.graphics.HTML4Renderer.prototype.setRelativeOrigin = 
    function(origin) {
      this.origin_ = origin;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IRenderer#clearRelativeOrigin}
   */
  unilib.graphics.HTML4Renderer.prototype.clearRelativeOrigin = 
    function() {
      this.origin_ = new unilib.geometry.Point3D(0, 0, 0);
    };
    
  /**
   * @see {unilib.interfaces.graphics.IRenderer#drawRect}
   */
  unilib.graphics.HTML4Renderer.prototype.drawRect = 
    function(topLeft, bottomRight) {
    var rect = this.createRect_(topLeft, bottomRight);
    this.container_.appendChild(rect);
  };
  
  /**
   * drawing of the line is simulated with a div (or span) lengthened
   * according to start and end and StyleInformations.
   * Oblique lines are not supported for CSS2 which does not allow rotations
   * @see {unilib.interfaces.graphics.IRenderer#drawLine}
   */
  unilib.graphics.HTML4Renderer.prototype.drawLine = 
    function(start, end) {
    if (start.x != end.x && start.y != end.y) {
      throw new unilib.graphics.HTML4RendererError('oblique lines ' + 
          'are not supported');
    }
    var line = document.createElement('div');
    /* 
     * 50% of lineWidth is used to have a reduced error margin 
     * respect to the theoretical line (that have no lineWidth).
     * This is used also to correct corners joints.
     * Math.floor is used instead of Math.round because it reduces
     * the error in the rendering of the line 
     * (this has been verified experimentally).
     */
    var correctionFactor = Math.floor(this.style_.lineWidth / 2);
    line.style.position = 'absolute';
    line.style.zIndex = new String(this.origin_.z);
    //remember that start and end have same X or Y (line not oblique)
    var isVertical; //remember it to not repeat the test again
    var lineLength; //remember it to not calculate it again
    if (start.x - end.x != 0) {
      //line is horizontal
      isVertical = false;
      lineLength = Math.abs(start.x - end.x);
      line.style.width = (lineLength + 2 * correctionFactor) + 'px';
      //height will be seen according to style.lineWidth that sets the 
      //border width
      line.style.height = this.style_.lineWidth + 'px';
      /*
       * left is taken relative to the leftmost point, otherwise the
       * width attribute (that is always positive) will make the line
       * appear on the wrong side (mirrored relative to start).
       * 
       */
      line.style.left = (this.origin_.x + Math.min(start.x, end.x) -
          correctionFactor) + 'px';
      /*
       * same as above for the top property.
       * In addition top is subtracted of an extra 50% of lineWidth to have
       * a reduced error margin with the theoretical line.
       */
      line.style.top = (this.origin_.y + Math.min(start.y, end.y) -
          correctionFactor) + 'px';
    }
    else {
      //line is vertical
      isVertical = true;
      lineLength = Math.abs(start.y - end.y);
      line.style.height = (lineLength + 2 * correctionFactor) + 'px';
      //width will be seen according to style.lineWidth that sets the 
      //border width
      line.style.width = this.style_.lineWidth + 'px';
      /*
       * left is taken relative to the leftmost point, otherwise the
       * width attribute (that is always positive) will make the line
       * appear on the wrong side (mirrored relative to start).
       * In addition left is subtracted of an extra 50% of lineWidth to have
       * a reduced error margin with the theoretical line.
       */
      line.style.left = (this.origin_.x + Math.min(start.x, end.x) - 
          correctionFactor) + 'px';
      /*
       * same as above for the top property
       */
      line.style.top = (this.origin_.y + Math.min(start.y, end.y) - 
          correctionFactor) + 'px';
    }
    if (this.style_.lineStyle == unilib.graphics.LineStyle.LINE_DASHED) {
      /*
       * if the line is dashed
       * use the line as main container and create a number of segments,
       * main container has no background and dashes have the selected color
       * a dash is 5% of the total length and not less than 1px
       */
      var dashLength = Math.max(Math.round((lineLength * 5) / 100), 1);
      var dashNum = Math.floor(lineLength / dashLength);
      var error = lineLength - (dashNum * dashLength);
      for (var i = 0; i < dashNum; i++) {
        var dash = document.createElement('span');
        dash.style.display = 'inline-block';
        if (i == (dashNum - 1)) {
          /*
           * last dash occupy the remaining length in order to avoid
           * rounding errors
           */ 
          dashLength += error; 
        }
        if (isVertical) {
          dash.style.height = dashLength + 'px';
          dash.style.width = this.style_.lineWidth + 'px';
        }
        else {
          dash.style.width = dashLength + 'px';
          dash.style.height = this.style_.lineWidth + 'px';
        }
        if (i % 2) {
          dash.style.backgroundColor = this.style_.lineColor || '#000000';
        }
        else {
          dash.style.backgroundColor = this.style_.backgroundColor || '#000000';
        }
        line.appendChild(dash);
      }
    }
    else {
      /* if line is not dashed (or something else not supported)
       * if (this.style_.lineStyle == unilib.graphics.LineStyle.LINE_SOLID)
       */
      line.style.backgroundColor = this.style_.lineColor || '#000000';
    }
    this.container_.appendChild(line);
  };
  
  /**
   * (not implemented)
   * @see {unilib.interfaces.graphics.IRenderer#drawTriangle}
   */
  unilib.graphics.HTML4Renderer.prototype.drawTriangle = 
    function(v1, v2, v3) {
      throw new unilib.error.NotYetImplementedError();
  };
  
  /**
   * (not implemented)
   * @see {unilib.interfaces.graphics.IRenderer#drawCircle}
   */
  unilib.graphics.HTML4Renderer.prototype.drawCircle = 
    function(center, radius) {
      throw new unilib.error.NotYetImplementedError();
  };
  
  /**
   * @see {unilib.interfaces.graphics.IRenderer#drawText}
   */
  unilib.graphics.HTML4Renderer.prototype.drawText = 
    function(topLeft, bottomRight, text) {
    var rect = this.createRect_(topLeft, bottomRight);
    var txt = document.createTextNode(text);
    rect.appendChild(txt);
    this.container_.appendChild(rect);
  };
  
  
  
  /**
   * NOTE that due to implementation complexity clearRect removes all
   *   elements that occupy some space inside the rectangle that has to be
   *  cleared.
   * the relative origin z axis is taken as the z-index of rectangle to
   *   be cleared, setting origin's z to null will cause elements at all z
   *   to be deleted if inside the rect specified.
   * @see {unilib.interfaces.graphics.IRenderer#clearRect}
   */
  unilib.graphics.HTML4Renderer.prototype.clearRect = 
    function(topLeft, bottomRight) {
    topLeft = new unilib.geometry.Point(topLeft.x, topLeft.y);
    bottomRight = new unilib.geometry.Point(bottomRight.x, bottomRight.y);
    topLeft.x += this.origin_.x;
    topLeft.y += this.origin_.y;
    bottomRight.x += this.origin_.x;
    bottomRight.y += this.origin_.y;
    for (var i = 0; i < this.container_.childNodes.length; i++) {
      var itemStyle = this.container_.childNodes[i].style;
      var boxTopLeft = new unilib.geometry.Point(
          parseInt(itemStyle.left), 
          parseInt(itemStyle.top));
      var realWidth = parseInt(itemStyle.width);
      var realHeight = parseInt(itemStyle.height);
      if (! isNaN(parseInt(itemStyle.borderWidth))) {
        realWidth += 2 * parseInt(itemStyle.borderWidth);
        realHeight += 2 * parseInt(itemStyle.borderWidth);
      }
      var boxBottomRight = new unilib.geometry.Point(
          realWidth + boxTopLeft.x,
          realHeight + boxTopLeft.y);
      /*
       * check for overlapping:
       */
      if (this.boundingBoxOverlap_(topLeft, bottomRight, 
          boxTopLeft, boxBottomRight)) {
        //delete the element if z-index match
        if (this.origin_.z == null || 
            this.origin_.z == parseInt(itemStyle.zIndex)) {
          this.container_.removeChild(this.container_.childNodes[i]);
          /* bring back the counter so next iteration will not
           * skip a position
           */
          i--;
        }
      }
    }
  };
  
  /**
   * @see {unilib.graphics.HTML4Renderer}
   * @see {unilib.interfaces.graphics.IRenderer#clearElementsAt}
   */
  unilib.graphics.HTML4Renderer.prototype.clearElementsAt = 
    function(target, strict) {
    if(strict) {
      //copy point to avoid to modify target reference passed
      target = new unilib.geometry.Point(target.x, target.y);
      target.x += this.origin_.x;
      target.y += this.origin_.y;
      for (var i = 0; i < this.container_.childNodes.length; i++) {
        var itemStyle = this.container_.childNodes[i].style;
        var boxTopLeft = new unilib.geometry.Point(
          parseInt(itemStyle.left), 
          parseInt(itemStyle.top));
        //check for overlapping:
        if (boxTopLeft.x == target.x && boxTopLeft.y == target.y) {
          //delete the element if z-index match
          if (this.origin_.z == null || 
              this.origin_.z == parseInt(itemStyle.zIndex)) {
            this.container_.removeChild(this.container_.childNodes[i]);
            /* bring back the counter so next iteration will not
             * skip a position
             */
            i--;
          }
        }
      }
    }
    else {
      this.clearRect(target, target);  
    }
  };
  
  //style
  /**
   * @see {unilib.interfaces.graphics.IRenderer#setStyleInformations}
   */
  unilib.graphics.HTML4Renderer.prototype.setStyleInformations = 
    function(style) {
      this.style_ = style;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IRenderer#getStyleInformations}
   */
  unilib.graphics.HTML4Renderer.prototype.getStyleInformations = 
    function() {
      return this.style_;
  };
  
}, ['unilib/error.js', 'unilib/interface/drawable.js', 
    'unilib/geometry/geometry.js', 'unilib/interface/iterator.js',
    'unilib/interface/event.js', 'unilib/graphics/collision.js']);
unilib.notifyLoaded();