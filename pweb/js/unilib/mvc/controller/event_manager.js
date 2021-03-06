/**
 * @fileOverview strategy view that resolves HTML4 events to HTML5-like
 *  Drag and drop events
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

unilib.notifyStart('unilib/mvc/controller/event_manager.js');

/**
 * @namespace {unilib.mvc.controller}
 */
unilib.provideNamespace('unilib.mvc.controller', function() {
  
  /**
   * drag and drop events, same as HTML5 event types
   * @enum {string}
   */
  unilib.mvc.controller.DragDropEvent = {
    DRAGSTART: 'dragstart',
    DRAG: 'drag',
    DRAGENTER: 'dragenter',
    DRAGLEAVE: 'dragleave',
    DRAGOVER: 'dragover',
    DROP: 'drop',
    DRAGEND: 'dragend'
  };
  
  /**
   * button values for EventKeyMap
   * @enum {number}
   */
  unilib.mvc.controller.EventButtonType = {
      BUTTON_LEFT: 0, //in general, the primary button
      BUTTON_RIGHT: 2, //in general, the secondary button
      BUTTON_MIDDLE: 1 //in general, the third button
  };
  
  /**
   * non printable chars constants
   * @enum {string}
   */
  unilib.mvc.controller.NonPrintableKeyCode = {
    ENTER : "Enter",
    TAB : "Tab",
    ESC : "Esc",
    BACKSPACE : "Backspace",
    SHIFT : "Shift",
    CTRL : "Control",
    ALT : "Alt",
    CAPSLOCK : "CapsLock",
    NUMLOCK : "NumLock",
    LEFT : "Left",
    UP : "Up",
    RIGHT : "Right",
    DOWN : "Down",
    INS : "Insert",
    DEL : "Del",
    HOME : "Home",
    END : "End",
    PGUP : "PgUp",
    PGDOWN : "PgDown",
    F1 : "F1",
    F2 : "F2",
    F3 : "F3",
    F4 : "F4",
    F5 : "F5",
    F6 : "F6",
    F7 : "F7",
    F8 : "F8",
    F9 : "F9",
    F10 : "F10",
    F11 : "F11",
    F12 : "F12",
    ALTGR : "AltGraph"
  };
  
  /**
   * non printable chars strings
   * @enum {string}
   */
  unilib.mvc.controller.EventKeyString = {
    13 : unilib.mvc.controller.NonPrintableKeyCode.ENTER,
    9 : unilib.mvc.controller.NonPrintableKeyCode.TAB,
    27 : unilib.mvc.controller.NonPrintableKeyCode.ESC,
    8 : unilib.mvc.controller.NonPrintableKeyCode.BACKSPACE,
    16 : unilib.mvc.controller.NonPrintableKeyCode.SHIFT,
    17 : unilib.mvc.controller.NonPrintableKeyCode.CTRL,
    18 : unilib.mvc.controller.NonPrintableKeyCode.ALT,
    20 : unilib.mvc.controller.NonPrintableKeyCode.CAPSLOCK,
    144 : unilib.mvc.controller.NonPrintableKeyCode.NUMLOCK,
    37 : unilib.mvc.controller.NonPrintableKeyCode.LEFT,
    38 : unilib.mvc.controller.NonPrintableKeyCode.UP,
    39 : unilib.mvc.controller.NonPrintableKeyCode.RIGHT,
    40 : unilib.mvc.controller.NonPrintableKeyCode.DOWN,
    45 : unilib.mvc.controller.NonPrintableKeyCode.INS,
    46 : unilib.mvc.controller.NonPrintableKeyCode.DEL,
    36 : unilib.mvc.controller.NonPrintableKeyCode.HOME,
    35 : unilib.mvc.controller.NonPrintableKeyCode.END,
    33 : unilib.mvc.controller.NonPrintableKeyCode.PGUP,
    34 : unilib.mvc.controller.NonPrintableKeyCode.PGDOWN,
    112 : unilib.mvc.controller.NonPrintableKeyCode.F1,
    113 : unilib.mvc.controller.NonPrintableKeyCode.F2,
    114 : unilib.mvc.controller.NonPrintableKeyCode.F3,
    115 : unilib.mvc.controller.NonPrintableKeyCode.F4,
    116 : unilib.mvc.controller.NonPrintableKeyCode.F5,
    117 : unilib.mvc.controller.NonPrintableKeyCode.F6,
    118 : unilib.mvc.controller.NonPrintableKeyCode.F7,
    119 : unilib.mvc.controller.NonPrintableKeyCode.F8,
    120 : unilib.mvc.controller.NonPrintableKeyCode.F9,
    121 : unilib.mvc.controller.NonPrintableKeyCode.F10,
    122 : unilib.mvc.controller.NonPrintableKeyCode.F11,
    123 : unilib.mvc.controller.NonPrintableKeyCode.F12,
    225 : unilib.mvc.controller.NonPrintableKeyCode.ALTGR
  };
  /**
   * event key map, used to store pressed keys for the event
   * @class
   */
  unilib.mvc.controller.EventKeyMap = function(key, button) {
    
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
    this.button = button;
  };
  
  /**
   * event for the view to be sent to the controller
   * @class
   * @param {string} type
   * @param {Object} target
   * @param {unilib.geometry.Point3D} position
   * @param {unilib.mvc.controller.EventKeyMap} keymap
   */
  unilib.mvc.controller.ViewEvent = function(type, target, position, keymap) {
    
    /**
     * event type
     * @type {string}
     * @private
     */
    this.type_ = type;
    
    /**
     * target model eleemnt of the event
     * @type {Object}
     * @private
     */
    this.target_ = target;
    
    /**
     * coordinates of the event
     * @type {unilib.geometry.Point}
     * @public
     */
    this.position = position;
    
    /**
     * keys related to the event, i.e. left mouse button etc.
     * @type {unilib.mvc.controller.EventKeyMap}
     * @public
     */
    this.keymap = keymap;
  };
  unilib.inherit(unilib.mvc.controller.ViewEvent,
      unilib.interfaces.event.IEvent.prototype);
  
  /**
   * @see {unilib.interfaces.event.IEvent#getTarget}
   */
  unilib.mvc.controller.ViewEvent.prototype.getTarget = function() {
    return this.target_;
  };
  
  /**
   * @see {unilib.interfaces.event.IEvent#getEventType}
   */
  unilib.mvc.controller.ViewEvent.prototype.getEventType = function() {
    return this.type_;
  };
    
  // ----------------------- EventManager base class ---------------------------
  /**
   * event manager base class, receives raw (DOM) events from the renderer
   * and resolves them into a standard format
   * @class
   * @extends {unilib.interfaces.observer.Observable}
   * @abstract
   */
  unilib.mvc.controller.EventManager = function() {
    unilib.interfaces.observer.Observable.call(this);
  };
  unilib.inherit(unilib.mvc.controller.EventManager,
    unilib.interfaces.observer.Observable.prototype);
  
  /**
   * handle a DOM event
   * @abstract
   * @param {Event} evt DOM event
   */
  unilib.mvc.controller.EventManager.prototype.handleEvent = function(evt) {
    throw unilib.error.AbstractMethodError();
  };
  
  // -------------------------- HTML4-specific EventManager --------------------
  /**
   * HTML4-specific event manager supporting HTML4 events to HTML5-like
   * Drag and drop events conversion.
   * @class
   * @extends {unilib.mvc.controller.EventManager}
   * @param {Element} container HTMLElement where the elements are rendered
   * @param {unilib.mvc.view.DrawableManager} drawableManager
   * @param {unilib.interfaces.graphics.IRenderer} renderer renderer to be 
   * used to listen events
   */
  unilib.mvc.controller.HTML4EventManager = 
  function(container, drawableManager) {
    unilib.mvc.controller.EventManager.call(this);
    
    /**
     * internal state for click handling (State pattern)
     * @type {unilib.mvc.controller.HTML4EventHandlingState}
     * @private
     */
    this.handlingState_ = new unilib.mvc.controller.HTML4WaitState();
    
    /**
     * DOMElement container of all the rendered stuff
     * @type {DOMElement}
     * @protected
     */
    this.container_ = container;
    
    /**
     * drawableManager where informations about drawables and graph elements
     * are stored
     * @type {unilib.mvc.view.DrawableManager}
     * @private
     */
    this.drawableManager_ = drawableManager;
    
    this.attachEventListeners_();
  };
  unilib.inherit(unilib.mvc.controller.HTML4EventManager,
    unilib.mvc.controller.EventManager.prototype);
  
  // private helpers
  
  /**
   * attach event listeners to container
   * @private
   */
  unilib.mvc.controller.HTML4EventManager.prototype.attachEventListeners_ = 
  function() {
    //mouse events
    var cbk = unilib.createCallback(this, this.handleEvent);
    var ct = this.container_;
    this.container_ = document;
    unilib.addEventListener(this.container_, 'click', cbk);
    unilib.addEventListener(this.container_, 'dblclick', cbk);
    unilib.addEventListener(this.container_, 'mousedown', cbk);
    unilib.addEventListener(this.container_, 'mouseup', cbk);
    unilib.addEventListener(this.container_, 'mousemove', cbk);
    unilib.addEventListener(this.container_, 'mouseover', cbk);
    unilib.addEventListener(this.container_, 'mouseout', cbk);
    //keyboard events
    unilib.addEventListener(this.container_, 'keydown', cbk);
    unilib.addEventListener(this.container_, 'keyup', cbk);
    unilib.addEventListener(this.container_, 'keypress', cbk);
    unilib.addEventListener(this.container_, 'contextmenu', function(e) {
      if (e.preventDefault) {
        //FFX
        e.preventDefault();
        e.stopPropagation();
      }
      else {
        //Shitty IE8
        e.returnValue = false;
        e.cancelBubble = true;
        return false;
      }
    });
    this.container_ = ct;
    //this.container_.setAttribute('tabindex', 0);
  };
  
  /**
   * check if a key is printable ascii for keypress events
   * @param {number} key keycode
   * @returns {boolean}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.isKeyPressPrintable_ = 
  function(charCode) {
    //first check, these codes are consistent among browsers
    if (charCode >= 65 && charCode <= 90 || //upper letters
        charCode >= 97 && charCode <= 122 || //lower letters
        charCode >= 48 && charCode <= 57 || //numbers
        charCode >= 33 && charCode <= 64 || //symbols
        charCode >= 91 && charCode <= 96 || //symbols
        charCode == 32 || //space
        charCode >= 123 && charCode <= 126 //symbols
        ) { 
      return true;
    };
    return false;
  };
  
  /**
   * check if a key is printable ascii for keyup and down events
   * @param {number} key keycode
   * @returns {boolean}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.isKeyDownPrintable_ = 
  function(charCode) {
    //first check, these codes are consistent among browsers
    if (charCode >= 65 && charCode <= 90 || //upper letters
        charCode >= 97 && charCode <= 122 || //lower letters
        charCode >= 48 && charCode <= 57 || //numbers
        charCode == 32 //space
        ) { 
      return true;
    };
    return false;
  };
  
  /**
   * convert a non printable char code to standard string
   * @param {number} key keycode
   * @returns {String}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.charCodeToString_ = 
  function(charCode) {
    var str = unilib.mvc.controller.EventKeyString[charCode];
    return (str === undefined) ? "" : str;
  };
  
  /**
   * parse the key for an event
   * @see http://unixpapa.com/js/key.html
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent?
   *  redirectlocale=en-US&redirectslug=DOM%2FKeyboardEvent#Key_names
   * @see http://www.javascripter.net/faq/keycodes.htm
   * @private
   * @param {Event} event DOM Event
   * @returns {Object.<string, boolean>}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.parseEventKey_ = 
  function(event) {
    var parsed = {key: null, printable: false};
    //ASCII chars are generated only on keypress
    //newest standard support
    if (event.key) {
      parsed.key = (event.key == 'MozPrintableKey') ? 
        String.fromCharCode(event.charCode) : event.key;
      if (parsed.key.length == 1) {
        //non printable give a descriptive string
        parsed.printable = true;
      }
      else {
        //check for a couple of special cases
        switch (parsed.key) {
          case "Spacebar":
            parsed.key = " ";
            parsed.printable = true;
          break;
        }
      }
    }
    //fallback
    else {
      var vk = (event.which !== undefined) ? event.charCode : event.keyCode;
      var keycode = event.keyCode;
      var which = (event.which !== undefined) ? event.which : event.keyCode;
      if (this.parseType(event) == 'keypress') {
        
        //console.log("kp", vk, event.charCode, event.keyCode, event.key);
        if (this.isKeyPressPrintable_(which)) {
              parsed.key = String.fromCharCode(vk);
              parsed.printable = true;
        }
        else {
          //convert anything else to a string representation
          parsed.printable = false;
          if (vk == 0) {
            parsed.key = this.charCodeToString_(keycode);
          }
          else {
            parsed.key = this.charCodeToString_(which);
          }
        }
      }
      else if (this.parseType(event) == 'keydown' || this.parseType(event) == 'keyup'){
        //console.log("du", vk, event.charCode, event.keyCode, event.key);
        //filter out alphanumeric keys
        //console.log(event.type, event.which, event.charCode, event.keyCode, event.key, unilib.mvc.controller.EventKeyString[event.which]);
        if (event.charCode && event.charCode == 0) {
          //mozilla
          if (this.isKeyDownPrintable_(which)) {
              parsed.key = String.fromCharCode(vk);
              parsed.printable = true;
          }
          else {
            //convert anything else into a string representation
            parsed.printable = false;
            parsed.key = this.charCodeToString_(vk);
          }
        }
        else {
          //IE8
          if (this.isKeyDownPrintable_(vk)) {
              parsed.key = String.fromCharCode(vk);
              parsed.printable = true;
          }
          else {
            //convert anything else into a string representation
            parsed.printable = false;
            parsed.key = this.charCodeToString_(vk);
          }
        }
      }  
    }
    return parsed;
  };
  
  /**
   * prevent default action for the event
   * @param {Event} evt
   * @public
   */
  unilib.mvc.controller.HTML4EventManager.prototype.preventDefault = 
    function(evt) {
      if (evt.preventDefault) {
        //FFX
        evt.preventDefault();
      }
      else {
        //Shitty IE8
        evt.returnValue = false;
      }    
  };
  
  //public interface
  
  /**
   * set click handling state
   * @param {unilbi.mvc.controller.HTML4EventHandlingState}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.setState = 
    function(state) {
      this.handlingState_ = state;
  };
  
  /**
   * @see {unilib.mvc.controller.EventManager#handleEvent}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.handleEvent = 
  function(evt) {
    if (evt === undefined) {
      evt = window.event;
    }
    /*
    if (this.handlingState_ instanceof unilib.mvc.controller.HTML4WaitState) {
      __state = 'waitstate';
    }
    else if (this.handlingState_ instanceof unilib.mvc.controller.HTML4DelayState) {
      __state = 'delaystate';
    }
    else if (this.handlingState_ instanceof unilib.mvc.controller.HTML4DragState){
      __state = 'dragstate';
    }
    else __state = 'error';
    console.log('[d] got ' + evt.type);
    //console.log('[d] curent state: ' + __state);
    */
   this.handlingState_.handle(evt, this, this.drawableManager_);
  };
  
  /**
   * get absolute position in the page for an element, offsetTop, offsetLeft, 
   * offsetParent and getBoundingClientRects are part of the CSSOM View 
   * specification
   * @private
   * @param {Element} element DOM element
   * @returns {unilib.geometry.Point3D}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.getAbsolutePosition_ = 
  function(element) {
    var z = (isNaN(parseInt(element.style.zIndex))) ? 0 : 
      parseInt(element.style.zIndex); 
    var position = new unilib.geometry.Point3D(0, 0, z);
    /*
     * this implemententation does not take in account scrolling
     do {
      position.x += element.offsetLeft;
      position.y += element.offsetTop;
      element = element.offsetParent;
    } while (element != null);*/
    //getBoundingClient rect takes scrolling into account
    var rect = element.getBoundingClientRect();
    position.x = rect.left;
    position.y = rect.top;
    return position;
  };
  
  /**
   * parse event mouse button
   * @param {Event} event DOM Event
   * @returns {unilib.graphics.EventButtonType}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.parseMouseButton = 
  function(event) {
    /**
     * event.button has been introduced by IE while others used event.which,
     * then after a mess more recent browser IE9+, Gecko 1+, opera 8+, 
     * Webkit 523+ have adhered to event.button standard.
     * See http://unixpapa.com/js/mouse.html and
     *   https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
     */
    if (event.which == null) {
      //damn IE8 or less
      switch (event.button) {
        case 1:
          return unilib.mvc.controller.EventButtonType.BUTTON_LEFT;
        case 2:
          return unilib.mvc.controller.EventButtonType.BUTTON_RIGHT;
        case 4:
          return unilib.mvc.controller.EventButtonType.BUTTON_MIDDLE;
      }
    }
    else {
      return event.button;
    }
  };
  
  /**
   * calculate the keymap for an event
   * @param {Event} event DOM Event
   * @returns {unilib.mvc.controller.EventKeyMap}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.parseKeymap = 
  function(event) {
    var keymap = new unilib.mvc.controller.EventKeyMap();
    /*
     * calculate keymap
     */
    keymap.altKey = event.altKey;
    keymap.ctrlKey = event.ctrlKey;
    keymap.shiftKey = event.shiftKey;
    keymap.metaKey = event.metaKey;
    keymap.button = this.parseMouseButton(event);
    var parsed = this.parseEventKey_(event);
    keymap.key = parsed.key;
    keymap.isKeyPrintable = parsed.printable;
    return keymap;
  };
  
  /**
   * parse event type for a DOM event
   * @param {Event} event DOM event
   * @returns {string}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.parseType = 
  function(event) {
    var match = event.type.match(/^on([a-z]*)/);
    var type =  (match) ? match[1] : event.type;
    return type;
  };
  
  /**
   * parse position for a DOM event
   * @param {Event} event DOM event
   * @returns {unilib.geometry.Point3D}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.parsePosition = 
  function(event) {
    var position = new unilib.geometry.Point3D(null, null, null);
    /*
     * calculate position:
     * i) position is relative to the renderer container.
     * ii) working with absolute coordinates in the DOM Level 2 is not easy
     *   because of no standard interface has been provided to retrieve the 
     *   absolute position of an element in the document.
     * iii) CSSOM Views (Draft) specification is needed for this 
     *   implementation, in particular for scrollTop scrollLeft offsetTop 
     *   offsetLeft and offsetParent     
     */
    try {
      var containerPos = this.getAbsolutePosition_(this.container_);
      var containerScroll = new unilib.geometry.Point(
        this.container_.scrollLeft,
        this.container_.scrollTop);
      position.x = event.clientX - containerPos.x + containerScroll.x;
      position.y = event.clientY - containerPos.y + containerScroll.y;
      //z-axis stays null
      position.z = null;
    }
    catch (e) {
      throw new unilib.mvc.view.ViewError('sorry your browser does not' + 
        ' support the CSSOM View specification, try a newer browser.');
    }
    return position;
  };
  
  /**
   * get foreground drawable in a list
   * @param {Array.<unilib.interfaces.drawable.IDrawable>} targets
   * @returns {unilib.interfaces.drawable.IDrawable}
   */
  unilib.mvc.controller.HTML4EventManager.prototype.getForegroundTarget = 
    function(targets) {
    var foregroundTarget = null;
    var foregroundZ = null;
    for (var i = 0; i < targets.length; i++) {
      
      //if the target is a composite, z position is determined as the max z 
      //of the elements in the composite
      var maxZ = null;
      if (targets[i].getID() == 
        unilib.graphics.DrawableShapeType.SHAPE_COMPOSITE) {
        for (var j = targets[i].createDrawableIterator(); !j.end(); j.next()) {
          if (maxZ == null) {
            maxZ = j.item().getPosition().z;
          }
          else if (j.item().getPosition().z > maxZ) {
            maxZ = j.item().getPosition().z;
          }
        }
        maxZ += targets[i].getPosition().z;
      }
      else {
        maxZ = targets[i].getPosition().z;
      }
      //now check if the maxZ found is better than the foregroundZ
      if (foregroundZ < maxZ || foregroundZ == null) {
        foregroundTarget = targets[i];
        foregroundZ = maxZ;
      }
    }
    return foregroundTarget;
  };
  
  /**
   * build and dispatch a ViewEvent given a GraphicEvent
   * @protected
   * @param {string} type
   * @param {unilib.geometry.Point3D} position
   * @param {unilib.graphics.EventKeyMap} keymap
   * @param {?Object} [customTarget] particular target to skip target 
   *  resolution
   */
  unilib.mvc.controller.HTML4EventManager.prototype.fireViewEvent = 
  function(type, position, keymap, customTarget) {
    var targetElement;
    if (customTarget === undefined) {
      var drawables = this.drawableManager_.getDrawablesAt(position);
      var targetDrawable = this.getForegroundTarget(drawables);
      targetElement = 
        this.drawableManager_.getElementFromDrawable(targetDrawable);
    }
    else {
      targetElement = customTarget;
    }
    //console.log('[d] htmlEventManager: fireEvent->' + type, 'at', position.x, position.y, 'on', targetElement);
    //build a ViewEvent to be sent to the controller
    var viewEvent = new unilib.mvc.controller.ViewEvent(type, targetElement, 
      position, keymap);
    this.notify(viewEvent);
  };
  
  // -------------------- base State for HTML4 event handling ------------------
  
  /**
   * base behaviour for a state: forward event
   * @class
   */
  unilib.mvc.controller.BaseHTML4EventHandlingState = function() {};
  
  /**
   * handle an event
   * @param {Event} evt DOM event to handle
   * @param {unilib.mvc.controller.HTML4EventManager} eventManager
   * @param {unilbi.mvc.view.DrawableManager} drawableManager
   */
  unilib.mvc.controller.BaseHTML4EventHandlingState.prototype.handle = 
  function(evt, eventManager, drawableManager) {
    var position = eventManager.parsePosition(evt);
    var keymap = eventManager.parseKeymap(evt);
    var type = eventManager.parseType(evt);
    /*
     * check for special actions needed to prevent bad default
     * behaviors
     */
    if (keymap.key == unilib.mvc.controller.NonPrintableKeyCode.BACKSPACE) {
      eventManager.preventDefault(evt);
    }
    eventManager.fireViewEvent(type, position, keymap);
  };
  
  //------------------------- Click Resolution States ------------------------
  
  // ----------------------- Wait state --------------------------------------
  /**
   * starting state of click resolution. Wait for a mousedown to begin 
   * event resolution
   * @class
   * @extends {unilib.mvc.controller.HTML4EventResolutionState}
   */
  unilib.mvc.controller.HTML4WaitState = function() {};
  unilib.inherit(unilib.mvc.controller.HTML4WaitState,
    unilib.mvc.controller.BaseHTML4EventHandlingState.prototype);
  
  /**
   * @see {unilib.mvc.controller.HTML4EventResolutionState#handle}
   */
  unilib.mvc.controller.HTML4WaitState.prototype.handle = 
  function(evt, eventManager, drawableManager) {
    var type = eventManager.parseType(evt);
    if (type == 'mousedown') {
      var position = eventManager.parsePosition(evt);
      var targets = drawableManager.getDrawablesAt(position);
      var keymap = eventManager.parseKeymap(evt);
      var foregroundTarget = eventManager.getForegroundTarget(targets);
      if (keymap.button == unilib.mvc.controller.EventButtonType.BUTTON_LEFT &&
        foregroundTarget != null) {
        /*
         * if there is a tearget to the left mousedown go in delay state and 
         * resolve possible drag and drop
         */
        eventManager.setState(new unilib.mvc.controller.HTML4DelayState(
          eventManager, drawableManager, foregroundTarget, position, keymap));
      }
      else {
        //forward the event with correct target
        eventManager.fireViewEvent('mousedown', position, keymap, 
          drawableManager.getElementFromDrawable(foregroundTarget));
      }
    }
    else if (type == 'click') {
      //filter click events (there shouldn't be any but this makes sure), 
      //click events are resolved using mousedown and mouseup
      return;
    }
    else if (type == 'mouseup') {
      /**
       * if there is a mousedown != LEFT this mouseup will be called and no
       * drag and drop resolution willbe done 
       */
      var position = eventManager.parsePosition(evt);
      var keymap = eventManager.parseKeymap(evt);
      eventManager.fireViewEvent('mouseup', position, keymap);
      eventManager.fireViewEvent('click', position, keymap);
    }
    else {
      unilib.mvc.controller.BaseHTML4EventHandlingState.prototype.handle.call(
      this, evt, eventManager, drawableManager);
    }
  };
  
  //----------------------- Delay State ---------------------------------------
  /**
   * use a timerto see if a mousedown resolves to a click or to a drag 
   * operation
   * @class
   * @extends {unilib.mvc.controller.HTML4EventResolutionState}
   * @param {unilib.mvc.controller.HTML4EventManager} eventManager
   * @param {unilib.mvc.view.DrawableManager} drawableManager used to query
   *  for drawables and collisions
   * @param {unilib.interfaces.graphics.IDrawable} target drawable that 
   * generated the transition to this state
   * @param {unilib.geometry.Point} position of the mousedown event 
   * that generated the transition to delay state
   * @param {unilib.mvc.controller.EventKeyMap} keymap of the mousedown event 
   * that generated the transition to delay state
   */
  unilib.mvc.controller.HTML4DelayState = function(eventManager, 
    drawableManager, target, position, keymap) {
    /**
     * eventManager, used to change the state if the delay expires
     * @type {unilib.mvc.controller.HTML4EventManager}
     * @private
     */
    this.eventManager_ = eventManager;
    
    /**
     * drawableManager, used to retrieve informations about drawables
     * @type {unilib.mvc.view.DrawableManager}
     * @private
     */
    this.drawableManager_ = drawableManager;
    
    /**
     * target drawable that generated the transition to this state
     * @type {unilib.interfaces.graphics.IDrawable}
     * @private
     */
    this.target_ = target;
    
    /**
     * position of the mousedown event 
     * that generated the transition to delay state
     * @type {unilib.geometry.Point}
     * @private
     */
    this.position_ = position;
    
    /**
     * keymap of the mousedown event that generated 
     * the transition to delay state
     * @type {unilib.mvc.controller.EventKeyMap}
     * @private
     */
    this.keymap_ = keymap;
    
    /**
     * handle to current timer, used to stop the countdown
     * @type {*}
     * @private
     */
    this.timer_ = window.setTimeout(
      unilib.createCallback(this, this.delayExpired), 200);
  };
  unilib.inherit(unilib.mvc.controller.HTML4DelayState,
    unilib.mvc.controller.BaseHTML4EventHandlingState.prototype);
  
  /**
   * start drag operations
   * @protected
   * @param {unilib.graphics.GraphicEvent} event
   */
  unilib.mvc.controller.HTML4DelayState.prototype.startDrag_ = function() {
    this.eventManager_.setState(
      new unilib.mvc.controller.HTML4DragState(this.target_));
    var dragTarget = this.drawableManager_.getElementFromDrawable(this.target_);
    //allow setting of specific drag&drop options by the DRAGSTART handler
    this.eventManager_.fireViewEvent(
      unilib.mvc.controller.DragDropEvent.DRAGSTART, this.position_, 
      this.keymap_, dragTarget);
  };
  
  /**
   * helper callback, invoked when the delay for click detection expires
   */
  unilib.mvc.controller.HTML4DelayState.prototype.delayExpired = function() {
    this.startDrag_();
  };
    
  /**
   * @see {unilib.mvc.controller.HTML4EventResolutionState#handle}
   */
  unilib.mvc.controller.HTML4DelayState.prototype.handle = 
  function(evt, eventManager, drawableManager) {
    var type = eventManager.parseType(evt);
    var position = eventManager.parsePosition(evt);
    var targets = drawableManager.getDrawablesAt(position);
    var keymap = eventManager.parseKeymap(evt);
    if (type == 'mousemove') {
      window.clearTimeout(this.timer_);
      this.startDrag_(evt);
      /*
       * note that if there is no target the drag & drop never starts
       * so there is no need to check for targets.length == 0
       */
      var dragTarget = drawableManager.getElementFromDrawable(this.target_);
      eventManager.fireViewEvent(unilib.mvc.controller.DragDropEvent.DRAG, 
        position, keymap, dragTarget);
    }
    else if (type == 'mouseup') {
      window.clearTimeout(this.timer_);
      eventManager.setState(new unilib.mvc.controller.HTML4WaitState());
      //send mouseup, click sequence
      eventManager.fireViewEvent('mousedown', this.position_, 
        this.keymap_, drawableManager.getElementFromDrawable(this.target_));
      eventManager.fireViewEvent('mouseup', position, keymap);
      eventManager.fireViewEvent('click', position, keymap);
    }
    else if (type == 'click') {
      //filter click events, 
      //click events are resolved using mousedown and mouseup
      return;
    }
    else {
      unilib.mvc.controller.BaseHTML4EventHandlingState.prototype.handle.call(
        this, evt, eventManager, drawableManager);
    }
  };
  
  //--------------------------------- Drag state ------------------------------
  /**
   * use a timerto see if a mousedown resolves to a click or to a drag 
   * operation
   * @class
   * @extends {unilib.mvc.controller.HTML4EventResolutionState}
   * @param {unilib.interfaces.graphics.IDrawable} target drawable that 
   * generated the transition to this state
   */
  unilib.mvc.controller.HTML4DragState = function(target) {
    /**
     * target drawable that generated the transition to this state
     * @type {unilib.interfaces.graphics.IDrawable}
     * @private
     */
    this.target_ = target;
    
    /**
     * currently overlapping drawables to the one dragged
     * @type {Array.<unilib.interfaces.graphics.IDrawable>}
     * @private
     */
    this.currentlyOverlapping_ = [];
  };
  unilib.inherit(unilib.mvc.controller.HTML4DragState,
    unilib.mvc.controller.BaseHTML4EventHandlingState.prototype);
  
  /**
   * handle mousemove event
   * @private
   * @param {Event} evt DOMEvent
   * @param {unilib.mvc.controller.eventManager} eventManager
   * @param {unilib.mvc.view.DrawableManager} drawableManager
   */
  unilib.mvc.controller.HTML4DragState.prototype.handleMousemove_ = 
  function(evt, eventManager, drawableManager) {
    /*
     * note that if there is no target the drag & drop never starts
     * so there is no need to check for null target
     */
    var dragTarget = drawableManager.getElementFromDrawable(this.target_);
    var position = eventManager.parsePosition(evt);
    var keymap = eventManager.parseKeymap(evt);
    eventManager.fireViewEvent(unilib.mvc.controller.DragDropEvent.DRAG, 
      position, keymap, dragTarget);
    /*
     * detect overlapping elements
     */
    var newOverlap = drawableManager.getOverlappingDrawables(this.target_);
    /*
     * find differences with previously overlapping elements and
     * send dragover dragenter dragleave events to overlapping 
     * elements accordingly
     */
    for (var i = 0; i < this.currentlyOverlapping_.length; i++) {
      var type = (newOverlap.indexOf(this.currentlyOverlapping_[i]) == -1) ? 
        //found an element no more overlapping, send DRAGLEAVE event
        unilib.mvc.controller.DragDropEvent.DRAGLEAVE :
        //unchanged element, send DRAGOVER
        unilib.mvc.controller.DragDropEvent.DRAGOVER;
      eventManager.fireViewEvent(type, position, keymap, 
        drawableManager.getElementFromDrawable(this.currentlyOverlapping_[i]));
    }
    for (var i = 0; i < newOverlap.length; i++) {
      if (this.currentlyOverlapping_.indexOf(newOverlap[i]) == -1) {
        /*
         * found a new overlapped element, send DRAGENTER event
         */
        eventManager.fireViewEvent(
          unilib.mvc.controller.DragDropEvent.DRAGENTER, position, keymap, 
          drawableManager.getElementFromDrawable(newOverlap[i]));
      }
    }
    /*
     * update the current overlapped elements array
     */
    this.currentlyOverlapping_ = newOverlap;
  };
  
  /**
   * end dragging
   * @private
   * @param {Event} evt DOMEvent
   * @param {unilib.mvc.controller.eventManager} eventManager
   * @param {unilib.mvc.view.DrawableManager} drawableManager
   */
  unilib.mvc.controller.HTML4DragState.prototype.endDrag_ = 
    function(evt, eventManager, drawableManager) {
    eventManager.setState(new unilib.mvc.controller.HTML4WaitState());
    var position = eventManager.parsePosition(evt);
    var keymap = eventManager.parseKeymap(evt);
    var dragTarget = drawableManager.getElementFromDrawable(this.target_);
    eventManager.fireViewEvent(unilib.mvc.controller.DragDropEvent.DRAGEND, 
      position, keymap, dragTarget);
    var overlapping = drawableManager.getOverlappingDrawables(this.target_);
    if (overlapping.length > 0) {
      for (var i = 0; i < overlapping.length; i++) {
        eventManager.fireViewEvent(unilib.mvc.controller.DragDropEvent.DROP,
          position, keymap, 
          drawableManager.getElementFromDrawable(overlapping[i]));
      }
    }
  };
  
  /**
   * @see {unilib.mvc.controller.HTML4EventResolutionState#handle}
   */
  unilib.mvc.controller.HTML4DragState.prototype.handle = 
  function(evt, eventManager, drawableManager) {
    var type = eventManager.parseType(evt);
    var position = eventManager.parsePosition(evt);
    var targets = drawableManager.getDrawablesAt(position);
    var keymap = eventManager.parseKeymap(evt);
    if (type == 'mousemove') {
      this.handleMousemove_(evt, eventManager, drawableManager);
    }
    else if (type == 'mouseup') {
      this.endDrag_(evt, eventManager, drawableManager);
    }
    else if (type == 'click') {
      //filter click events, 
      //click events are resolved using mousedown and mouseup
      return;
    }
    else {
      unilib.mvc.controller.BaseHTML4EventHandlingState.prototype.handle.call(
        this, evt, eventManager, drawableManager);
    }
  };
  
}, ['unilib/interface/event.js', 'unilib/interface/observer.js']);
unilib.notifyLoaded();