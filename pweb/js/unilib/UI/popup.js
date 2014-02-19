/**
 * @author qwattash (Alfredo Mazzinghi)
 */

unilib.notifyStart("unilib/UI/popup.js");

unilib.provideNamespace('unilib.ui', function() {
  
  /**
   * button strings
   * @enum {string}
   */
  unilib.ui.PopupCode = {
    OK: 'OK',
    CANCEL: 'Cancel'
  };
  
  /**
   * make a given container a popup
   * @param {DOMElement} container
   * @param {string} buttonClass CSS class touse for the buttons
   * @class
   */
  unilib.ui.Popup = function(container, buttonClass) {
    
    /**
     * container to be used
     * @type {DOMElement}
     * @protected
     */
    this.container_ = container;
    
    /**
     * CSS class for the buttons
     * @type {string}
     * @protected
     */
    this.buttonClass_ = buttonClass;
    
    /**
     * button container inside the main container
     * @type {DOMElement}
     * @protected
     */
    this.buttonContainer_ = document.createElement("div");
    this.container_.appendChild(this.buttonContainer_);
    
    /**
     * event listeners
     * @type {Object.<unilib.ui.PopupCode, Array.<function>>}
     */
    this.listeners_ = {};
    
    this.createButtons_();
    this.setupContainer_();
  };
  
  /**
   * init buttons and actions for the popup
   * @private
   */
  unilib.ui.Popup.prototype.createButtons_ = function() {
    var ok = document.createElement("div");
    ok.setAttribute("class", this.buttonClass_);
    var text = document.createTextNode("OK");
    ok.appendChild(text);
    unilib.addEventListener(ok, "click", 
      unilib.createCallback(this, this.hide, [unilib.ui.PopupCode.OK]));
    this.buttonContainer_.appendChild(ok);
  };
  
  /**
   * append container to the DOM
   * @private
   */
  unilib.ui.Popup.prototype.setupContainer_ = function() {
    this.container_.style.visibility = "hidden";
    if (! this.container_.parentNode) {
      document.appendChild(this.container_);
    }
  };
  
  /**
   * show the popup
   */
  unilib.ui.Popup.prototype.show = function() {
    this.container_.style.visibility = "visible";
  };
  
  /**
   * hide popup
   * @param {unilib.ui.PopupCode} [code]
   */
  unilib.ui.Popup.prototype.hide = function(code) {
    this.container_.style.visibility = "hidden";
    if (code) {
      var cbkList = this.listeners_[code];
      if (cbkList) {
        for (var i = 0; i < cbkList.length; i++) {
          cbkList[i]();
        }
      }
    }
  };
  
  /**
   * bind the show event to an event on another element
   * @param {string} evt type
   * @param {DOMElement} target
   */
  unilib.ui.Popup.prototype.bind = function(evt, target) {
    unilib.addEventListener(target, evt, 
      unilib.createCallback(this, this.show));
  };
  
  unilib.ui.Popup.prototype.addEventListener = function(evt, listener) {
    if (! this.listeners_[evt]) {
      this.listeners_[evt] = [];
    }
    this.listeners_[evt].push(listener);
  };
  
  /**
   * make a given container a popup
   * @param {DOMElement} container
   * @param {string} buttonClass CSS class touse for the buttons
   * @class
   * @extends {unilib.ui.Popup}
   */
  unilib.ui.PromptPopup = function(container, buttonClass) {
    unilib.ui.Popup.call(this, container, buttonClass);
  };
  unilib.inherit(unilib.ui.PromptPopup,
    unilib.ui.Popup.prototype);
  
  /**
   * init buttons and actions for the popup
   * @private
   */
  unilib.ui.PromptPopup.prototype.createButtons_ = function() {
    unilib.ui.Popup.prototype.createButtons_.call(this);
    var cancel = document.createElement("div");
    cancel.setAttribute("class", this.buttonClass_);
    var text = document.createTextNode("Cancel");
    cancel.appendChild(text);
    unilib.addEventListener(cancel, "click", 
      unilib.createCallback(this, this.hide, [unilib.ui.PopupCode.CANCEL]));
    this.buttonContainer_.appendChild(cancel);
  };  
    
}, ['unilib/error.js']);

unilib.notifyLoaded();
