/**
 * @fileOverview model for menu representations
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @todo
 * [REFACTORING] Move ModelEvent from graph to generic model classes
 */

/**
 * @namespace unilib.mvc.menu
 */
unilib.provideNamespace('unilib.mvc.menu', function() {
  
  /**
   * menu element data: like metadata, size, position etc.
   * the data is interpreted differently if related to a leaf menu item
   * or a composite menu: ex. the menu text for the composite can be the
   * title, for the leaf the text in it.
   * @class
   */
  unilib.mvc.menu.BaseMenuData = function() {
    
    /**
     * position of the menu in the container, if the element
     * is a leaf the x axis is interpreted as the index of the item,
     * if the element is a composite it is interpreted as the global 
     * position of the menu
     * @type {unilib.geometry.Point3D}
     * @public
     */
    this.position = new unilib.geometry.Point3D(0, 0, 0);
    
    /**
     * menu element text
     * @type {string}
     * @public
     */
    this.text = '';
  };
  
  // ----------- Leaf Menu and generic MenuElement interface ------------------
  
  /**
   * menu interface, a menu is a composite pattern based structure.
   * The type of the menu is decided by specific implementation code by
   * setting the menu ID attribute and generating specific drawables 
   * accordingly. A menu is observable, so that permanent menu like a palette
   * are possible.
   * @class
   * @abstract
   * @extends {unilib.interfaces.observer.Observable}
   */
  unilib.mvc.menu.MenuElement = function() {
    unilib.interfaces.observer.Observer.call(this);
    
    /**
     * type of the menu
     * @type {(number | string)}
     * @private
     */
    this.id_ = null;
    
    /**
     * data for menu visualisation
     * @type {unilib.mvc.menu.BaseMenuData}
     * @private
     */
    this.data_ = new unilib.mvc.menu.BaseMenuData();
    
    /**
     * command related to the menu element
     * @type {unilib.mvc.controller.BaseCommand}
     * @private
     */
    this.command_ = null;
  };
  unilib.inherit(unilib.mvc.menu.MenuElement,
      unilib.interfaces.observer.Observer.prototype);
  
  /**
   * get ID
   * @abstract
   * @returns {(number | string)}
   */
  unilib.mvc.menu.MenuElement.prototype.getID = function() {
    return this.id_;
  };
  
  /**
   * set ID
   * @abstract
   * @param {(number | string)} id
   */
  unilib.mvc.menu.MenuElement.prototype.setID = function(id) {
    this.id_ = id;
  };
  
  /**
   * get Data related to the menu
   * @abstract
   * @returns {unilib.mvc.menu.BaseMenuData}
   */
  unilib.mvc.menu.MenuElement.prototype.getData = function() {
    return this.data_;
  };
  
  /**
   * set Data related to the menu
   * @abstract
   * @param {unilib.mvc.menu.BaseMenuData} data
   */
  unilib.mvc.menu.MenuElement.prototype.setData = function(data) {
    this.data_ = data;
  };
  
  /**
   * get Command related to the menu
   * @abstract
   * @returns {unilib.mvc.controller.BaseCommand}
   */
  unilib.mvc.menu.MenuElement.prototype.getRelatedCommand = function() {
    return this.command_;
  };
  
  /**
   * set Command related to the menu
   * @abstract
   * @param {unilib.mvc.controller.BaseCommand} cmd
   */
  unilib.mvc.menu.MenuElement.prototype.setRelatedCommand = function(cmd) {
    this.command_ = command;
  };
  
  //------------------------- Composite Menu ----------------------------------
  
  /**
   * menu model class, composite
   * @class
   * @extends {unilib.mvc.menu.MenuElement}
   */
  unilib.mvc.menu.Menu = function() {
    unilib.mvc.menu.MenuElement.call(this);
    
    /**
     * menu items
     * @type {Array.<unilib.mvc.menu.MenuElement>}
     */
    this.menuItems_ = [];
    
  };
  unilib.inherit(unilib.mvc.menu.Menu,
      unilib.mvc.menu.MenuElement.prototype);
  
  /**
   * add menu item
   * @param {unilib.mvc.menu.MenuElement} item
   */
  unilib.mvc.menu.Menu.prototype.addItem = function(item) {
    if (this.menuItems_.indexOf(item) == -1) {
      this.menuItems_.push(item);
    }
  };
  
  /**
   * remove menu item
   * @param {unilib.mvc.menu.MenuElement} item
   */
  unilib.mvc.menu.Menu.prototype.removeItem = function(item) {
    var index = this.menuItems_.indexOf(item);
    if (index != -1) {
      this.menuItems_.splice(index, 1);
    }
  };
  
  /**
   * traverse menu items
   * @returns {unilib.interfaces.iterator.Iterator}
   */
  unilib.mvc.menu.Menu.prototype.createItemIterator = function() {
    return new unilib.interfaces.iterator.ArrayIterator(
        unilib.copyObject(this.menuItems_));
  };
  
}, ['unilib/error.js', 'unilib/interface/iterator.js', 
    'unilib/geoemtry/geometry.js']);
unilib.notifyLoaded();