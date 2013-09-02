/**
 * @fileOverview geometrical primitives
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
	
	// utility function for geometric checks
	
	/**
	 * check if two bounding boxes overlap, the implementation is based on the 
	 * 	Separating Axis Theorem (SAT) but it is valid only for bounding boxes
	 * 	(rectangles) since the axis taken for projection are the cartesian 
	 * 	X and Y axes
	 * IMPORTANT: Here it is assumed that topLeft corner is at
	 * 	the left of the bottomRight corner and that the topLeft
	 * 	corner has lower Y than the bottomRight corner
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
	unilib.geometry.boundingBoxOverlap = 
		function(topLeft, bottomRight, boxTopLeft, boxBottomRight) {
		/*
		 * if the two segments overlap the sum of the two lengths is
		 * greater than the length of the union of the segments.
		 */
		var maxX = Math.max(bottomRight.x, boxBottomRight.x);
		var minX = Math.min(topLeft.x, boxTopLeft.x);
		var overlapX = (maxX - minX) <= Math.abs(topLeft.x - bottomRight.x) + 
			Math.abs(boxTopLeft.x - boxBottomRight.x);
		var maxY = Math.max(bottomRight.y, boxBottomRight.y);
		var minY = Math.min(topLeft.y, boxTopLeft.y);
		var overlapY = (maxY - minY) <= Math.abs(topLeft.y - bottomRight.y) + 
			Math.abs(boxTopLeft.y - boxBottomRight.y);
		return overlapX && overlapY;
	};
	
}, []);
unilib.notifyLoaded();