/**
 * @fileOverview geometrical primitives
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */
unilib.notifyStart('unilib/graphics/collision.js');

unilib.provideNamespace('unilib.collision', function() {
  
  // -------------------------- CollisionShape --------------------------------
  
  /**
   * collision detection modes
   * @enum {number}
   */
  unilib.collision.CollisionMode = {
    SOLID: 0,
    GHOST: 1
  };
  
  /**
   * collision shape interface
   * @class
   * @abstract
   */
  unilib.collision.ICollisionShape = function() {};
  
  /**
   * collide with another shape of given feature
   * @param {unilib.collision.ICollisionShape} shape
   * @returns {?unilib.geometry.Point} minimum translation vector
   */
  unilib.collision.ICollisionShape.prototype.collide = 
  function(shape) {
    throw new unilib.error.AbstractMethodError();
  };
  
  // ------------------------------ Shapes ------------------------------------
  
  /**
   * bounding box collision shape
   * @class
   * @extends {unilib.collision.ICollisionShape}
   * @param {unilib.geometry.Point} tl top left corner
   * @param {unilib.geometry.Point} br bottom right corner
   * @param {unilib.collision.CollisionMode} [mode = 
   *  unilib.collision.CollisionMode.SOLID]
   */
  unilib.collision.BoundingBox = function(tl, br, mode) {
    unilib.collision.ICollisionShape.call(this);
    
    /**
     * corners of the bounding box
     * @type {Array.<unilib.geometry.Point}
     * @public
     */
    this.corners = [tl, br];
    
    /**
     * collision mode
     * @type {unilib.collison.CollisionMode}
     * @public
     */
    this.mode = (mode === undefined) ? unilib.collision.CollisionMode.SOLID : 
      mode;
  };
  unilib.inherit(unilib.collision.BoundingBox,
    unilib.collision.ICollisionShape.prototype);
    
  /**
   * This implementation is based on the Separating Axis Theorem (SAT) 
   * but it is valid only for bounding boxes since the axis taken for 
   * projection are the cartesian X and Y axes.
   * A collision is detected if one of the following is verified:
   * <ul>
   * <li> 
   * i) given box intersects this box
   * </li>
   * <li>
   * ii) given box contains this box
   * </li>
   * <li>
   * iii) this box contains given box
   * </li>
   * </ul>
   * @see {unilib.collision.ICollisionShape#collide}
   * @param {unilib.collision.BoundingBox} shape
   */
  unilib.collision.BoundingBox.prototype.collide = 
  function(shape) {
    if (this.mode == unilib.collision.CollisionMode.GHOST ||
      shape.mode == unilib.collision.CollisionMode.GHOST) {
      return null;
    }
    /*
     * if the shape is a composite bounding box, use its collide
     */
    if (shape.corners === undefined) {
      return shape.collide(this);
    }
    /*
     * the given shape is considered the target,
     * this shape is considered the box
     */
    var boxTopLeft = this.corners[0];
    var boxBottomRight = this.corners[1];
    var topLeft = shape.corners[0];
    var bottomRight = shape.corners[1];
    /*
     * analyse the projections of the bounding boxes
     * var minBoxProjectionX = boxTopLeft.x;
     * var maxBoxProjectionX = boxBottomRight.x;
     * var minBoxProjectionY = boxTopLeft.y;
     * var maxBoxProjectionY = boxBottomRight.y;
     * var minTargetProjectionX = topLeft.x;
     * var maxTargetProjectionX = bottomRight.x;
     * var minTargetProjectionY = topLeft.y;
     * var maxTargetProjectionY = bottomRight.y;
     */
    var overlapX = null, overlapY = null;
    var directionX, directionY; //overlap direction on the axis
    /*
     * calculate overlapping based on which quadrant the centerVector is in.
     */
    //test X overlapping
    if (bottomRight.x >= boxTopLeft.x && topLeft.x <= boxBottomRight.x) {
      //calc overlapX and overlap direction
      if ((bottomRight.x - boxTopLeft.x) <= (boxBottomRight.x - topLeft.x)) {
        overlapX = bottomRight.x - boxTopLeft.x;
        directionX = -1;
      }
      else {
        overlapX = boxBottomRight.x - topLeft.x;
        directionX = 1;
      }
    }
    //test Y overlapping
    if (bottomRight.y >= boxTopLeft.y && topLeft.y <= boxBottomRight.y) {
      //calc overlapY
      if ((bottomRight.y - boxTopLeft.y) <= (boxBottomRight.y - topLeft.y)) {
        overlapY = bottomRight.y - boxTopLeft.y;
        directionY = -1;
      }
      else {
        overlapY = boxBottomRight.y - topLeft.y;
        directionY = 1;
      }
    }
    //if no overlapping return null
    if (overlapX == null || overlapY == null) return null;
    //use minimum overlap to build an MTV (minimum translation vector)
    var mtv = new unilib.geometry.Point();
    mtv.x = (overlapX <= overlapY) ? directionX * overlapX : 0;
    mtv.y = (overlapX <= overlapY) ? 0 : directionY * overlapY;
    return mtv;
  };
  
  /**
   * set collision mode
   * @param {unilib.collision.CollisionMode} mode
   * @public
   */
  unilib.collision.BoundingBox.prototype.setMode = function(mode) {
    this.mode = mode;
  };
  
  /**
   * more complex collision shape based on bounding boxes
   * @class
   */
  unilib.collision.AggregateBoundingBox = function() {
  
    /**
     * boxes inside the shape
     * @type {Array.<unilib.collision.BoundingBox>}
     * @public
     */
    this.boxes = [];
  };
  
  /**
   * collide with another shape of given feature
   * @param {unilib.collision.BoundingBox} shape
   * @returns {?unilib.geometry.Point} minimum translation vector
   */
  unilib.collision.AggregateBoundingBox.prototype.collide = 
  function(shape) {
    var mtv = new unilib.geometry.Point(0, 0);
    var collided = false;
    for (var i = 0; i < this.boxes.length; i++) {
      var tmpv = shape.collide(this.boxes[i]);
      if (tmpv) {
        //if a translation vector is returned
        collided = true;
        mtv.x += tmpv.y;
        mtv.y += tmpv.x;
      }
    }
    return (collided) ? mtv : null;
  };
  
  /**
   * set collision mode
   * @param {unilib.collision.CollisionMode} mode
   * @public
   */
  unilib.collision.AggregateBoundingBox.prototype.setMode = function(mode) {
    for (var i = 0; i < this.boxes.length; i++) {
      this.boxes[i].setMode(mode);
    }
  };
  
}, ['unilib/geometry/geometry.js']);
unilib.notifyLoaded();
