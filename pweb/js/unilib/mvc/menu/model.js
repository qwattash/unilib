/**
 * @fileOverview model for menu representations
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.mvc.menu
 */
unilib.provideNamespace('unilib.mvc.menu', function() {
  
  /**
   * menu types
   * @enum {string}
   */
  unilib.mvc.menu.MenuType = {
      ITEM: 'menu_item',
      MENU: 'menu_menu'
  };
  
  
  /**
   * menu element data: like metadata, size, position etc.
   * the data is interpreted differently if related to a leaf menu item
   * or a composite menu: ex. the menu text for the composite can be the
   * title, for the leaf the text in it.
   * @class
   */
  unilib.mvc.menu.BaseMenuData = function() {
    
    /**
     * menu element text
     * @type {string}
     * @public
     */
    this.text = '';
  };
  
  // ----------- Leaf Menu and generic MenuElement interface ------------------
  
  /**
   * menu interface, a menu is a composite based structure.
   * The type of the menu is decided by specific implementation code by
   * setting the menu ID attribute and generating specific drawables 
   * accordingly. A menu is observable, so that permanent menu like a palette
   * are possible.
   * @class
   * @param {?function(new:unilib.mvc.controller.BaseCommand, *)} [command]
   * @param {unilib.mvc.menu.BaseMenuData} [data]
   */
  unilib.mvc.menu.MenuElement = function(command, data) {
    
    /**
     * menu of which the item is part
     * @type {unilib.mvc.menu.Menu}
     * @protected
     */
    this.menu_ = null;
    
    /**
     * type of the menu
     * @type {(number | string)}
     * @protected
     */
    this.id_ = unilib.mvc.menu.MenuType.ITEM;
    
    /**
     * data for menu visualisation
     * @type {unilib.mvc.menu.BaseMenuData}
     * @protected
     */
    this.data_ = (data === undefined) ? 
      new unilib.mvc.menu.BaseMenuData() : data;
    
    /**
     * data for menu visualisation
     * @type {unilib.mvc.controller.BaseCommand}
     * @protected
     */
    this.command_ = (command === undefined) ? null : command;
  };
  
  /**
   * get ID
   * @returns {(number | string)}
   */
  unilib.mvc.menu.MenuElement.prototype.getID = function() {
    return this.id_;
  };
  
  /**
   * set ID
   * @param {(number | string)} id
   */
  unilib.mvc.menu.MenuElement.prototype.setID = function(id) {
    this.id_ = id;
  };
  
  /**
   * get Data related to the menu
   * @returns {unilib.mvc.menu.BaseMenuData}
   */
  unilib.mvc.menu.MenuElement.prototype.getData = function() {
    return this.data_;
  };
  
  /**
   * set Data related to the menu
   * @param {unilib.mvc.menu.BaseMenuData} data
   */
  unilib.mvc.menu.MenuElement.prototype.setData = function(data) {
    this.data_ = data;
  };
  
  /**
   * get Command related to the menu
   * @returns {unilib.mvc.controller.BaseCommand}
   */
  unilib.mvc.menu.MenuElement.prototype.getRelatedCommand = function() {
    return this.command_;
  };
  
  /**
   * set Command related to the menu
   * @param {unilib.mvc.controller.BaseCommand} cmd
   */
  unilib.mvc.menu.MenuElement.prototype.setRelatedCommand = function(cmd) {
    this.command_ = cmd;
  };
  
  /**
   * get menu of which the item is part
   * @returns {unilib.mvc.menu.Menu}
   */
  unilib.mvc.menu.MenuElement.prototype.getMenu = function() {
    return this.menu_;
  };
  
  /**
   * set the menu of which the item is part
   * @param {unilib.mvc.menu.Menu}
   */
  unilib.mvc.menu.MenuElement.prototype.setMenu = function(menu) {
    this.menu_ = menu;
  };
  
  //------------------------- Menu ----------------------------------
  
  /**
   * menu model class, aggregate menu items
   * @class
   * @extends {unilib.interfaces.observer.Observable}
   */
  unilib.mvc.menu.Menu = function() {
    unilib.interfaces.observer.Observable.call(this);
    
    /**
     * menu items
     * @type {Array.<unilib.mvc.menu.MenuElement>}
     * @private
     */
    this.menuItems_ = [];
    
    /**
     * @see {unilib.mvc.menu.MenuElement#id_}
     */
    this.id_ = unilib.mvc.menu.MenuType.MENU;
    
    /**
     * position of the context menu
     * @type {unilib.geometry.Point3D}
     * @private
     */
    this.position_ = null;
  };
  unilib.inherit(unilib.mvc.menu.Menu,
      unilib.interfaces.observer.Observable.prototype);
  
  /**
   * add menu item
   * @param {unilib.mvc.menu.MenuElement} item
   * @param {number} [position]
   */
  unilib.mvc.menu.Menu.prototype.addItem = function(item, position) {
    if (this.menuItems_.indexOf(item) == -1) {
      if (position != undefined) {
        this.menuItems_.splice(position, 0, item);
      }
      else {
        this.menuItems_.push(item);
      }
      item.setMenu(this);
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
    item.setMenu(null);
  };
  
  /**
   * traverse menu items
   * @returns {unilib.interfaces.iterator.Iterator}
   */
  unilib.mvc.menu.Menu.prototype.createItemIterator = function() {
    return new unilib.interfaces.iterator.ArrayIterator(
        unilib.copyObject(this.menuItems_));
  };
  
  /**
   * get ID
   * @returns {(number | string)}
   */
  unilib.mvc.menu.Menu.prototype.getID = function() {
    return this.id_;
  };
  
  /**
   * set ID
   * @param {(number | string)} id
   */
  unilib.mvc.menu.Menu.prototype.setID = function(id) {
    this.id_ = id;
  };
  
  /**
   * get visibility
   * @returns {?unilib.geomety.Point3D}
   */
  unilib.mvc.menu.Menu.prototype.getPosition = function() {
    return this.position_;
  };
  
  /**
   * set visibility
   * @param {?unilib.geomety.Point3D} positon
   */
  unilib.mvc.menu.Menu.prototype.setPosition = function(position) {
    var evtType;
    
    if (this.position_ == null && position) {
      this.position_ = position;
      evtType = unilib.mvc.model.ModelEventType.ADD;
    }
    else if (this.position_ != null && position) {
      this.position_ = position;
      evtType = unilib.mvc.model.ModelEventType.UPDATE;
    }
    else if (this.position_ != null && position == null) {
      this.position_ = position;
      evtType = unilib.mvc.model.ModelEventType.REMOVE;
    }
    this.notify(new unilib.mvc.model.ModelEvent(evtType, this));
  };
  
}, ['unilib/error.js', 'unilib/interface/iterator.js', 
    'unilib/geometry/geometry.js', 'unilib/mvc/model.js', 
    'unilib/interface/observer.js']);
unilib.notifyLoaded();