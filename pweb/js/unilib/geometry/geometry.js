/**
 * @fileOverview geometric primitives
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.provideNamespace('unilib.geometry', function() {
  
  // graphics primitives
  
  
  /**
   * 2D point representation
   * @class
   */
  unilib.geometry.Point = function(x, y) {
    /**
     * x coordinate
     * @type {number}
     * @public
     */
    this.x = x;
    
    /**
     * y coordinate
     * @type {number}
     * @public
     */
    this.y = y;
  };
  
  /**
   * 3D point representation
   * @class
   * @extends {unilib.geometry.Point}
   */
  unilib.geometry.Point3D = function(x, y, z) {
    unilib.geometry.Point.call(this, x, y);
    
    /**
     * x coordinate
     * @type {number}
     * @public
     */
    this.z = z;
  };
  unilib.inherit(unilib.geometry.Point3D,
      unilib.geometry.Point.prototype);
  
}, ['unilib/error.js']);
unilib.notifyLoaded();