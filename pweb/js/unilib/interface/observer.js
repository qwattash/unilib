/**
 * @fileOverview observer pattern base implementation
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 * @version 1.0
 */

/**
 * @namespace unilib.interfaces.observer
 */
unilib.provideNamespace('unilib.interfaces.observer',  function() {
	/**
	 * base observer implementation
	 * @constructor
	 */
	unilib.interfaces.observer.Observer = function() {};

	/**
	 * notify update on the observed object
	 * @param {!unilib.interfaces.observer.observer.ObserverEvent} evt notification info
	 * @abstract
	 */
	unilib.interfaces.observer.Observer.prototype.update = function(evt) {
	  throw new unilib.error.AbstractMethodError();
	};

	/**
	 * base observable implementation
	 * @constructor
	 */
	unilib.interfaces.observer.Observable = function() {
	  /** store observers references
	   * @type {Array.<unilib.interfaces.observer.Observer>}
	   */
	  this.observers_ = [];
	};

	/**
	 * register an observer to this observable
	 * @param {!unilib.interfaces.observer.Observer} observer
	 */
	unilib.interfaces.observer.Observable.prototype.attachObserver = function(observer) {
		if (!observer) {
			throw new unilib.interfaces.observer.InvalidObserverError(this);
		}
	  if (this.observers_.indexOf(observer) == -1) {
	    this.observers_.push(observer);
	  }
	};

	/**
	 * unregister given observer form this observable
	 * @param {!unilib.interfaces.observer.Observer} observable observable to remove
	 */
	unilib.interfaces.observer.Observable.prototype.detachObserver = function(observer) {
		if (!observer) {
			throw new unilib.interfaces.observer.InvalidObserverError(this);
		}
	  var index = this.observers_.indexOf(observer);
	  if (index != -1) {
	    delete this.observers_[index];
	    this.observers_.splice(index, 1);
	  }
	};

	/**
	 * notify observers of a change
	 * @param {unilib.interfaces.event.IEvent} [evt]
	 */
	unilib.interfaces.observer.Observable.prototype.notify = function(evt) {
	  for (var i = 0; i < this.observers_.length; i++) {
	    this.observers_[i].update(evt);
	  }
	};
	
	/**
	 * exception thrown if some function finds an invalid observer
	 * @class
	 * @extends {unilib.error.UnilibError}
	 * @param {?unilib.interfaces.observer.Observable} source where 
	 * 	exception raised, null if not raised by an Observable 
	 * @param {string=} message error message
	 */
	unilib.interfaces.observer.InvalidObserverError = function(source, message) {
		this.source = source;
		this.message = message || 'Invalid observer';
	};
	unilib.inherit(unilib.interfaces.observer.InvalidObserverError, 
		unilib.error.UnilibError.prototype);

}, ['unilib/error.js', 'unilib/interface/iterator.js']);

unilib.notifyLoaded();