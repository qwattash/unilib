/**
 * @fileOverview graphical elements and helpers
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.graphics
 */
unilib.provideNamespace('unilib.graphics', function() {
  
  /**
   * error used by drawables
   * @class
   * @extends {unilib.error.UnilibError}
   */
  unilib.graphics.DrawableError = function(message) {
    this.message = 'DrawableError > ' + message;
  };
  unilib.inherit(unilib.graphics.DrawableError,
      unilib.error.UnilibError.prototype);
  
  //-------------------------- Drawable Shapes --------------------------------
  
  /**
   * drawable shape types
   * @enum {number}
   */
  unilib.graphics.DrawableShapeType = {
      SHAPE_TEXT: 0,
      SHAPE_VOID: 1,
      SHAPE_RECT: 2,
      SHAPE_LINE: 3,
      SHAPE_COMPOSITE: 4
  };
  
  /**
   * base Drawable Shape class
   * @class
   * @abstract
   * @extends {unilib.interfaces.graphics.IDrawable}
   */
  unilib.graphics.DrawableShape = function() {
    unilib.interfaces.graphics.IDrawable.call(this);
    
    /**
     * position of the element
     * @type {unilib.geometry.Point3D}
     * @protected
     */
    this.position_ = new unilib.geometry.Point3D(0, 0, 0);
    
    /**
     * ID of the drawable shape, it is not assumed to be unique
     * @type {number | string}
     * @protected
     */
    this.id_ = null;
    
    /**
     * style informations for this drawable
     * @type {unilib.graphics.StyleInformations}
     * @protected
     */
    this.style_ = new unilib.graphics.StyleInformations();
    
    /**
     * collision detection mode to be used with this object
     * @type {unilib.collision.CollisionMode}
     * @protected
     */
    this.collisionMode_ = unilib.collision.CollisionMode.SOLID;
    
    /**
     * used to determine which drawables are selected (i.e. have the focus),
     * this might influence for example the style applied to the drawable
     * @type {boolean}
     * @protected
     */
    this.focused_ = false;
    
    /**
     * avoid duplication of drawables by remembering if a drawable is currently
     * rendered or not
     * @type {boolean}
     * @protected
     */
    this.rendered_ = false;
    
    /**
     * handle assigned to the rendered element
     * @type {number}
     * @protected
     */
    this.handle_ = null;
  };
  unilib.inherit(unilib.graphics.DrawableShape, 
      unilib.interfaces.graphics.IDrawable.prototype);
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#getID}
   */
  unilib.graphics.DrawableShape.prototype.getID = function() {
    return this.id_;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#setID}
   */
  unilib.graphics.DrawableShape.prototype.setID = 
    function(id) {
      this.id_ = id;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#getPosition}
   */
  unilib.graphics.DrawableShape.prototype.getPosition = function() {
    return this.position_;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#setPosition}
   */
  unilib.graphics.DrawableShape.prototype.setPosition = function(position) {
    this.position_ = position;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#getStyleInformations}
   */
  unilib.graphics.DrawableShape.prototype.getStyleInformations = 
    function() {
    return this.style_;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#setStyleInformations}
   */
  unilib.graphics.DrawableShape.prototype.setStyleInformations = 
    function(style) {
      this.style_ = style;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#setCollisionMode}
   */
  unilib.graphics.DrawableShape.prototype.setCollisionMode = function(mode) {
      this.collisionMode_ = mode;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#getCollisionMode}
   */
  unilib.graphics.DrawableShape.prototype.getCollisionMode = function() {
      return this.collisionMode_;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#hasFocus}
   */
  unilib.graphics.DrawableShape.prototype.hasFocus = function() {
    return this.focused_;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#setFocus}
   */
  unilib.graphics.DrawableShape.prototype.setFocus = function(focused) {
    this.focused_ = focused;
  };
  
  // ------------- Void Shape
  
  /**
   * Void Shape that does not render anything
   * @class
   * @extends {unilib.graphics.DrawableShape}
   */
  unilib.graphics.VoidShape = function() {
    unilib.graphics.DrawableShape.call(this);
    
    this.collisionMode_ = unilib.collision.CollisionMode.GHOST;
    this.setID(unilib.graphics.DrawableShapeType.SHAPE_VOID);
  };
  unilib.inherit(unilib.graphics.VoidShape, 
      unilib.graphics.DrawableShape.prototype);
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#draw}
   */
  unilib.graphics.VoidShape.prototype.draw = function(renderer) {
    return;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#clear}
   */
  unilib.graphics.VoidShape.prototype.clear = function(renderer) {
    return;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#isAt}
   */
  unilib.graphics.VoidShape.prototype.isAt = function(point) {
    return false;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#getBoundingBox}
   */
  unilib.graphics.VoidShape.prototype.getBoundingBox = function() {
    return null;
  };
  
  /**
   * @see {unilib.interfaces.clonable.IClonable#clone}
   */
  unilib.graphics.VoidShape.prototype.clone = 
    function() {
    var cloned = new unilib.graphics.VoidShape();
    unilib.cloneObject(this, cloned);
    return cloned;
  };
  
  // ------------- Line
  
  /**
   * line shape
   * @class
   * @extends {unilib.graphics.Drawable}
   * @param {unilib.geometry.Point} start
   * @param {unilib.geometry.Point} end
   * @param {unilib.geometry.Point3D} [position=Point3D(0,0)]
   */
  unilib.graphics.Line = function(start, end, position) {
    unilib.graphics.DrawableShape.call(this);
    
    if (start === undefined) start = new unilib.geometry.Point(0, 0);
    if (end === undefined) end = new unilib.geometry.Point(0, 0);
    
    /**
     * @see {unilib.graphics.DrawableShape#position_}
     */
    this.position_ = (position != undefined) ? position : this.position_;
    
    /**
     * start point of line
     * @type {unilib.geometry.Point}
     * @private
     */
    this.start_ = start;
    
    /**
     * end point of line
     * @type {unilib.geometry.Point}
     * @private
     */
    this.end_ = end;
    
    this.setID(unilib.graphics.DrawableShapeType.SHAPE_LINE);
  };
  unilib.inherit(unilib.graphics.Line, 
      unilib.graphics.DrawableShape.prototype);
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#draw}
   */
  unilib.graphics.Line.prototype.draw = function(renderer) {
    //already rendered, do nothing
    if (this.rendered_) return;
    this.rendered_ = true;
    /*
     * the style is copied in order to avoid errors when the style is
     * modified by other
     */
    renderer.setStyleInformations(unilib.copyObject(this.style_));
    renderer.setRelativeOrigin(this.position_);
    this.handle_ = renderer.drawLine(this.start_, this.end_);
    renderer.clearRelativeOrigin();
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#clear}
   */
  unilib.graphics.Line.prototype.clear = function(renderer) {
    //if not rendered do nothing
    if (! this.rendered_) return;
    this.rendered_ = false;
    renderer.setRelativeOrigin(this.position_);
    //delete in strict mode so that it is more likely to have accidental
    //deletion of other elements
    //renderer.clearElementsAt(this.start_);
    renderer.clearHandle(this.handle_);
    renderer.clearRelativeOrigin();
  };
  
  /**
   * the case of oblique line is implemented but must be considered experimental
   * and not tested, check on z axis can be disabled by setting point.z = null
   * @see {unilib.interfaces.graphics.IDrawable#isAt}
   */
  unilib.graphics.Line.prototype.isAt = function(point) {
    if (point.z && this.position_.z != point.z) {
      //if z axis does not match and point.z != null
      return false;
    }
    var bbox = this.getBoundingBox();
    //mode must be solid, otherwise no overlapping will ever be
    //detected
    bbox.mode = unilib.collision.CollisionMode.SOLID;
    var mtv = bbox.collide(new unilib.collision.BoundingBox(point, point));
    if (mtv) return true;
    return false;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#getBoundingBox}
   */
  unilib.graphics.Line.prototype.getBoundingBox = function() {
    var lowCorrection = Math.floor(this.style_.lineWidth / 2);
    var hiCorrection = Math.ceil(this.style_.lineWidth / 2);
    var tl = new unilib.geometry.Point(
      this.start_.x + this.position_.x,
      this.start_.y + this.position_.y); 
    var br = new unilib.geometry.Point(
      this.end_.x + this.position_.x,
      this.end_.y + this.position_.y);
    //check whether the tl and br needs to be changed to really form a box
    var trueTl = new unilib.geometry.Point(tl.x, tl.y);
    var trueBr = new unilib.geometry.Point(br.x, br.y);
    if (tl.x >= br.x) {
      trueTl.x = br.x;
      trueBr.x = tl.x;
    }
    if (tl.y >= br.y) {
      trueTl.y = br.y;
      trueBr.y = tl.y;
    }
    //apply rendering correction
    trueTl.x -= lowCorrection;
    trueTl.y -= lowCorrection;
    trueBr.x += hiCorrection;
    trueBr.y += hiCorrection;
    return new unilib.collision.BoundingBox(trueTl, trueBr, this.collisionMode_);
  };
  
  /**
   * @see {unilib.interfaces.clonable.IClonable#clone}
   */
  unilib.graphics.Line.prototype.clone = 
    function() {
    var clone = new unilib.graphics.Line();
    unilib.cloneObject(this, clone);
    return clone;
  };
  
  /**
   * get start point of the line
   * @returns {unilib.graphics.Point}
   */
  unilib.graphics.Line.prototype.getStart = function() {
    return this.start_;
  };
  
  /**
   * set start point of the line
   * @param {unilib.graphics.Point} point
   */
  unilib.graphics.Line.prototype.setStart = function(point) {
    this.start_ = point;
  };
  
  /**
   * get end point of the line
   * @returns {unilib.graphics.Point}
   */
  unilib.graphics.Line.prototype.getEnd = function() {
    return this.end_;
  };
  
  /**
   * set end point of the line
   * @param {unilib.graphics.Point} point
   */
  unilib.graphics.Line.prototype.setEnd = function(point) {
    this.end_ = point;
  };
  
  //------------- Rectangle
  /**
   * rectangular shape
   * @class
   * @extends {unilib.graphics.DrawableShape}
   * @param {unilib.geometry.Point} topLeft
   * @param {unilib.geometry.Point} bottomRight
   * @param {unilib.geometry.Point3D} [position=Point3D(0,0,0)]
   */
  unilib.graphics.Rectangle = function(topLeft, bottomRight, position) {
    unilib.graphics.DrawableShape.call(this);
    
    /**
     * @see {unilib.graphics.DrawableShape#position}
     */
    this.position_ = (position != undefined) ? position : this.position_;
    
    /**
     * top left corner
     * @type {unilib.geometry.Point}
     * @private
     */
    this.topLeft_ = topLeft;
    
    /**
     * bottom right corner
     * @type {unilib.geometry.Point}
     * @private
     */
    this.bottomRight_ = bottomRight;
    
    this.setID(unilib.graphics.DrawableShapeType.SHAPE_RECT);
  };
  unilib.inherit(unilib.graphics.Rectangle,
      unilib.graphics.DrawableShape.prototype);
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#draw}
   */
  unilib.graphics.Rectangle.prototype.draw = function(renderer) {
    //already rendered, do nothing
    if (this.rendered_) return;
    this.rendered_ = true;
    renderer.setRelativeOrigin(this.position_);
    renderer.setStyleInformations(unilib.cloneObject(this.style_));
    renderer.drawRect(this.topLeft_, this.bottomRight_);
    renderer.clearRelativeOrigin();
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#clear}
   */
  unilib.graphics.Rectangle.prototype.clear = function(renderer) {
    //if not rendered do nothing
    if (! this.rendered_) return;
    this.rendered_ = false;
    renderer.setRelativeOrigin(this.position_);
    //clear in strict mode to be more precise, note that two elements with the
    //same coordinates will be deleted in any case
    renderer.clearElementsAt(this.topLeft_, true);
    renderer.clearRelativeOrigin();
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#isAt}
   */
  unilib.graphics.Rectangle.prototype.isAt = function(point) {
    var isAt = false;
    if (point.z && this.position_.z != point.z) {
      //if z axis does not match and point.z != null
      isAt = false;
    }
    else {
      var bbox = this.getBoundingBox();
      bbox.mode = unilib.collision.CollisionMode.SOLID;
      var mtv = bbox.collide(
        new unilib.collision.BoundingBox(point, point));
      isAt = (mtv) ? true : false;
    }
    return isAt;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#getBoundingBox}
   */
  unilib.graphics.Rectangle.prototype.getBoundingBox = function() {
    var tl = new unilib.geometry.Point(
      this.topLeft_.x + this.position_.x,
      this.topLeft_.y + this.position_.y); 
    var br = new unilib.geometry.Point(
      this.bottomRight_.x + this.position_.x,
      this.bottomRight_.y + this.position_.y);
    return new unilib.collision.BoundingBox(tl, br, this.collisionMode_);
  };
  
  /**
   * @see {unilib.interfaces.clonable.IClonable#clone}
   */
  unilib.graphics.Rectangle.prototype.clone = 
    function() {
    var clone = new unilib.graphics.Rectangle();
    unilib.cloneObject(this, clone);
    return clone;
  };
  
  /**
   * get topLeft corner
   * @returns {unilib.graphics.Point}
   */
  unilib.graphics.Rectangle.prototype.getTopLeft = function() {
    return this.topLeft_;
  };
  
  /**
   * set topLeft corner
   * @param {unilib.graphics.Point} point
   */
  unilib.graphics.Rectangle.prototype.setTopLeft = function(point) {
    this.topLeft_ = point;
  };
  
  /**
   * get bottomRight corner
   * @returns {unilib.graphics.Point}
   */
  unilib.graphics.Rectangle.prototype.getBottomRight = function() {
    return this.bottomRight_;
  };
  
  /**
   * set bottomRight corner
   * @param {unilib.graphics.Point} point
   */
  unilib.graphics.Rectangle.prototype.setBottomRight = function(point) {
    this.bottomRight_ = point;
  };
  
  //------------ Text Shape
  /**
   * a rectangle with text in it
   * @class
   * @extends {unilib.graphics.Rectangle}
   * @param {unilib.geometry.Point} topLeft
   * @param {unilib.geometry.Point} bottomRight
   * @param {string} [text='']
   * @param {unilib.geometry.Point} [position=Point(0,0)]
   */
  unilib.graphics.TextRect = function(topLeft, bottomRight, text, position) {
    unilib.graphics.Rectangle.call(this, topLeft, bottomRight, position);
    
    /**
     * text contained in the box
     * @type {string}
     * @private
     */
    this.text_ = text || '';
    
    this.setID(unilib.graphics.DrawableShapeType.SHAPE_TEXT);
  };
  unilib.inherit(unilib.graphics.TextRect, 
      unilib.graphics.Rectangle.prototype);
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#draw}
   */
  unilib.graphics.TextRect.prototype.draw = function(renderer) {
    //already rendered, do nothing
    if (this.rendered_) return;
    this.rendered_ = true;
    renderer.setRelativeOrigin(this.position_);
    renderer.setStyleInformations(unilib.cloneObject(this.style_));
    renderer.drawText(this.topLeft_, this.bottomRight_, this.text_);
    renderer.clearRelativeOrigin();
  };
  
  /**
   * @see {unilib.interfaces.clonable.IClonable#clone}
   */
  unilib.graphics.TextRect.prototype.clone = 
    function() {
    var clone = new unilib.graphics.TextRect();
    unilib.cloneObject(this, clone);
    return clone;
  };
  
  /**
   * get text
   * @returns {string}
   */
  unilib.graphics.TextRect.prototype.getText = function() {
    return this.text_;
  };
  
  /**
   * set text
   * @param {string} point
   */
  unilib.graphics.TextRect.prototype.setText = function(text) {
    this.text_ = text;
  };
  
  //-------------- Composite Shape
  /**
   * composite DrawableShape (Composite Pattern)
   *   the container shape is manipulated using the common DrawableShape 
   *   interface
   * @class
   * @extends {unilib.graphics.DrawableShape}
   */
  unilib.graphics.CompositeDrawableShape = function() {
    unilib.graphics.DrawableShape.call(this);
    
    /**
     * contained shapes
     * @type {Array.<unilib.interfaces.graphics.IDrawable}
     * @private
     */
    this.drawables_ = [];
    
    this.setID(unilib.graphics.DrawableShapeType.SHAPE_COMPOSITE);
  };
  unilib.inherit(unilib.graphics.CompositeDrawableShape, 
      unilib.graphics.DrawableShape.prototype);
  
  // Composite Interface
  /**
   * add Drawable to the composite
   * @param {unilib.interfaces.graphics.IDrawable}
   */
  unilib.graphics.CompositeDrawableShape.prototype.addDrawable = 
    function(drawable) {
    if (this.drawables_.indexOf(drawable) == -1) {
      this.drawables_.push(drawable);
    }
  };
  
  /**
   * remove Drawable from the composite
   * @param {unilib.interfaces.graphics.IDrawable}
   */
  unilib.graphics.CompositeDrawableShape.prototype.removeDrawable = 
    function(drawable) {
    var index = this.drawables_.indexOf(drawable);
    if (index >= 0) {
      this.drawables_.splice(index, 1);
    }
  };
  
  /**
   * get iterator over contained Drawables
   * @returns {unilib.interfaces.iterator.Iterator}
   */
  unilib.graphics.CompositeDrawableShape.prototype.createDrawableIterator = 
    function() {
    return new unilib.interfaces.iterator.ArrayIterator(
        unilib.copyObject(this.drawables_));
  };
  
  // IDrawable interface
  /**
   * translate position of all contained drawables
   * @see {unilib.interfaces.graphics.IDrawable#setPosition}
   */
  unilib.graphics.CompositeDrawableShape.prototype.setPosition = 
    function(position) {
      this.position_ = position;
  };
  
  /**
   * get container position
   * @see {unilib.interfaces.graphics.IDrawable#getPosition}
   */
  unilib.graphics.CompositeDrawableShape.prototype.getPosition = function() {
    return this.position_;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#draw}
   */
  unilib.graphics.CompositeDrawableShape.prototype.draw = function(renderer) {
    //already rendered, do nothing
    if (this.rendered_) return;
    this.rendered_ = true;
    //iterate over contained drawables and draw them
    for (var i = 0; i < this.drawables_.length; i++) {
      var oldPos = this.drawables_[i].getPosition();
      var newPos = new unilib.geometry.Point3D(oldPos.x + this.position_.x,
          oldPos.y + this.position_.y, oldPos.z + this.position_.z);
      this.drawables_[i].setPosition(newPos);
      this.drawables_[i].draw(renderer);
      this.drawables_[i].setPosition(oldPos);
    }
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#clear}
   */
  unilib.graphics.CompositeDrawableShape.prototype.clear = function(renderer) {
    //if not rendered do nothing
    if (! this.rendered_) return;
    this.rendered_ = false;
    //iterate over contained drawables and clear them
    for (var i = 0; i < this.drawables_.length; i++) {
      var oldPos = this.drawables_[i].getPosition();
      var newPos = new unilib.geometry.Point3D(oldPos.x + this.position_.x,
          oldPos.y + this.position_.y, oldPos.z + this.position_.z);
      this.drawables_[i].setPosition(newPos);
      this.drawables_[i].clear(renderer);
      this.drawables_[i].setPosition(oldPos);
    } 
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#isAt}
   */
  unilib.graphics.CompositeDrawableShape.prototype.isAt = function(point) {
    var isAt = false;
    var newTarget = new unilib.geometry.Point3D();
    newTarget.x = point.x - this.position_.x;
    newTarget.y = point.y - this.position_.y;
    newTarget.z = (point.z != null) ? point.z - this.position_.z : null;
    for (var i = 0; i < this.drawables_.length; i++) {
      if (this.drawables_[i].isAt(newTarget)) {
        isAt = true;
        break;
      }
    }
    return isAt;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#getBoundingBox}
   */
  unilib.graphics.CompositeDrawableShape.prototype.getBoundingBox = 
  function() {
    if (this.drawables_.length == 0) return null;
    var aggregate = new unilib.collision.AggregateBoundingBox();
    for (var i = 0; i < this.drawables_.length; i++) {
      aggregate.boxes.push(this.drawables_[i].getBoundingBox());
    }
    return aggregate;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#getStyleInformations}
   */
  unilib.graphics.CompositeDrawableShape.prototype.getStyleInformations = 
    function() {
    return this.style_;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#setStyleInformations}
   */
  unilib.graphics.CompositeDrawableShape.prototype.setStyleInformations = 
    function(style) {
      this.style_ = style;
      for (var i = 0; i < this.drawables_.length; i++) {
        this.drawables_[i].setStyleInformations(this.style_);
      }
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#getID}
   */
  unilib.graphics.CompositeDrawableShape.prototype.getID = function() {
    return this.id_;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#setID}
   */
  unilib.graphics.CompositeDrawableShape.prototype.setID = 
    function(id) {
      this.id_ = id;
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#setCollisionMode}
   */
  unilib.graphics.CompositeDrawableShape.prototype.setCollisionMode = 
    function(mode) {
      for (var i = 0; i < this.drawables_.length; i++) {
        this.drawables_[i].setCollisionMode(mode);
      }
  };
  
  /**
   * @see {unilib.interfaces.graphics.IDrawable#getCollisionMode}
   */
  unilib.graphics.CompositeDrawableShape.prototype.getCollisionMode = 
    function() {
      for (var i = 0; i < this.drawables_.length; i++) {
        var mode = this.drawables_[i].getCollisionMode();
        if (mode == unilib.collision.CollisionMode.SOLID) {
          return unilib.collision.CollisionMode.SOLID;
        }
      }
      return unilib.collision.CollisionMode.GHOST;
  };
  
  /**
   * @see {unilib.interfaces.clonable.IClonable#clone}
   */
  unilib.graphics.CompositeDrawableShape.prototype.clone = 
    function() {
    var clone = new unilib.graphics.CompositeDrawableShape();
    unilib.cloneObject(this, clone, ['drawables_']);
    clone['drawables_'] = [];
    for (var i = 0; i < this.drawables_.length; i++) {
      clone['drawables_'][i] = this.drawables_[i].clone();
    }
    return clone;
  };
  
}, ['unilib/geometry/geometry.js', 'unilib/error.js', 
    'unilib/interface/iterator.js', 'unilib/interface/drawable.js',
    'unilib/graphics/renderer.js', 'unilib/graphics/collision.js']);
unilib.notifyLoaded();
