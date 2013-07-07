/**
 * @fileOverview geometrical primitives
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.provideNamespace('unilib.geometry', function() {
	
	/**
	 * 2D point representation
	 * @constructor
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
	 * base shape class
	 * @constructor
	 */
	unilib.geometry.Shape = function() {
		this.points = [];
	};
	
}, []);
unilib.notifyLoaded();