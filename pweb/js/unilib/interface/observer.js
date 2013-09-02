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
	 * enumeration for ObserverEvent types
	 * @enum {number}
	 */
	unilib.interfaces.observer.ObserverEventType = {
		UNKNOWN: -1,
		UPDATE: 0,
		REMOVE: 1,
		ADD: 2,
		COMPOSITE: 3
	};

	/**
	 * base event for communication between observable and observer
	 * @class
	 * @abstract
	 */
	unilib.interfaces.observer.ObserverEvent = function() {
	};
	
	/**
	 * getter for the type of event
	 * @abstract
	 * @returns {unilib.interfaces.observer.ObserverEventType}
	 */
	unilib.interfaces.observer.ObserverEvent.prototype.getType = function() {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * getter for the source of the event
	 * @abstract
	 * @returns {?object}
	 */
	unilib.interfaces.observer.ObserverEvent.prototype.getSource = function() {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * get an iterator over all composite events
	 * @abstract
	 * @returns {unilib.interfaces.iterator.Iterator}
	 */
	unilib.interfaces.observer.ObserverEvent.prototype.getEventIterator = 
		function() {
		throw new unilib.error.AbstractMethodError();
	};
	
	/**
	 * set event type
	 * @abstract
	 * @param {unilib.interfaces.observer.ObserverEventType} type
	 */
	unilib.interfaces.observer.ObserverEvent.prototype.setType = 
		function(type) {
		throw new unilib.error.AbstractMethodError();
	};
	
	
	/**
	 * event for communication between observable and observer
	 * @class
	 * @extends {unilib.interfaces.observer.ObserverEvent}
	 * @param {unilib.interfaces.observer.ObserverEventType=} eventType 
	 * 	type of event
	 * @param {object=} source source of the notification
	 */
	unilib.interfaces.observer.SimpleObserverEvent = 
		function(eventType, source) {
		/**
		 * event type
		 * @type {unilib.interfaces.observer.ObserverEventType}
		 * @private
		 */
		this.eventType_ = (eventType == undefined) ? 
				unilib.interfaces.observer.ObserverEventType.UNKNOWN : eventType;
		
		/**
		 * event source
		 * @type {?object}
		 * @private
		 */
		this.source_ = (source == undefined) ? null : source;
	};
	unilib.inherit(unilib.interfaces.observer.SimpleObserverEvent, 
			unilib.interfaces.observer.ObserverEvent.prototype);
	
	/**
	 * @see {unilib.interfaces.observer.ObserverEvent#getType}
	 * @returns {unilib.interfaces.observer.ObserverEventType}
	 */
	unilib.interfaces.observer.SimpleObserverEvent.prototype.getType = 
		function() {
		return this.eventType_;
	};
	
	/**
	 * @see {unilib.interfaces.observer.ObserverEvent#getSource}
	 * @returns {?object}
	 */
	unilib.interfaces.observer.SimpleObserverEvent.prototype.getSource = 
		function() {
		return this.source_;
	};
	
	/**
	 * @see {unilib.interfaces.observer.ObserverEvent#getEventIterator}
	 * @returns {unilib.interfaces.iterator.Iterator}
	 */
	unilib.interfaces.observer.SimpleObserverEvent.prototype.getEventIterator = 
		function() {
		return new unilib.interfaces.iterator.ArrayIterator([this]);
	};
	
	/**
	 * @see {unilib.interfaces.observer.ObserverEvent#setType}
	 * @param {unilib.interfaces.observer.ObserverEventType} type
	 */
	unilib.interfaces.observer.SimpleObserverEvent.prototype.setType = 
		function(type) {
		this.eventType_ = type;
	};
	
	/**
	 * event for communication between observable and observer
	 * @class
	 * @extends {unilib.interfaces.observer.ObserverEvent}
	 */
	unilib.interfaces.observer.CompositeObserverEvent = function() {
		/**
		 * buffer of composite leaf objects
		 * @type {Array.<unilib.interfaces.observer.ObserverEvent>}
		 * @private
		 */
		this.evtBuffer_ = [];
	};
	unilib.inherit(unilib.interfaces.observer.CompositeObserverEvent, 
			unilib.interfaces.observer.ObserverEvent.prototype);

	/**
	 * @see {unilib.interfaces.observer.ObserverEvent#getType}
	 * @returns {unilib.interfaces.observer.ObserverEventType}
	 */
	unilib.interfaces.observer.CompositeObserverEvent.prototype.getType = 
		function() {
		return unilib.interfaces.observer.ObserverEventType.COMPOSITE;
	};
	
	/**
	 * @see {unilib.interfaces.observer.ObserverEvent#getSource}
	 * @returns {?object}
	 */
	unilib.interfaces.observer.CompositeObserverEvent.prototype.getSource = 
		function() {
		return null;
	};
	
	/**
	 * @see {unilib.interfaces.observer.ObserverEvent#getEventIterator}
	 * @returns {unilib.interfaces.iterator.Iterator}
	 */
	unilib.interfaces.observer.CompositeObserverEvent.
		prototype.getEventIterator = function() {
		return new unilib.interfaces.iterator.ArrayIterator(this.evtBuffer_);
	};
	
	/**
	 * @see {unilib.interfaces.observer.ObserverEvent#setType}
	 * @param {unilib.interfaces.observer.ObserverEventType} type
	 */
	unilib.interfaces.observer.CompositeObserverEvent.prototype.setType = 
		function(type) {
		//do nothing
		return;
	};
	
	/**
	 * helper function that checks if sources of two events match
	 * @param {unilib.interfaces.observer.ObserverEvent} evt1
	 * @param {unilib.interfaces.observer.ObserverEvent} evt2
	 * @returns {boolean}
	 * @private
	 */
	unilib.interfaces.observer.CompositeObserverEvent.prototype.evtSourceMatch_ =
		function(evt1, evt2) {
		return evt1.getSource() == evt2.getSource();
	};
	
	/**
	 * handle notification conflicts among notifications.
	 * Conflicting notifications:
	 * i) occur only with notifications with same source
	 * i.i) REMOVE notification deletes all other notifications from
	 * 	that object since ADD or UPDATES are rendered useless by the removal but
	 * 	REMOVE event is added to the buffer.
	 * i.ii) ADD after a REMOVE is changed to an UPDATE since some changes may
	 * 	have been made while the element was removed
	 * i.iii) UPDATE after an ADD is ignored since the ADD event is supposed to
	 * 	cause a full read of the state of the element added
	 * i.iv) UPDATE after a REMOVE is illegal, causes exception
	 * i.v) ADD after an UPDATE is illegal, causes exception
	 * i.vi) in case of same event present in buffer evt is ignored
	 * ii) due to this handling only a resulting event is kept in the buffer
	 * 	for each source
	 * @param {unilib.interfaces.observer.ObserverEvent} evt
	 * @returns {boolean} true if the evt passed should be added to the buffer
	 * @private
	 */
	unilib.interfaces.observer.CompositeObserverEvent.
			prototype.handleConflicts_ = function(evt) {
		var i = 0;
		var keepEvt = true; //tells if evt should be added to the buffer
		while (i < this.evtBuffer_.length) {
			/* (see other notes on break below)
			 * note: for reason (ii) after having found a match the cycle breaks
			 * since no other event can be in the buffer with the same source.
			 */
			// if (i) is true: check for conflicts
			if (this.evtSourceMatch_(this.evtBuffer_[i], evt)) {
				switch (evt.getType()) {
				//if (i.vi)
				case this.evtBuffer_[i].getType():
				  //same event is already in the buffer, ignore
					keepEvt = false;
					break;
				//if (i.i) REMOVE
				case unilib.interfaces.observer.ObserverEventType.REMOVE:
					//remove events from notifications buffer
					this.evtBuffer_.splice(i, 1);
					break;
				//if (i.ii) || (i.v) ADD after REMOVE or UPDATE
				case unilib.interfaces.observer.ObserverEventType.ADD:
					switch (this.evtBuffer_[i].getType()) {
					//if (i.ii) ADD after REMOVE
					case unilib.interfaces.observer.ObserverEventType.REMOVE:
						//change to UPDATE
						this.evtBuffer_[i].setType( 
							unilib.interfaces.observer.ObserverEventType.UPDATE);
						//note that this UPDATE event can not be duplicate in the buffer
						//because of (i.i) and (i.iv)
						keepEvt = false;
						break;
					//if (i.v) ADD after UPDATE
					case unilib.interfaces.observer.ObserverEventType.UPDATE:
						//illegal
						throw new unilib.interfaces.observer.ObserverEventError(this, 
								'Illegal event found: ADD after UPDATE');
						break; //useless but included for readability
					}
					break;
				//if (i.iii) || (i.iv) UPDATE after ADD or REMOVE
				case unilib.interfaces.observer.ObserverEventType.UPDATE:
					switch (this.evtBuffer_[i].getType()) {
					//if (i.iii) UPDATE after ADD
					case unilib.interfaces.observer.ObserverEventType.ADD:
						//ignore
						keepEvt = false;
						break;
					//if (i.iv) UPDATE after REMOVE
					case unilib.interfaces.observer.ObserverEventType.REMOVE:
						//illegal
						throw new unilib.interfaces.observer.ObserverEventError(this,
								'Illegal event: UPDATE after REMOVE');
						break; //useless  but included for readability
					}
					break; //useless  but included for readability
				}
			/* break while cycle since it has been found a correspondence in
			 * the event buffer.
			 * For reason (ii) after having found a match the cycle breaks
			 * since no other event can be in the buffer with the same source.
			 */
			break; 
			}
			i++;
		}
		return keepEvt;
	};
	
	/**
	 * add an event object to the buffer, for a simpler behaviour this function
	 * forbids the addition of composite events, since checking conflicts would
	 * become unnecessarily difficult.
	 * @param {unilib.interfaces.observer.SimpleObserverEvent}
	 * @throw {unilib.interfaces.observer.ObserverEventError}
	 */
	unilib.interfaces.observer.CompositeObserverEvent.prototype.addEvent = 
		function(evt) {
		if (evt == undefined) {
			throw new unilib.interfaces.observer.ObserverEventError(this, 
			'Invalid ObserverEvent instance to be added');
		}
		if (evt.getType() == 
				unilib.interfaces.observer.ObserverEventType.COMPOSITE) {
			throw new unilib.interfaces.observer.ObserverEventError(this, 
					'Forbidden to add COMPOSITE event to composite');
		}
		var addEvt = this.handleConflicts_(evt);
		if (addEvt) this.evtBuffer_.push(evt);
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
	
	/**
	 * exception thrown if something goes wrong with an ObserverEvent
	 * @class
	 * @extends {unilib.error.UnilibError}
	 * @param {unilib.interfaces.observer.ObserverEvent} source where
	 * 	exception raised
	 * @param {string=} message error message
	 */
	unilib.interfaces.observer.ObserverEventError = function(source, message) {
		this.source = source;
		this.message = message || 'ObserverEvent error';
	};
	unilib.inherit(unilib.interfaces.observer.ObserverEventError,
		unilib.error.UnilibError.prototype);
	
	/**
	 * override toString method
	 * @returns {string}
	 */
	unilib.interfaces.observer.ObserverEventError.prototype.toString = 
		function() {
		var typeString = '';
		switch (this.source.getType()) {
		case unilib.interfaces.observer.ObserverEventType.ADD:
			typeString = 'ADD';
			break;
		case unilib.interfaces.observer.ObserverEventType.REMOVE:
			typeString = 'REMOVE';
			break;
		case unilib.interfaces.observer.ObserverEventType.UPDATE:
			typeString = 'UPDATE';
			break;
		case unilib.interfaces.observer.ObserverEventType.COMPOSITE:
			typeString = 'COMPOSITE';
			break;
		default:
			typeString = 'UNKNOWN';	
		}
		return this.message + ' on ' + typeString + 
			' event, src: ' + this.source.getSource();  
	};
}, ['unilib/error.js', 'unilib/interface/iterator.js']);

unilib.notifyLoaded();