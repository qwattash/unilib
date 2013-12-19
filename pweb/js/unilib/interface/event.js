/**
 * @fileOverview unilib internal events interface
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 */

/**
 * @namespace unilib.interfaces.event
 */
unilib.provideNamespace('unilib.interfaces.event', function() {
  
  /**
   * event object that hides implementation details of the renderer
   * @class
   * @abstract
   */
  unilib.interfaces.event.IEvent = function() {};
  
  /**
   * get target object of the event
   * @abstract
   * @returns {object}
   */
  unilib.interfaces.event.IEvent.prototype.getTarget = function() {
    throw new unilib.error.AbstractMethodError();
  };
  
  /**
   * get event type, the type can be customised
   * @abstract
   * @returns {number | string}
   */
  unilib.interfaces.event.IEvent.prototype.getEventType = function() {
    throw new unilib.error.AbstractMethodError();
  };
  
}, ['unilib/error.js']);
unilib.notifyLoaded();
