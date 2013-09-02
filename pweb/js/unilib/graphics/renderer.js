/**
 * @fileOverview graphical rendering strategy
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */


/**
 * @todo
 * [FEAT] add transformation functions to renderer, i.e. renderer::translate(rect, pos) rotate scale ...
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
		this.lineWidth = null;
		
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
		this.textSize = null;
		
		/**
		 * color of the text
		 * @type {string} RGBString
		 * @public
		 */
		this.textColor = null;
		
		/**
		 * alignment of text
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
	
	// --------------------------- GraphicEvent --------------------------------
	
	/**
	 * special event types
	 * @enum {string}
	 */
	unilib.graphics.GraphicEventType = {
			EVENT_ALL: '__all__'
	};
	
	/**
	 * key values for EventKeyMap
	 * @enum
	 */
	unilib.graphics.EventKeyType = {
			
	};
	
	/**
	 * button values for EventKeyMap
	 * @enum
	 */
	unilib.graphics.EventButtonType = {
			BUTTON_LEFT: 0, //in general, the primary button
			BUTTON_RIGHT: 2, //in general, the secondary button
			BUTTON_MIDDLE: 1 //in general, the third button
	};
	
	/**
	 * event key map, used to store pressed keys for the event
	 * @class
	 */
	unilib.graphics.EventKeyMap = function(key, button) {
		
		/**
		 * tells if Alt key is pressed
		 * @type {boolean}
		 * @public
		 */
		this.altKey = false;
		
		/**
		 * tells if Ctrl key is pressed
		 * @type {boolean}
		 * @public
		 */
		this.ctrlKey = false;
		
		/**
		 * tells if Meta key is pressed
		 * @type {boolean}
		 * @public
		 */
		this.metaKey = false;
		
		/**
		 * tells if Shift key is pressed
		 * @type {boolean}
		 * @public
		 */
		this.shiftKey = false;
		
		/**
		 * tells the key that is pressed
		 * @type {unilib.graphics.EventKeyType}
		 * @public
		 */
		this.key = key;
		
		/**
		 * tells if the key is printable or not
		 * @type {boolean}
		 * @public
		 */
		this.isKeyPrintable = true;
		
		/**
		 * tells the mouse button that is pressed
		 * @type {unilib.graphics.EventButtonType}
		 * @public
		 */
		this.buttom = button;
	};
	
	/**
	 * event object that hides implementation details of renderer and drawables
	 * @class
	 * @extends {unilib.interfaces.event.IEvent}
	 * @param {string} type event type, standard DOM event names
	 * @param {unilib.graphics.IRenderer} renderer
	 * @param {unilib.geometry.Point} position
	 * @param {unilib.graphics.EventKeyMap}
	 */
	unilib.graphics.GraphicEvent = function(type, renderer, position, keymap) {
		/**
		 * event type, same as standard DOM event types
		 * @type {string}
		 * @private
		 */
		this.type_ = type;
		
		/**
		 * target renderer
		 * @type {unilib.graphics.IRenderer}
		 * @private
		 */
		this.targetRenderer_ = renderer;
		
		/**
		 * coordinates of the event
		 * @type {unilib.geometry.Point}
		 * @public
		 */
		this.position = position;
		
		/**
		 * keys related to the event, i.e. left mouse button etc.
		 * @type {unilib.graphics.EventKeyMap}
		 * @public
		 */
		this.keys = keymap;
	};
	unilib.inherit(unilib.graphics.GraphicEvent,
			unilib.interfaces.event.IEvent.prototype);
	
	/**
	 * @see {unilib.interfaces.event.IEvent#stopPropagation}
	 */
	unilib.graphics.GraphicEvent.prototype.stopPropagation = function() {
		if (this.targetRenderer_) {
			this.targetRenderer_.stopEventPropagation();
		}
	};
	
	/**
	 * @see {unilib.interfaces.event.IEvent#getEventType}
	 */
	unilib.graphics.GraphicEvent.prototype.getEventType = function() {
			return this.type_;
	};
	
	/**
	 * @see {unilib.interfaces.event.IEvent#getTarget}
	 */
	unilib.graphics.GraphicEvent.prototype.getTarget = function() {
			return this.targetRenderer_;
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
		
		/**
		 * event listeners for events on the renderer
		 * @type {Array.<Array.<string, function(GraphicEvent)>>}
		 * @private
		 */
		this.listeners_ = [];
		
		/**
		 * handle event propagation stop requests
		 * @type {boolean}
		 * @private
		 */
		this.propagate_ = true;
		
		//set non-static positioning in order to use absolute positioning
		//in the container
		this.container_.style.position = 'relative';
		//set event handlers for the container
		this.attachEventListeners_();
	};
	unilib.inherit(unilib.graphics.HTML4Renderer, 
			unilib.interfaces.graphics.IRenderer.prototype);
	
	//helpers and internal logic
	
	/**
	 * attach event listeners to container
	 * @private
	 */
	unilib.graphics.HTML4Renderer.prototype.attachEventListeners_ = function() {
		//mouse events
		unilib.addEventListener(this.container_, 'click', this);
		unilib.addEventListener(this.container_, 'dblclick', this);
		unilib.addEventListener(this.container_, 'mousedown', this);
		unilib.addEventListener(this.container_, 'mouseup', this);
		unilib.addEventListener(this.container_, 'mousemove', this);
		unilib.addEventListener(this.container_, 'mouseover', this);
		unilib.addEventListener(this.container_, 'mouseout', this);
		//keyboard events
		unilib.addEventListener(this.container_, 'keydown', this);
		unilib.addEventListener(this.container_, 'keyup', this);
		unilib.addEventListener(this.container_, 'keypress', this);
	};
	
	/**
	 * stop propagation of the event currently handled
	 * @deprecated
	 */
	unilib.graphics.HTML4Renderer.prototype.stopPropagation = function() {
		this.propagate_ = false;
	};
	
	/**
	 * get absolute position in the page for an element
	 * @private
	 * @param {Element} element DOM element
	 * @returns {unilib.geometry.Point3D}
	 */
	unilib.graphics.HTML4Renderer.prototype.getAbsolutePosition_ = 
		function(element) {
		var position = new unilib.geometry.Point3D(0, 0, element.style.zIndex);
		do {
			position.x += element.offsetLeft;
			position.y += element.offsetTop;
			element = element.offsetParent;
		} while (element.offsetParent != null);
	};
	
	/**
	 * parse the key for an event
	 * @param {Event} event DOM Event
	 * @returns {Object.<string, boolean>}
	 */
	unilib.graphics.HTML4Renderer.prototype.parseEventKey_ = function(event) {
		var parsed = {key: null, printable: false};
			parsed.key = (event.type == 'keypress') ? 
					String.fromCharCode(event.charCode) :
						String.fromCharCode(event.keyCode);
			parsed.printable = (parsed.key.search(/\x[0-9]{1,2}/) != -1);
		return parsed;
	};
	
	/**
	 * parse event mouse button
	 * @param {Event} event DOM Event
	 * @returns {unilib.graphics.EventButtonType}
	 */
	unilib.graphics.HTML4Renderer.prototype.parseMouseButton_ = function(event) {
		/**
		 * event.button has been introduced by IE while others used event.which,
		 * then after a mess more recent browser IE9+, Gecko 1+, opera 8+, 
		 * Webkit 523+ have stick to event.button standard.
		 * See http://unixpapa.com/js/mouse.html and
		 * 	https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
		 */
		if (event.which == null) {
			//damn IE8 or less
			switch (event.button) {
				case 1:
					return unilib.graphics.EventButtonType.BUTTON_LEFT;
				case 2:
					return unilib.graphics.EventButtonType.BUTTON_RIGHT;
				case 4:
					return unilib.graphics.EventButtonType.BUTTON_MIDDLE;
			}
		}
		else {
			return event.button;
		}
		
	};
	
	/**
	 * create a graphic event from a DOM event
	 * @param {Event} event DOM event
	 * @returns {unilib.graphics.GraphicEvent}
	 */
	unilib.graphics.HTML4Renderer.prototype.createEvent = function(event) {
		var position = new unilib.geometry.Point();
		var keymap = new unilib.graphics.EventKeyMap();
		/*
		 * calculate position:
		 * i) position is relative to the renderer container.
		 * ii) working with absolute coordinates in the DOM Level 2 is not easy
		 * 	because of no standard interface has been provided to retrieve the 
		 * 	absolute position of an element in the document.
		 * iii) CSSOM Views (Draft) specification is needed for this 
		 * 	implementation, in particular for scrollTop scrollLeft offsetTop 
		 * 	offsetLeft and offsetParent		 
		 */
		var containerPos = this.getAbsolutePosition_(this.container_);
		var containerScroll = new unilib.geometry.Point(
				this.container_.scrollLeft,
				this.container_.scrollTop);
		position.x = event.clientX - containerPos.x + containerScroll.x;
		position.y = event.clientY - containerPos.y + containerScroll.y;
		/*
		 * calculate keymap
		 */
		keymap.altKey = event.altKey;
		keymap.ctrlKey = event.ctrlKey;
		keymap.shiftKey = event.shiftKey;
		keymap.metaKey = event.metaKey;
		keymap.button = event.button;
		var parsed = this.parseEventKey_(event);
		keymap.key = parsed.key;
		keymap.isKeyPrintable = parsed.printable; 
		return new unilib.graphic.GraphicEvent(event.type, this, position, keymap);
	};
	
	/**
	 * DOM EventListener Interface
	 * @param {Event} evt DOM event to be handled
	 * @todo implement correctly
	 */
	unilib.graphics.HTML4Renderer.prototype.handleEvent = function(event) {
		event = (event == undefined) ? window.event : event;
		//reinit the propagation flag
		this.propagate_ = true;
		for (var i = 0; i < this.listeners_.length && this.propagate_; i++) {
			if (this.listeners_[i][0] == event.type || 
					this.listeners_[i][0] == 
						unilib.graphics.GraphicEventType.EVENT_ALL) {
				var evt = this.createEvent_(event);
				this.listeners_[i][1](evt);
			}
		}
	};
	
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
			throw new unlib.graphics.HTML4RendererError(
					'invalid corners for drawRect');
		}
		var rect = document.createElement('div');
		rect.style.position = 'absolute';
		rect.style.zIndex = new String(this.origin_.z);
		rect.style.left = (topLeft.x + this.origin_.x) + 'px';
		rect.style.top = (topLeft.y + this.origin_.y) + 'px';
		rect.style.width = Math.abs(topLeft.x - bottomRight.x) + 'px';
		rect.style.height = Math.abs(topLeft.y - bottomRight.y) + 'px';
		rect.style.borderColor = this.style_.lineColor || '#000000';
		rect.style.borderWidth = (this.style_.lineWidth) ? 
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
	unilib.graphics.HTML4Renderer.prototype.boundingBoxOverlap_ = 
		function(topLeft, bottomRight, boxTopLeft, boxBottomRight) {
		return unilib.geometry.boundingBoxOverlap(topLeft, bottomRight, 
				boxTopLeft, boxBottomRight);
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
		line.style.position = 'absolute';
		line.style.zIndex = new String(this.origin_.z);
		//remember that start and end have same X or Y (line not oblique)
		var isVertical; //remember it to not repeat the test again
		var lineLength; //remember it to not calculate it again
		if (start.x - end.x != 0) {
			//line is horizontal
			isVertical = false;
			lineLength = Math.abs(start.x - end.x);
			line.style.width = new String(lineLength) + 'px';
			//height will be seen according to style.lineWidth that sets the 
			//border width
			line.style.height = this.style_.lineWidth + 'px';
		}
		else {
			//line is vertical
			isVertical = true;
			lineLength = Math.abs(start.y - end.y);
			line.style.height = new String(lineLength)+ 'px';
			//width will be seen according to style.lineWidth that sets the 
			//border width
			line.style.width = this.style_.lineWidth + 'px';
		}
		line.style.left = new String (this.origin_.x + start.x) + 'px';
		line.style.top = new String(this.origin_.y + start.y) + 'px';
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
	 * 	elements that occupy some space inside the rectangle that has to be
	 *  cleared.
	 * the relative origin z axis is taken as the z-index of rectangle to
	 * 	be cleared, setting origin's z to null will cause elements at all z
	 * 	to be deleted if inside the rect specified.
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
			var boxBottomRight = new unilib.geometry.Point(
					parseInt(itemStyle.width) + boxTopLeft.x,
					parseInt(itemStyle.height) + boxTopLeft.y);
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
		function(target) {
		this.clearRect(target, target);
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
	
	//events
	/**
	 * @see {unilib.interfaces.graphics.IRenderer#addEventListener}
	 */
	unilib.graphics.HTML4Renderer.prototype.addEventListener = 
		function(eventType, listener) {
			for (var i = 0; i < this.listeners_.length; i++) {
				if (this.listeners_[i][0] == eventType  && 
						this.listeners_[i][1] == listener) {
					//listener already added
					return;
				}	
			}
			//add the listener
			this.listeners_.push([eventType, listener]);
	};
	
	/**
	 * @see {unilib.interfaces.graphics.IRenderer#removeEventListener}
	 */
	unilib.graphics.HTML4Renderer.prototype.removeEventListener = 
		function(eventType, listener) {
			for (var i = 0; i < this.listeners_.length; i++) {
				if (this.listeners_[i][0] == eventType  && 
						this.listeners_[i][1] == listener) {
					//listener present
					this.listeners_.splice(i, 1);
					break;
				}	
			}
	};
	
}, ['unilib/error.js', 'unilib/interface/drawable.js', 
    'unilib/geometry/geometry.js', 'unilib/interface/iterator.js',
    'unilib/interface/event.js']);
unilib.notifyLoaded();