/**
 * @fileOverview graphics Interfaces
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace {unilib.interfaces.graphics}
 */
unilib.provideNamespace('unilib.interfaces.graphics', function() {
  
  // ------------------------ Drawable Shapes ---------------------------------
  
  /**
   * shape that can be used in the renderer (see visitor pattern)
   * @class
   * @abstract
   * @extends {unilib.interfaces.clonable.IClonable}
   */
  unilib.interfaces.graphics.IDrawable = function() {};
    unilib.inherit(unilib.interfaces.graphics.IDrawable,
      unilib.interfaces.clonable.IClonable.prototype);
  
  /**
   * drawing function (see visitor pattern)
   * @abstract
   * @param {unilib.interfaces.graphics.IRenderer} renderer
   */
  unilib.interfaces.graphics.IDrawable.prototype.draw = 
    function(renderer) {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * clearing function, deletes the drawable if it has been rendered 
   * @abstract
   * @param {unilib.interfaces.graphics.IRenderer} renderer
   */
  unilib.interfaces.graphics.IDrawable.prototype.clear = 
    function(renderer) {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * getter for id
   * @returns {number | string}
   */
  unilib.interfaces.graphics.IDrawable.prototype.getID = function() {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * setter for id to be used to identify the drawable
   * @param {string | number} id
   */
  unilib.interfaces.graphics.IDrawable.prototype.setID = 
    function(id) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * getter for the position, the z axis is used to determine the overlapping
   *   order
   * @abstract
   * @return {unilib.geometry.3DPoint}
   */
  unilib.interfaces.graphics.IDrawable.prototype.getPosition = function() {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * setter for the position, the z axis is used to determine the overlapping
   *   order
   * @abstract
   * @param {unilib.geometry.3DPoint} position
   */
  unilib.interfaces.graphics.IDrawable.prototype.setPosition = 
    function(position) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * tells whether the drawable occupy a position
   * @abstract
   * @param {unilib.geometry.Point3D} point
   * @returns {boolean}
   */
  unilib.interfaces.graphics.IDrawable.prototype.isAt = function(point) {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * set the collision mode for the drawable
   * @abstract
   * @param {unilib.collision.CollisionMode}
   */
  unilib.interfaces.graphics.IDrawable.prototype.setCollisionMode = 
    function(mode) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * set the collision mode for the drawable
   * @abstract
   * @returns {unilib.collision.CollisionMode}
   */
  unilib.interfaces.graphics.IDrawable.prototype.getCollisionMode = 
    function() {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * get the bounding box of the drawable
   * @abstract
   * @returns {unilib.collision.BoundingBox}
   */
  unilib.interfaces.graphics.IDrawable.prototype.getBoundingBox = 
    function() {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * getter for style informations element
   * @abstract
   * @return {unilib.graphics.StyleInformations}
   */
  unilib.interfaces.graphics.IDrawable.prototype.getStyleInformations = 
    function() {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * setter for style informations element
   * @abstract
   * @param {unilib.graphics.StyleInformations} style
   */
  unilib.interfaces.graphics.IDrawable.prototype.setStyleInformations = 
    function(style) {
      throw new unilib.error.AbstractMethodError();
  };
  
  //------------------------ Renderer interface -------------------------------
  /**
   * renderer interface
   * @class
   * @abstract
   */
  unilib.interfaces.graphics.IRenderer = function() {};
  
  //drawing
  /**
   * translate the origin to point
   * @abstract
   * @param {unilib.geometry.Point3D} origin
   */
  unilib.interfaces.graphics.IRenderer.prototype.setRelativeOrigin = 
    function(origin) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * reset the origin coordinates to the true ones
   * @abstract
   */
  unilib.interfaces.graphics.IRenderer.prototype.clearRelativeOrigin = 
    function() {
      throw new unilib.error.AbstractMethodError();
    };
    
  /**
   * draw a rectangle using the currently set style, add the drawing
   *   to given group
   * @abstract
   * @param {unilib.geometry.Point} topLeft
   * @param {unilib.geometry.Point} bottomRight
   * @throws {unilib.error.UnilibError}
   */
  unilib.interfaces.graphics.IRenderer.prototype.drawRect = 
    function(topLeft, bottomRight) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * draw a line using the currently set style, add the drawing
   *   to given group
   * @abstract
   * @param {unilib.geometry.Point} start
   * @param {unilib.geometry.Point} end
   * @throws {unilib.error.UnilibError}
   */
  unilib.interfaces.graphics.IRenderer.prototype.drawLine = 
    function(start, end) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * draw a triangle using the currently set style, add the drawing
   *   to given group
   * @abstract
   * @param {unilib.geometry.Point} v1 vertex1
   * @param {unilib.geometry.Point} v2 vertex2
   * @param {unilib.geometry.Point} v3 vertex3
   * @throws {unilib.error.UnilibError}
   */
  unilib.interfaces.graphics.IRenderer.prototype.drawTriangle = 
    function(v1, v2, v3) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * draw a circle using the currently set style, add the drawing
   *   to given group
   * @abstract
   * @param {unlib.geometry.Point} center
   * @param {number} radius
   * @throws {unilib.error.UnilibError}
   */
  unilib.interfaces.graphics.IRenderer.prototype.drawCircle = 
    function(center, radius) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * draw text using the currently set style, add the drawing
   *   to given group
   * @abstract
   * @param {unilib.geometry.Point} topLeft bounding rect top left corner 
   *   of the text
   * @param {unilib.geometry.Point} bottomRight bounding rect bottom right 
   *   corner of the text
   * @param {string} text
   * @throws {unilib.error.UnilibError}
   */
  unilib.interfaces.graphics.IRenderer.prototype.drawText = 
    function(topLeft, bottomRight, text) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * clear a part of the drawing space
   * @abstract
   * @param {unilib.geometry.Point} topLeft
   * @param {unilib.geometry.Point} bottomRight
   * @throws {unilib.error.UnilibError}
   */
  unilib.interfaces.graphics.IRenderer.prototype.clearRect = 
    function(topLeft, bottomRight) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * remove all elements that are at given coordinates
   * @abstract
   * @param {unilib.geometry.Point} target
   * @param {boolean} [strict=false] tells if coordinates should match exactly
   * the element's coordinates or any point in the element
   * @throws {unilib.error.UnilibError}
   */
  unilib.interfaces.graphics.IRenderer.prototype.clearElementsAt = 
    function(target, strict) {
      throw new unilib.error.AbstractMethodError();
  };
  
  //style
  /**
   * set style informations to use in the following drawings
   * @abstract
   * @param {unilib.graphics.StyleInformations} style
   */
  unilib.interfaces.graphics.IRenderer.prototype.setStyleInformations = 
    function(style) {
      throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * get style options
   * @abstract
   * @returns {unilib.graphics.StyleInformations}
   */
  unilib.interfaces.graphics.IRenderer.prototype.getStyleInformations = 
    function() {
      throw new unilib.error.AbstractMethodError();
  };
  
}, ['unilib/error.js', 'unilib/interface/clonable.js']);
unilib.notifyLoaded();