/**
 * @fileOverview observer pattern base implementation
 * @author qwattash (Alfredo Mazzinghi)
 * @license GPL
 * @version 1.0
 */

unilib.provideNamespace('unilib.mvc',  function() {
	/**
	 * base observer implementation
	 * @constructor
	 */
	unilib.mvc.Observer = function() {};

	/**
	 * notify update on the observed object
	 * @param {!unilib.mvc.ObserverEvent} evt notification info
	 */
	unilib.mvc.Observer.prototype.update = function(evt) {
	  throw new unilib.error.NotYetImplementedError();
	};

	/**
	 * base observable implementation
	 * @constructor
	 */
	unilib.mvc.Observable = function() {
	  /** store observers references
	   * @type {Array.<unilib.mvc.Observer>}
	   */
	  this.observers_ = [];
	};

	/**
	 * register an observer to this observable
	 * @param {!unilib.mvc.Observer} observer
	 */
	unilib.mvc.Observable.prototype.attachObserver = function(observer) {
		if (!observer) {
			throw new unilib.mvc.InvalidObserverError(this);
		}
	  if (this.observers_.indexOf(observer) == -1) {
	    this.observers_.push(observer);
	  }
	};

	/**
	 * unregister given observer form this observable
	 * @param {!unilib.mvc.Observer} observable observable to remove
	 */
	unilib.mvc.Observable.prototype.detachObserver = function(observer) {
		if (!observer) {
			throw new unilib.mvc.InvalidObserverError(this);
		}
	  var index = this.observers_.indexOf(observer);
	  if (index != -1) {
	    delete this.observers_[index];
	    this.observers_.splice(index, 1);
	  }
	};

	/**
	 * notify observers of a change
	 * @param {unilib.mvc.ObserverEvent=} evt
	 */
	unilib.mvc.Observable.prototype.notify = function(evt) {
		if (!evt) {
			evt = new unilib.mvc.ObserverEvent();
		}
	  for (var i = 0; i < this.observers_.length; i++) {
	    this.observers_[i].update(evt);
	  }
	};

	/**
	 * enumeration for ObserverEvent types
	 * @enum {number}
	 */
	unilib.mvc.ObserverEventType = {
		UNKNOWN: -1,
		UPDATE: 0,
		DELETE: 1,
		CREATE: 2
	};

	/**
	 * event for communication between observable and observer
	 * @constructor
	 * @param {unilib.mvc.ObserverEventType=} eventType type of event
	 * @param {?unilib.mvc.Observable=} source source of the notification
	 */
	unilib.mvc.ObserverEvent = function(eventType, source) {
		this.eventType = eventType || unilib.mvc.ObserverEventType.UNKNOWN;
		this.source = source || null;
	};

	/**
	 * exception thrown if some function finds an invalid observer
	 * @constructor
	 * @extends {unilib.error.UnilibError}
	 * @param {?unilib.mvc.Observable} source where exception raised, 
	 * 	null if not raised by an Observable 
	 * @param {string=} message error message
	 */
	unilib.mvc.InvalidObserverError = function(source, message) {
		this.source = source;
		this.message = message || 'Invalid observer';
	};
	unilib.mvc.InvalidObserverError.prototype = new unilib.error.UnilibError();
}, ['unilib/error.js']);

