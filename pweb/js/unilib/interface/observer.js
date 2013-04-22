/**
 * @fileOverview observer pattern base implementation
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 * @version 1.0
 */

/**
 * @namespace unilib.interfaces
 */
unilib.provideNamespace('unilib.interfaces',  function() {
	/**
	 * base observer implementation
	 * @constructor
	 */
	unilib.interfaces.Observer = function() {};

	/**
	 * notify update on the observed object
	 * @param {!unilib.interfaces.ObserverEvent} evt notification info
	 */
	unilib.interfaces.Observer.prototype.update = function(evt) {
	  throw new unilib.error.NotYetImplementedError();
	};

	/**
	 * base observable implementation
	 * @constructor
	 */
	unilib.interfaces.Observable = function() {
	  /** store observers references
	   * @type {Array.<unilib.interfaces.Observer>}
	   */
	  this.observers_ = [];
	};

	/**
	 * register an observer to this observable
	 * @param {!unilib.interfaces.Observer} observer
	 */
	unilib.interfaces.Observable.prototype.attachObserver = function(observer) {
		if (!observer) {
			throw new unilib.interfaces.InvalidObserverError(this);
		}
	  if (this.observers_.indexOf(observer) == -1) {
	    this.observers_.push(observer);
	  }
	};

	/**
	 * unregister given observer form this observable
	 * @param {!unilib.interfaces.Observer} observable observable to remove
	 */
	unilib.interfaces.Observable.prototype.detachObserver = function(observer) {
		if (!observer) {
			throw new unilib.interfaces.InvalidObserverError(this);
		}
	  var index = this.observers_.indexOf(observer);
	  if (index != -1) {
	    delete this.observers_[index];
	    this.observers_.splice(index, 1);
	  }
	};

	/**
	 * notify observers of a change
	 * @param {unilib.interfaces.ObserverEvent=} evt
	 */
	unilib.interfaces.Observable.prototype.notify = function(evt) {
		if (!evt) {
			evt = new unilib.interfaces.ObserverEvent();
		}
	  for (var i = 0; i < this.observers_.length; i++) {
	    this.observers_[i].update(evt);
	  }
	};

	/**
	 * enumeration for ObserverEvent types
	 * @enum {number}
	 */
	unilib.interfaces.ObserverEventType = {
		UNKNOWN: -1,
		UPDATE: 0,
		DELETE: 1,
		CREATE: 2
	};

	/**
	 * event for communication between observable and observer
	 * @constructor
	 * @param {unilib.interfaces.ObserverEventType=} eventType type of event
	 * @param {?unilib.interfaces.Observable=} source source of the notification
	 */
	unilib.interfaces.ObserverEvent = function(eventType, source) {
		this.eventType = eventType || unilib.interfaces.ObserverEventType.UNKNOWN;
		this.source = source || null;
	};

	/**
	 * exception thrown if some function finds an invalid observer
	 * @constructor
	 * @extends {unilib.error.UnilibError}
	 * @param {?unilib.interfaces.Observable} source where exception raised, 
	 * 	null if not raised by an Observable 
	 * @param {string=} message error message
	 */
	unilib.interfaces.InvalidObserverError = function(source, message) {
		this.source = source;
		this.message = message || 'Invalid observer';
	};
	unilib.interfaces.InvalidObserverError.prototype = new unilib.error.UnilibError();
}, ['unilib/error.js']);

